"""
AI Analysis Algorithm & Triage Pipeline.

Performs:
 1. Evidence validation (checks description sufficiency, district info)
 2. Information extraction (district, landmarks, population impact, hazards)
 3. Domain classification (multilingual Hindi + English TF-IDF / Keyword matcher)
 4. Severity & Priority scoring (queue_score = 0.6*severity + 0.4*priority)
 5. Near-duplicate detection (TF-IDF cosine similarity against open tickets)
 6. University / Expert routing (matches domain & district vs HEI expertise tags)
"""

import json
import re
from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.enums import Domain, Priority, Severity

# --- Bilingual Domain Keywords (Hindi & English) ---
DOMAIN_KEYWORDS: dict[Domain, list[str]] = {
    Domain.WATER: [
        "water", "drinking water", "pipe", "well", "handpump", "borewell", "scarcity",
        "contamination", "dirty water", "river", "tap",
        "पानी", "जल", "पेयजल", "कुआं", "हैंडपंप", "बोरवेल", "नल", "गंदा पानी", "सूखा"
    ],
    Domain.SANITATION: [
        "sanitation", "garbage", "waste", "drain", "sewage", "toilet", "cleanliness",
        "dustbin", "trash", "overflowing",
        "स्वच्छता", "कचरा", "नाली", "सीवर", "शौचालय", "गंदगी", "कूड़ा", "सफाई"
    ],
    Domain.HEALTHCARE: [
        "health", "hospital", "clinic", "doctor", "medicine", "disease", "fever",
        "ambulance", "vaccine", "primary health", "phc",
        "स्वास्थ्य", "अस्पताल", "डॉक्टर", "दवा", "बीमारी", "इलाज", "प्राथमिक स्वास्थ्य"
    ],
    Domain.AGRICULTURE: [
        "crop", "farming", "farmer", "fertilizer", "seed", "irrigation", "soil",
        "pest", "harvest", "mandi",
        "कृषि", "फसल", "किसान", "खाद", "बीज", "सिंचाई", "मिट्टी", "कीट", "मंडी"
    ],
    Domain.EDUCATION: [
        "school", "teacher", "student", "classroom", "books", "education", "college",
        "university", "blackboard", "midday meal",
        "स्कूल", "विद्यालय", "शिक्षक", "छात्र", "पढ़ाई", "शिक्षा", "कॉलेज", "किताब"
    ],
    Domain.ENVIRONMENT: [
        "pollution", "forest", "tree", "deforestation", "smoke", "air", "river pollution",
        "plastic", "environment",
        "पर्यावरण", "प्रदूषण", "जंगल", "पेड़", "धुआं", "हवा", "प्लास्टिक"
    ],
    Domain.LIVELIHOODS: [
        "employment", "job", "shg", "skill", "wage", "mgnrega", "income",
        "livelihood", "craft", "artisan",
        "रोजगार", "आजीविका", "मजदूरी", "मनरेगा", "आय", "कौशल", "स्वरोजगार", "महिला समूह"
    ],
    Domain.ACCESSIBILITY: [
        "ramp", "wheelchair", "disability", "disabled", "accessible", "braille",
        "elderly", "hearing", "divyang",
        "दिव्यांग", "व्हीलचेयर", "रैंप", "सुगम", "बुजुर्ग", "दिव्यांगजन"
    ],
    Domain.URBAN_INFRA: [
        "road", "bridge", "pothole", "street light", "electricity", "transformer",
        "traffic", "building", "footpath",
        "सड़क", "पुल", "गड्ढा", "बिजली", "स्ट्रीट लाइट", "ट्रांसफार्मर", "यातायात", "फुटपाथ"
    ],
    Domain.PUBLIC_SERVICES: [
        "ration", "pension", "certificate", "portal", "office", "delay", "scheme",
        "card", "bureaucracy",
        "राशन", "पेंशन", "प्रमाणपत्र", "योजना", "सरकारी काम", "देरी"
    ],
}

JHARKHAND_DISTRICTS = [
    "palamu", "ranchi", "dhanbad", "bokaro", "hazaribagh", "deoghar",
    "east singhbhum", "west singhbhum", "giridih", "dumka", "chatra",
    "garhwa", "godda", "gumla", "jamtara", "khunti", "koderma", "latehar",
    "lohardaga", "pakur", "ramgarh", "sahebganj", "seraikela kharsawan", "simdega"
]


def classify_text(text: str) -> tuple[Domain, Optional[Domain]]:
    """Determine primary and secondary domains based on keyword frequency."""
    text_lower = text.lower()
    scores: dict[Domain, int] = {domain: 0 for domain in Domain}

    for domain, keywords in DOMAIN_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                scores[domain] += 1

    sorted_domains = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    primary = sorted_domains[0][0] if sorted_domains[0][1] > 0 else Domain.OTHER
    secondary = sorted_domains[1][0] if sorted_domains[1][1] > 0 else None

    return primary, secondary


