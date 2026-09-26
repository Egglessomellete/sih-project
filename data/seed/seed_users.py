"""
Seed script — populates SQLite database with initial demo accounts.

Usage:
  cd apps/api
  ./venv/bin/python3 ../../data/seed/seed_users.py
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/api")))

from app.database import Base, SessionLocal, engine
from app.enums import Role
from app.models.models import User
from app.services.auth import hash_password

SEED_USERS = [
    {
        "email": "citizen@demo.com",
        "phone": "+91 98765 43210",
        "password": "demo1234",
        "full_name": "Ramesh Kumar (Citizen)",
        "role": Role.CITIZEN,
        "district": "Palamu",
    },
    {
        "email": "pri@demo.com",
        "phone": "+91 98765 43211",
        "password": "demo1234",
        "full_name": "Sarla Devi (Mukhiya / PRI)",
        "role": Role.PRI,
        "organization": "Palamu Gram Panchayat",
        "district": "Palamu",
    },
    {
        "email": "uni@demo.com",
        "phone": "+91 98765 43212",
        "password": "demo1234",
        "full_name": "Dr. Ananya Roy (Researcher)",
        "role": Role.UNIVERSITY,
        "organization": "BIT Mesra, Ranchi",
        "designation": "Professor - Environmental Engineering",
        "expertise_tags": "water,sanitation,environment,agriculture",
        "district": "Ranchi",
    },
    {
        "email": "industry@demo.com",
        "phone": "+91 98765 43213",
        "password": "demo1234",
        "full_name": "Vikram Singh (Industry Lead)",
        "role": Role.INDUSTRY,
        "organization": "Tata Steel Foundation / CSR",
        "designation": "Head of Rural Innovation",
        "expertise_tags": "livelihoods,urban_infrastructure,education,accessibility",
        "district": "East Singhbhum",
    },
    {
        "email": "govt@demo.com",
        "phone": "+91 98765 43214",
        "password": "demo1234",
        "full_name": "Rajesh Verma (Govt Officer)",
        "role": Role.GOVT,
        "organization": "Jharkhand Dept of Rural Development",
        "designation": "District Nodal Officer",
        "expertise_tags": "water,public_services,sanitation,urban_infrastructure",
        "district": "Palamu",
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        created_count = 0
        for udata in SEED_USERS:
            existing = db.query(User).filter(User.email == udata["email"]).first()
            if not existing:
                user = User(
                    email=udata["email"],
                    phone=udata.get("phone"),
                    hashed_password=hash_password(udata["password"]),
                    full_name=udata["full_name"],
                    role=udata["role"],
                    organization=udata.get("organization"),
                    designation=udata.get("designation"),
                    expertise_tags=udata.get("expertise_tags"),
                    district=udata.get("district"),
                    first_login=True,
                )
                db.add(user)
                created_count += 1
        db.commit()
        print(f"✅ Seeding complete. {created_count} users created.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding users: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
