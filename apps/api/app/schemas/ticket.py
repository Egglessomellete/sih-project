"""
Pydantic schemas for Ticket intake, management, feedback, and official escalation packets.
"""

import json
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.enums import Domain, Priority, Role, Severity, TicketStatus


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=10)
    location_district: Optional[str] = Field(None, max_length=100)
    location_detail: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    media_paths: Optional[list[str]] = Field(default=[], description="List of file paths")


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    assignee_id: Optional[int] = None
    reason: Optional[str] = None


class TicketFeedback(BaseModel):
    resolved: bool = Field(..., description="Did the solver fix the problem?")
    quality: int = Field(..., ge=1, le=5, description="Quality rating from 1 to 5")
    comment: Optional[str] = Field(None, description="Optional feedback comment")


class UserMini(BaseModel):
    id: int
    full_name: str
    role: Role
    organization: Optional[str] = None

    class Config:
        from_attributes = True


class TicketResponse(BaseModel):
    id: int
    ticket_id: str
    title: str
    description: str
    location_district: Optional[str] = None
    location_detail: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    media_paths: Optional[list[str]] = None

    # AI Classification
    domain: Optional[Domain] = None
    secondary_domain: Optional[Domain] = None
    severity: Optional[Severity] = None
    priority: Optional[Priority] = None
    queue_score: Optional[float] = None
    analysis_json: Optional[dict[str, Any]] = None
    model_version: Optional[str] = None

    # Workflow & Roles
    status: TicketStatus
    reporter_id: int
    assignee_id: Optional[int] = None
    reporter: Optional[UserMini] = None
    assignee: Optional[UserMini] = None

    # Feedback
    feedback_resolved: Optional[bool] = None
    feedback_quality: Optional[int] = None
    feedback_comment: Optional[str] = None

    # Escalation
    escalation_json: Optional[dict[str, Any]] = None

    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_ticket(cls, ticket):
        media_list = []
        if ticket.media_paths:
            try:
                media_list = json.loads(ticket.media_paths)
            except Exception:
                media_list = [ticket.media_paths]

        analysis_dict = None
        if ticket.analysis_json:
            try:
                analysis_dict = json.loads(ticket.analysis_json)
            except Exception:
                analysis_dict = {}

        escalation_dict = None
        if ticket.escalation_json:
            try:
                escalation_dict = json.loads(ticket.escalation_json)
            except Exception:
                escalation_dict = {}

        return cls(
            id=ticket.id,
            ticket_id=ticket.ticket_id,
            title=ticket.title,
            description=ticket.description,
            location_district=ticket.location_district,
            location_detail=ticket.location_detail,
            latitude=ticket.latitude,
            longitude=ticket.longitude,
            media_paths=media_list,
            domain=ticket.domain,
            secondary_domain=ticket.secondary_domain,
            severity=ticket.severity,
            priority=ticket.priority,
            queue_score=ticket.queue_score,
            analysis_json=analysis_dict,
            model_version=ticket.model_version,
            status=ticket.status,
            reporter_id=ticket.reporter_id,
            assignee_id=ticket.assignee_id,
            reporter=UserMini.from_orm(ticket.reporter) if ticket.reporter else None,
            assignee=UserMini.from_orm(ticket.assignee) if ticket.assignee else None,
            feedback_resolved=ticket.feedback_resolved,
            feedback_quality=ticket.feedback_quality,
            feedback_comment=ticket.feedback_comment,
            escalation_json=escalation_dict,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            closed_at=ticket.closed_at,
        )


class ClassifyPlaygroundRequest(BaseModel):
    title: str
    description: str
    location_detail: Optional[str] = None
