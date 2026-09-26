"""
Shared domain enums — single source of truth for the API.

Keep in sync with apps/web/src/lib/enums.ts (TypeScript mirror).
"""

from enum import Enum


class Role(str, Enum):
    """User roles. Determines UI density and permissions."""

    CITIZEN = "citizen"
    COMMUNITY_ORG = "community_org"
    PRI = "pri"  # Panchayati Raj Institution
    ULB = "ulb"  # Urban Local Body
    UNIVERSITY = "university"
    INDUSTRY = "industry"
    GOVT = "govt"


class UIDensity(str, Enum):
    """Derived from role — never sent by the client."""

    SIMPLE = "simple"  # citizen, community_org, pri, ulb
    DETAILED = "detailed"  # university, industry, govt


# Mapping: role → UI density
ROLE_DENSITY: dict[Role, UIDensity] = {
    Role.CITIZEN: UIDensity.SIMPLE,
    Role.COMMUNITY_ORG: UIDensity.SIMPLE,
    Role.PRI: UIDensity.SIMPLE,
    Role.ULB: UIDensity.SIMPLE,
    Role.UNIVERSITY: UIDensity.DETAILED,
    Role.INDUSTRY: UIDensity.DETAILED,
    Role.GOVT: UIDensity.DETAILED,
}


class TicketStatus(str, Enum):
    """
    Ticket lifecycle (PRD source of truth):
    draft → submitted → ai_processed → needs_info | duplicate_review
    → under_review → accepted → in_progress → pending_feedback → closed

    Also: rejected, escalated_official
    """

    DRAFT = "draft"
    SUBMITTED = "submitted"
    AI_PROCESSED = "ai_processed"
    NEEDS_INFO = "needs_info"
    DUPLICATE_REVIEW = "duplicate_review"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    PENDING_FEEDBACK = "pending_feedback"
    CLOSED = "closed"
    REJECTED = "rejected"
    ESCALATED_OFFICIAL = "escalated_official"


# Valid transitions — enforced by the ticket state machine
TICKET_TRANSITIONS: dict[TicketStatus, list[TicketStatus]] = {
    TicketStatus.DRAFT: [TicketStatus.SUBMITTED],
    TicketStatus.SUBMITTED: [TicketStatus.AI_PROCESSED],
    TicketStatus.AI_PROCESSED: [
        TicketStatus.NEEDS_INFO,
        TicketStatus.DUPLICATE_REVIEW,
        TicketStatus.UNDER_REVIEW,
    ],
    TicketStatus.NEEDS_INFO: [TicketStatus.SUBMITTED],  # resubmit after adding info
    TicketStatus.DUPLICATE_REVIEW: [
        TicketStatus.UNDER_REVIEW,
        TicketStatus.REJECTED,
    ],
    TicketStatus.UNDER_REVIEW: [
        TicketStatus.ACCEPTED,
        TicketStatus.REJECTED,
        TicketStatus.ESCALATED_OFFICIAL,
    ],
    TicketStatus.ACCEPTED: [TicketStatus.IN_PROGRESS],
    TicketStatus.IN_PROGRESS: [
        TicketStatus.PENDING_FEEDBACK,
        TicketStatus.ESCALATED_OFFICIAL,
    ],
    TicketStatus.PENDING_FEEDBACK: [
        TicketStatus.CLOSED,
        TicketStatus.IN_PROGRESS,  # citizen says "not fixed"
    ],
    TicketStatus.CLOSED: [],  # terminal
    TicketStatus.REJECTED: [],  # terminal
    TicketStatus.ESCALATED_OFFICIAL: [
        TicketStatus.PENDING_FEEDBACK,
        TicketStatus.CLOSED,
    ],
}


class Domain(str, Enum):
    """Problem domains for AI classification."""

    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    AGRICULTURE = "agriculture"
    WATER = "water"
    SANITATION = "sanitation"
    ENVIRONMENT = "environment"
    LIVELIHOODS = "livelihoods"
    ACCESSIBILITY = "accessibility"
    URBAN_INFRA = "urban_infrastructure"
    PUBLIC_SERVICES = "public_services"
    OTHER = "other"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
