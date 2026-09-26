from __future__ import annotations

DOMAINS = [
    "education",
    "agriculture",
    "healthcare",
    "water_resources",
    "sanitation",
    "environment",
    "energy",
    "urban_development",
    "accessibility",
    "public_administration",
    "rural_livelihoods",
]

REPORTER_ROLES = ["citizen", "community_org", "pri", "ulb"]
SOLVER_ROLES = ["university", "industry", "govt"]
ALL_ROLES = REPORTER_ROLES + SOLVER_ROLES

SIMPLE_UI_ROLES = set(REPORTER_ROLES)

TICKET_STATUSES = [
    "draft",
    "submitted",
    "ai_processed",
    "needs_info",
    "duplicate_review",
    "under_review",
    "accepted",
    "assigned",
    "in_progress",
    "piloting",
    "validated",
    "pending_feedback",
    "closed",
    "rejected",
    "escalated_official",
    "duplicate",
]

DISTRICTS = [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahebganj",
    "Seraikela Kharsawan",
    "Simdega",
    "West Singhbhum",
]

# Higher = more deprivation heuristic for severity (illustrative, not official).
DISTRICT_DEPRIVATION = {
    "Palamu": 4,
    "Garhwa": 4,
    "Chatra": 4,
    "Latehar": 4,
    "Pakur": 4,
    "Sahebganj": 4,
    "Godda": 3,
    "Dumka": 3,
    "Simdega": 3,
    "Gumla": 3,
    "Khunti": 3,
    "West Singhbhum": 3,
    "Lohardaga": 3,
    "Jamtara": 3,
    "Giridih": 3,
    "Deoghar": 2,
    "Hazaribagh": 2,
    "Koderma": 2,
    "Ramgarh": 2,
    "Bokaro": 2,
    "Dhanbad": 2,
    "Seraikela Kharsawan": 2,
    "East Singhbhum": 1,
    "Ranchi": 1,
}

INDUSTRY_ORG_TYPES = [
    "industry",
    "startup",
    "msme",
    "csr",
    "research_lab",
    "innovation_hub",
]

OFFICIAL_PORTALS = [
    {
        "id": "spgrms",
        "name": "SPGRMS (Jharkhand public grievance)",
        "url": "https://jharkhand.gov.in/",
    },
    {
        "id": "cpgrams",
        "name": "CPGRAMS / PMO grievance",
        "url": "https://pgportal.gov.in/",
    },
    {
        "id": "ipgrs",
        "name": "IPGRS",
        "url": "https://www.pgportal.gov.in/",
    },
    {
        "id": "pgms",
        "name": "PGMS / departmental grievance",
        "url": "https://pgportal.gov.in/",
    },
]

MILESTONE_TEMPLATES = [
    "problem_framing",
    "prototype",
    "testing",
    "pilot",
    "validation",
    "handover",
]
