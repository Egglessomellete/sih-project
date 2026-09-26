"""
Tickets Router — Problem intake, AI triage execution, ticket lifecycle state machine,
feedback loop, and official grievance escalation packet generation.
"""

import datetime
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.enums import (
    ROLE_DENSITY,
    TICKET_TRANSITIONS,
    Domain,
    Priority,
    Role,
    Severity,
    TicketStatus,
    UIDensity,
)
from app.models.models import Ticket, User
from app.schemas.ticket import (
    ClassifyPlaygroundRequest,
    TicketCreate,
    TicketFeedback,
    TicketResponse,
    TicketStatusUpdate,
)
from app.services.ai_pipeline import run_full_pipeline
from app.services.auth import get_current_user
from app.services.upload import save_upload_file

router = APIRouter(prefix="/tickets", tags=["tickets"])


def generate_ticket_id(db: Session, district: Optional[str] = None) -> str:
    """Generate human-readable ticket ID like JH-PAL-2026-0042."""
    year = datetime.datetime.now().year
    dist_code = (district or "GEN")[:3].upper()

    count = db.query(Ticket).count() + 1
    return f"JH-{dist_code}-{year}-{count:04d}"


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a problem. Runs synchronous AI analysis, validates evidence,
    classifies domain/severity, and creates a ticket.
    """
    # 1. Fetch existing open descriptions for duplicate check
    open_tickets = db.query(Ticket).filter(
        Ticket.status.notin_([TicketStatus.CLOSED, TicketStatus.REJECTED])
    ).all()
    open_descriptions = [f"{t.title}. {t.description}" for t in open_tickets]

    # 2. Run AI pipeline
    ai_result = run_full_pipeline(
        title=data.title,
        description=data.description,
        location_detail=data.location_detail or data.location_district,
        existing_open_descriptions=open_descriptions,
    )

    # 3. Determine initial status
    initial_status = TicketStatus.SUBMITTED
    if not ai_result["is_valid"]:
        initial_status = TicketStatus.NEEDS_INFO
    elif ai_result["is_duplicate"]:
        initial_status = TicketStatus.DUPLICATE_REVIEW
    else:
        initial_status = TicketStatus.UNDER_REVIEW

    # 4. Generate Ticket ID
    district = data.location_district or ai_result["extracted_info"]["detected_district"] or "JH"
    t_id = generate_ticket_id(db, district)

    # 5. Save to DB
    media_json = json.dumps(data.media_paths) if data.media_paths else None

    ticket = Ticket(
        ticket_id=t_id,
        title=data.title,
        description=data.description,
        location_district=district,
        location_detail=data.location_detail,
        latitude=data.latitude,
        longitude=data.longitude,
        media_paths=media_json,
        domain=Domain(ai_result["primary_domain"]),
        secondary_domain=Domain(ai_result["secondary_domain"]) if ai_result["secondary_domain"] else None,
        severity=Severity(ai_result["severity"]),
        priority=Priority(ai_result["priority"]),
        queue_score=ai_result["queue_score"],
        analysis_json=json.dumps(ai_result),
        model_version=settings.model_version,
        status=initial_status,
        reporter_id=current_user.id,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return TicketResponse.from_orm_ticket(ticket)


@router.get("", response_model=list[TicketResponse])
def list_tickets(
    status_filter: Optional[TicketStatus] = Query(None, alias="status"),
    domain_filter: Optional[Domain] = Query(None, alias="domain"),
    district_filter: Optional[str] = Query(None, alias="district"),
    my_tickets: bool = Query(False),
    assigned_to_me: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List tickets.
    Citizens see their own tickets. Solvers see matching expertise / assigned tickets.
    """
    query = db.query(Ticket)

    # Citizens & PRIs in simple mode by default see their own tickets unless explicit
    is_simple = ROLE_DENSITY.get(current_user.role, UIDensity.SIMPLE) == UIDensity.SIMPLE

    if is_simple or my_tickets:
        query = query.filter(Ticket.reporter_id == current_user.id)
    elif assigned_to_me:
        query = query.filter(Ticket.assignee_id == current_user.id)

    if status_filter:
        query = query.filter(Ticket.status == status_filter)

    if domain_filter:
        query = query.filter(
            or_(Ticket.domain == domain_filter, Ticket.secondary_domain == domain_filter)
        )

    if district_filter:
        query = query.filter(Ticket.location_district == district_filter)

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return [TicketResponse.from_orm_ticket(t) for t in tickets]


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get ticket detail by string ticket_id (e.g. JH-PAL-2026-0001)."""
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found",
        )
    return TicketResponse.from_orm_ticket(ticket)


@router.put("/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    ticket_id: str,
    update: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update ticket status with strict state machine validation.
    Rule: Never auto-close; closure requires citizen feedback or confirmed escalation.
    """
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found",
        )

    # State machine transition check
    allowed = TICKET_TRANSITIONS.get(ticket.status, [])
    if update.status not in allowed and update.status != ticket.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status transition from '{ticket.status.value}' to '{update.status.value}'. "
                f"Allowed transitions: {[s.value for s in allowed]}"
            ),
        )

    # Assignee updates
    if update.assignee_id is not None:
        assignee = db.query(User).filter(User.id == update.assignee_id).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found",
            )
        ticket.assignee_id = assignee.id

    ticket.status = update.status

    if update.status == TicketStatus.CLOSED:
        ticket.closed_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(ticket)
    return TicketResponse.from_orm_ticket(ticket)


