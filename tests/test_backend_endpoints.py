"""
Pytest-compatible backend endpoint tests for CampusAi API.

Uses FastAPI's TestClient so no live server is required. Requires a
reachable MongoDB instance (e.g. the `services.mongodb` block in CI).

Run with:
    MONGO_URL=mongodb://localhost:27017 DB_NAME=campusai_test pytest tests/ -v
"""

import os
import sys
import pytest

# Ensure backend package is importable
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "..", "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Environment must be set before importing server
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "campusai_test")
os.environ.setdefault("JWT_SECRET", "ci_test_secret_key_that_is_long_enough")

from fastapi.testclient import TestClient  # noqa: E402
import server  # noqa: E402


@pytest.fixture(scope="module")
def client():
    """Provide a TestClient bound to the running FastAPI app."""
    with TestClient(server.app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    """Create a dev session and return Authorization headers."""
    resp = client.post("/api/auth/dev-session")
    assert resp.status_code == 200, resp.text
    token = resp.json().get("token")
    assert token, "dev-session did not return a token"
    return {"Authorization": f"Bearer {token}"}


def test_root_endpoint(client):
    resp = client.get("/api/")
    assert resp.status_code == 200
    assert resp.json()["message"] == "CampusAi API"


def test_lectures_require_auth(client):
    resp = client.get("/api/lectures")
    assert resp.status_code == 401


def test_quizzes_require_auth(client):
    resp = client.get("/api/quizzes")
    assert resp.status_code == 401


def test_rankings_require_auth(client):
    resp = client.get("/api/rankings")
    assert resp.status_code == 401


def test_dev_session_and_me(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    user = resp.json()
    assert user["email"] == "dev@local.test"


def test_get_lectures_authenticated(client, auth_headers):
    resp = client.get("/api/lectures", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_quizzes_authenticated(client, auth_headers):
    resp = client.get("/api/quizzes", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_rankings_authenticated(client, auth_headers):
    resp = client.get("/api/rankings", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_my_performance(client, auth_headers):
    resp = client.get("/api/performance", headers=auth_headers)
    assert resp.status_code == 200
    assert "user_id" in resp.json()


def test_get_coding_profile(client, auth_headers):
    resp = client.get("/api/coding-profile", headers=auth_headers)
    assert resp.status_code == 200
