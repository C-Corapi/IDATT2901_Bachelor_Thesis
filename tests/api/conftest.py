"""Pytest configuration file providing a FastAPI test client fixture."""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Fixture for creating FastAPI test client."""
    return TestClient(app)