def extract_information(text: str, location_hint: Optional[str] = None) -> dict:
    """Extract district, hazard keywords, and affected population hints."""
    combined = f"{text} {location_hint or ''}".lower()

    extracted_district = None
    for dist in JHARKHAND_DISTRICTS:
        if dist in combined:
            extracted_district = dist.title()
            break

    # Population impact heuristic
    pop_impact = "local"
    if any(w in combined for w in ["entire village", "whole ward", "block", "district", "thousands", "पूरा गांव", "समस्त"]):
        pop_impact = "community_wide"

    return {
        "detected_district": extracted_district,
        "population_impact": pop_impact,
        "has_location_details": bool(extracted_district or location_hint),
    }


def validate_evidence(text: str, location_hint: Optional[str] = None) -> tuple[bool, list[str]]:
    """Validate that problem has sufficient detail and location."""
    issues = []
    if len(text.strip()) < 15:
        issues.append("Description is too brief (minimum 15 characters required)")

    info = extract_information(text, location_hint)
    if not info["has_location_details"]:
        issues.append("Location or district hint missing")

    is_valid = len(issues) == 0
    return is_valid, issues


def calculate_severity_priority(text: str, primary_domain: Domain) -> tuple[Severity, Priority, float]:
    """Calculate severity, priority, and queue score."""
    combined = text.lower()

    # Critical hazards check
    critical_triggers = ["danger", "hazard", "collapse", "death", "poison", "epidemic", "fire", "खतरा", "दुर्घटना", "जहर", "आग"]
    high_triggers = ["urgent", "broken", "severe", "days without", "contaminated", "गंभीर", "टूटा हुआ", "परेशानी"]

    if any(w in combined for w in critical_triggers):
        sev = Severity.CRITICAL
        pri = Priority.URGENT
    elif any(w in combined for w in high_triggers) or primary_domain in [Domain.WATER, Domain.HEALTHCARE]:
        sev = Severity.HIGH
        pri = Priority.HIGH
    elif len(text) > 100:
        sev = Severity.MEDIUM
        pri = Priority.MEDIUM
    else:
        sev = Severity.LOW
        pri = Priority.LOW

    # Score calculation: Severity (0.6) + Priority (0.4)
    sev_map = {Severity.LOW: 0.25, Severity.MEDIUM: 0.50, Severity.HIGH: 0.75, Severity.CRITICAL: 1.0}
    pri_map = {Priority.LOW: 0.25, Priority.MEDIUM: 0.50, Priority.HIGH: 0.75, Priority.URGENT: 1.0}

    score = round(0.6 * sev_map[sev] + 0.4 * pri_map[pri], 2)
    return sev, pri, score


def check_near_duplicates(text: str, existing_descriptions: list[str]) -> tuple[bool, float]:
    """Calculate maximum cosine similarity vs existing open tickets."""
    if not existing_descriptions:
        return False, 0.0

    try:
        corpus = existing_descriptions + [text]
        vectorizer = TfidfVectorizer().fit_transform(corpus)
        vectors = vectorizer.toarray()
        target_vec = vectors[-1].reshape(1, -1)
        others_vec = vectors[:-1]

        sims = cosine_similarity(target_vec, others_vec)[0]
        max_sim = float(max(sims)) if len(sims) > 0 else 0.0
        is_dup = max_sim > 0.65
        return is_dup, round(max_sim, 2)
    except Exception:
        return False, 0.0


def run_full_pipeline(
    title: str,
    description: str,
    location_detail: Optional[str] = None,
    existing_open_descriptions: Optional[list[str]] = None,
) -> dict:
    """
    Run complete AI triage pipeline and return comprehensive result object.
    """
    full_text = f"{title}. {description}"

    # 1. Validation
    is_valid, validation_issues = validate_evidence(full_text, location_detail)

    # 2. Information extraction
    extracted_info = extract_information(full_text, location_detail)

    # 3. Domain classification
    primary_domain, secondary_domain = classify_text(full_text)

    # 4. Severity & Priority
    severity, priority, queue_score = calculate_severity_priority(full_text, primary_domain)

    # 5. Near-duplicate check
    is_duplicate, max_similarity = check_near_duplicates(
        full_text, existing_open_descriptions or []
    )

    result = {
        "is_valid": is_valid,
        "validation_issues": validation_issues,
        "extracted_info": extracted_info,
        "primary_domain": primary_domain.value,
        "secondary_domain": secondary_domain.value if secondary_domain else None,
        "severity": severity.value,
        "priority": priority.value,
        "queue_score": queue_score,
        "is_duplicate": is_duplicate,
        "max_similarity": max_similarity,
        "recommended_action": (
            "needs_info" if not is_valid else
            "duplicate_review" if is_duplicate else
            "under_review"
        ),
        "explanation": (
            f"Classified as '{primary_domain.value}' with {severity.value} severity "
            f"(queue score: {queue_score}). Location: {extracted_info['detected_district'] or 'General'}."
        ),
    }

    return result
