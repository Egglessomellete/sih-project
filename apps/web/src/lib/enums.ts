/**
 * Shared domain enums — TypeScript mirror of apps/api/app/enums.py
 * Keep in sync!
 */

export enum Role {
  CITIZEN = "citizen",
  COMMUNITY_ORG = "community_org",
  PRI = "pri",
  ULB = "ulb",
  UNIVERSITY = "university",
  INDUSTRY = "industry",
  GOVT = "govt",
}

export enum UIDensity {
  SIMPLE = "simple",
  DETAILED = "detailed",
}

export const ROLE_DENSITY: Record<Role, UIDensity> = {
  [Role.CITIZEN]: UIDensity.SIMPLE,
  [Role.COMMUNITY_ORG]: UIDensity.SIMPLE,
  [Role.PRI]: UIDensity.SIMPLE,
  [Role.ULB]: UIDensity.SIMPLE,
  [Role.UNIVERSITY]: UIDensity.DETAILED,
  [Role.INDUSTRY]: UIDensity.DETAILED,
  [Role.GOVT]: UIDensity.DETAILED,
};

export enum TicketStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  AI_PROCESSED = "ai_processed",
  NEEDS_INFO = "needs_info",
  DUPLICATE_REVIEW = "duplicate_review",
  UNDER_REVIEW = "under_review",
  ACCEPTED = "accepted",
  IN_PROGRESS = "in_progress",
  PENDING_FEEDBACK = "pending_feedback",
  CLOSED = "closed",
  REJECTED = "rejected",
  ESCALATED_OFFICIAL = "escalated_official",
}

export enum Domain {
  EDUCATION = "education",
  HEALTHCARE = "healthcare",
  AGRICULTURE = "agriculture",
  WATER = "water",
  SANITATION = "sanitation",
  ENVIRONMENT = "environment",
  LIVELIHOODS = "livelihoods",
  ACCESSIBILITY = "accessibility",
  URBAN_INFRA = "urban_infrastructure",
  PUBLIC_SERVICES = "public_services",
  OTHER = "other",
}

export enum Severity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export const DOMAIN_LABELS: Record<Domain, { en: string; hi: string }> = {
  [Domain.EDUCATION]: { en: "Education", hi: "शिक्षा" },
  [Domain.HEALTHCARE]: { en: "Healthcare", hi: "स्वास्थ्य सेवा" },
  [Domain.AGRICULTURE]: { en: "Agriculture", hi: "कृषि" },
  [Domain.WATER]: { en: "Water", hi: "जल एवं पेयजल" },
  [Domain.SANITATION]: { en: "Sanitation", hi: "स्वच्छता" },
  [Domain.ENVIRONMENT]: { en: "Environment", hi: "पर्यावरण" },
  [Domain.LIVELIHOODS]: { en: "Livelihoods", hi: "आजीविका" },
  [Domain.ACCESSIBILITY]: { en: "Accessibility", hi: "दिव्यांग सुगमता" },
  [Domain.URBAN_INFRA]: { en: "Urban Infrastructure", hi: "शहरी बुनियादी ढांचा" },
  [Domain.PUBLIC_SERVICES]: { en: "Public Services", hi: "सार्वजनिक सेवाएं" },
  [Domain.OTHER]: { en: "Other", hi: "अन्य" },
};

export const STATUS_LABELS: Record<TicketStatus, { en: string; hi: string }> = {
  [TicketStatus.DRAFT]: { en: "Draft", hi: "ड्राफ्ट" },
  [TicketStatus.SUBMITTED]: { en: "Submitted", hi: "जमा किया गया" },
  [TicketStatus.AI_PROCESSED]: { en: "AI Triaged", hi: "एआई द्वारा विश्लेषित" },
  [TicketStatus.NEEDS_INFO]: { en: "Needs Information", hi: "जानकारी आवश्यक" },
  [TicketStatus.DUPLICATE_REVIEW]: { en: "Under Duplicate Review", hi: "पुनरावृत्ति समीक्षा" },
  [TicketStatus.UNDER_REVIEW]: { en: "Under Review", hi: "समीक्षाधीन" },
  [TicketStatus.ACCEPTED]: { en: "Accepted", hi: "स्वीकृत" },
  [TicketStatus.IN_PROGRESS]: { en: "In Progress", hi: "प्रगति पर" },
  [TicketStatus.PENDING_FEEDBACK]: { en: "Pending Citizen Feedback", hi: "आपकी प्रतिक्रिया की प्रतीक्षा" },
  [TicketStatus.CLOSED]: { en: "Closed & Solved", hi: "समाधानित एवं बंद" },
  [TicketStatus.REJECTED]: { en: "Rejected", hi: "अस्वीकृत" },
  [TicketStatus.ESCALATED_OFFICIAL]: { en: "Escalated to Official Portal", hi: "शासकीय पोर्टल पर प्रेषित" },
};
