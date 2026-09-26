"""
Seed script — populates SQLite database with sample Jharkhand societal problem tickets.

Usage:
  cd apps/api
  ./venv/bin/python3 ../../data/seed/seed_tickets.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api")))

from app.database import Base, SessionLocal, engine
from app.enums import Domain, Priority, Role, Severity, TicketStatus
from app.models.models import Ticket, User
from app.services.ai_pipeline import run_full_pipeline

SAMPLE_TICKETS = [
    {
        "title": "पलामू के मनातू पंचायत में पेयजल संकट और हैंडपंप खराब (Drinking Water Scarcity in Manatu)",
        "description": "मनातू प्रखंड के वार्ड संख्या 4 में पिछले 3 महीने से मुख्य हैंडपंप खराब पड़ा है। ग्रामीणों को 2 किलोमीटर दूर से पीने का पानी लाना पड़ता है। दूषित पानी के कारण बच्चों में बीमारी फैल रही है। तुरंत बोरवेल मरम्मत या सौर जल मीनार की आवश्यकता है।",
        "district": "Palamu",
        "location_detail": "Ward No. 4, Manatu Panchayat, Palamu",
    },
    {
        "title": "रांची के टाटीसिलवे में स्कूल भवन की जर्जर छत और पेयजल व्यवस्था (Dilapidated School Roof in Tatisilwai)",
        "description": "राजकीय प्राथमिक विद्यालय टाटीसिलवे की छत बरसात में टपकती है। कक्षा 1 से 5 तक के बच्चों को तिरपाल के नीचे बैठना पड़ता है। शौचालय में नल का कनेक्शन नहीं है। विज्ञान लैब और सौर पैनल की सहायता चाहिए।",
        "district": "Ranchi",
        "location_detail": "Government Primary School, Tatisilwai, Ranchi",
    },
    {
        "title": "हजारीबाग में कृषि हेतु जैविक खाद एवं सिंचाई तकनीक की समस्या (Lack of Solar Irrigation for Vegetable Farmers)",
        "description": "विष्णुगढ़ प्रखंड में लघु किसानों को डीजल पंप का भारी खर्च उठाना पड़ता है। सौर ऊर्जा आधारित ड्रिप सिंचाई प्रणाली और जैविक कीट नियंत्रण तकनीक की मांग है ताकि पैदावार बढ़ सके।",
        "district": "Hazaribagh",
        "location_detail": "Bishnugarh Block, Hazaribagh",
    },
    {
        "title": "जमशेदपुर ग्रामीण क्षेत्र में महिला स्वयं सहायता समूह के लिए प्रसंस्करण इकाई (Food Processing Unit for Women SHG)",
        "description": "पटमदा की महिला स्वयं सहायता समूह द्वारा उत्पादित टमाटर एवं इमली का उचित मूल्य नहीं मिल पाता। प्रशीतन गृह (Cold Storage) एवं प्रसंस्करन मशीन की तकनीकी सहायता चाहिए।",
        "district": "East Singhbhum",
        "location_detail": "Patamda Block, East Singhbhum",
    },
]


def seed_tickets():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        citizen_user = db.query(User).filter(User.role == Role.CITIZEN).first()
        uni_user = db.query(User).filter(User.role == Role.UNIVERSITY).first()

        if not citizen_user:
            print("❌ Please run seed_users.py first!")
            return

        created_count = 0
        for idx, tdata in enumerate(SAMPLE_TICKETS):
            existing = db.query(Ticket).filter(Ticket.title == tdata["title"]).first()
            if not existing:
                ai_res = run_full_pipeline(
                    title=tdata["title"],
                    description=tdata["description"],
                    location_detail=tdata["location_detail"],
                )

                t_id = f"JH-{tdata['district'][:3].upper()}-2026-000{idx+1}"

                # First ticket is accepted and assigned to BIT Mesra, others under review
                status = TicketStatus.UNDER_REVIEW
                assignee_id = None
                if idx == 0 and uni_user:
                    status = TicketStatus.ACCEPTED
                    assignee_id = uni_user.id

                ticket = Ticket(
                    ticket_id=t_id,
                    title=tdata["title"],
                    description=tdata["description"],
                    location_district=tdata["district"],
                    location_detail=tdata["location_detail"],
                    domain=Domain(ai_res["primary_domain"]),
                    secondary_domain=Domain(ai_res["secondary_domain"]) if ai_res["secondary_domain"] else None,
                    severity=Severity(ai_res["severity"]),
                    priority=Priority(ai_res["priority"]),
                    queue_score=ai_res["queue_score"],
                    analysis_json=json.dumps(ai_res),
                    model_version="mvp-v1",
                    status=status,
                    reporter_id=citizen_user.id,
                    assignee_id=assignee_id,
                )
                db.add(ticket)
                created_count += 1

        db.commit()
        print(f"✅ Ticket seeding complete. {created_count} sample tickets created.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding tickets: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_tickets()
