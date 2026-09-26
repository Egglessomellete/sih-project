"""
API Test Suite — unit & integration tests for Auth, Ticket creation, AI Pipeline, and Feedback loop.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.enums import Domain, Role, TicketStatus

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_citizen_signup_and_login():
    # Unique email for test run
    email = f"test_citizen_{os.urandom(4).hex()}@test.com"
    signup_res = client.post(
        "/api/auth/signup/citizen",
        json={
            "email": email,
            "password": "password123",
            "full_name": "Test Citizen",
            "role": "citizen",
        },
    )
    assert signup_res.status_code == 201
    data = signup_res.json()
    assert "access_token" in data
    assert data["role"] == "citizen"
    assert data["ui_density"] == "simple"

    # Login test
    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": "password123"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Profile test
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email


def test_ai_playground_classification():
    res = client.post(
        "/api/tickets/classify-playground",
        json={
            "title": "पलामू में पेयजल संकट एवं नल जल योजना मरम्मत",
            "description": "मनातू प्रखंड के वार्ड 4 में कुआं और हैंडपंप पूरी तरह सूख चुका है। पीने के पानी के लिए लोग भटक रहे हैं।",
            "location_detail": "Manatu, Palamu",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["primary_domain"] == "water"
    assert data["is_valid"] is True
    assert data["extracted_info"]["detected_district"] == "Palamu"
    assert data["queue_score"] > 0