@router.post("/{ticket_id}/feedback", response_model=TicketResponse)
def submit_ticket_feedback(
    ticket_id: str,
    feedback: TicketFeedback,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Closed Feedback Loop (PRD Core Requirement).
    Citizen rates fix 1-5 and confirms if solved.
    If resolved=True -> closes ticket.
    If resolved=False -> returns ticket to in_progress.
    """
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found",
        )

    # Only reporter or citizen can provide feedback
    if current_user.id != ticket.reporter_id and current_user.role not in [Role.CITIZEN, Role.PRI, Role.COMMUNITY_ORG]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the ticket reporter or citizen can provide resolution feedback",
        )

    ticket.feedback_resolved = feedback.resolved
    ticket.feedback_quality = feedback.quality
    ticket.feedback_comment = feedback.comment

    if feedback.resolved:
        ticket.status = TicketStatus.CLOSED
        ticket.closed_at = datetime.datetime.now(datetime.timezone.utc)
    else:
        ticket.status = TicketStatus.IN_PROGRESS  # Reopen for solver

    db.commit()
    db.refresh(ticket)
    return TicketResponse.from_orm_ticket(ticket)


@router.post("/{ticket_id}/escalate", response_model=TicketResponse)
def escalate_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Prepares an official Escalation Packet for government portals
    (SPGRMS, CPGRAMS, IPGRS, PGMS) with copyable summary and official links.
    Does not scrape government sites (PRD rule).
    """
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found",
        )

    packet = {
        "ticket_id": ticket.ticket_id,
        "title": ticket.title,
        "district": ticket.location_district,
        "domain": ticket.domain.value if ticket.domain else "General",
        "date_submitted": ticket.created_at.strftime("%Y-%m-%d"),
        "copy_ready_summary": (
            f"GRIEVANCE REGISTRATION SUMMARY\n"
            f"Reference ID: {ticket.ticket_id}\n"
            f"Title: {ticket.title}\n"
            f"District: {ticket.location_district or 'Jharkhand'}\n"
            f"Domain: {ticket.domain.value if ticket.domain else 'General'}\n"
            f"Details: {ticket.description[:300]}..."
        ),
        "official_portals": [
            {
                "name": "SPGRMS — Jharkhand State Public Grievances Portal",
                "url": "https://spgrms.jharkhand.gov.in/",
                "type": "State Government",
            },
            {
                "name": "CPGRAMS — Centralized Public Grievance Redressal",
                "url": "https://pgportal.gov.in/",
                "type": "Central Government",
            },
            {
                "name": "IPGRS — Integrated Public Grievance Redressal System",
                "url": "https://jharkhand.gov.in/",
                "type": "Departmental",
            },
        ],
    }

    ticket.escalation_json = json.dumps(packet)
    ticket.status = TicketStatus.ESCALATED_OFFICIAL

    db.commit()
    db.refresh(ticket)
    return TicketResponse.from_orm_ticket(ticket)


# --- Standalone AI Playground & Upload Endpoints ---

@router.post("/classify-playground", tags=["ai"])
def classify_playground(data: ClassifyPlaygroundRequest):
    """
    Admin / Jury AI Playground for testing triage algorithms live.
    """
    result = run_full_pipeline(
        title=data.title,
        description=data.description,
        location_detail=data.location_detail,
    )
    return result


@router.post("/upload-media", tags=["uploads"])
def upload_media(file: UploadFile = File(...)):
    """Upload media file and return storage path."""
    stored_path = save_upload_file(file)
    return {"file_path": stored_path, "filename": file.filename}
