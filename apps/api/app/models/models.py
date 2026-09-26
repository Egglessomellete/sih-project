"""
SQLAlchemy ORM models — User and Ticket (core MVP tables).
"""

import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.enums import Domain, Priority, Role, Severity, TicketStatus


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(SAEnum(Role), default=Role.CITIZEN)

    # --- Institution / solver profile (nullable for citizens) ---
    organization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    expertise_tags: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # comma-separated for MVP
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # --- Flags ---
    first_login: Mapped[bool] = mapped_column(default=True)
    is_active: Mapped[bool] = mapped_column(default=True)

    # --- Timestamps ---
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # --- Relationships ---
    submitted_tickets: Mapped[list["Ticket"]] = relationship(
        back_populates="reporter", foreign_keys="Ticket.reporter_id"
    )
    assigned_tickets: Mapped[list["Ticket"]] = relationship(
        back_populates="assignee", foreign_keys="Ticket.assignee_id"
    )


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ticket_id: Mapped[str] = mapped_column(
        String(30), unique=True, index=True
    )  # e.g. JH-PAL-2026-0042

    # --- Problem intake ---
    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str] = mapped_column(Text)
    location_district: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    location_detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    media_paths: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # JSON array of file paths

    # --- Classification (written by AI pipeline) ---
    domain: Mapped[Optional[Domain]] = mapped_column(
        SAEnum(Domain), nullable=True
    )
    secondary_domain: Mapped[Optional[Domain]] = mapped_column(
        SAEnum(Domain), nullable=True
    )
    severity: Mapped[Optional[Severity]] = mapped_column(
        SAEnum(Severity), nullable=True
    )
    priority: Mapped[Optional[Priority]] = mapped_column(
        SAEnum(Priority), nullable=True
    )
    queue_score: Mapped[Optional[float]] = mapped_column(nullable=True)
    analysis_json: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # full AI output
    model_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # --- Status ---
    status: Mapped[TicketStatus] = mapped_column(
        SAEnum(TicketStatus), default=TicketStatus.DRAFT
    )

    # --- People ---
    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    assignee_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )

    # --- Feedback ---
    feedback_resolved: Mapped[Optional[bool]] = mapped_column(nullable=True)
    feedback_quality: Mapped[Optional[int]] = mapped_column(nullable=True)  # 1-5
    feedback_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # --- Escalation ---
    escalation_json: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # EscalationPacket

    # --- Timestamps ---
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    closed_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # --- Relationships ---
    reporter: Mapped["User"] = relationship(
        back_populates="submitted_tickets", foreign_keys=[reporter_id]
    )
    assignee: Mapped[Optional["User"]] = relationship(
        back_populates="assigned_tickets", foreign_keys=[assignee_id]
    )
