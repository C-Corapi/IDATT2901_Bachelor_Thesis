"""Pytest configuration file providing database fixtures for testing."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from utils.database import Base


@pytest.fixture
def db_session():
    """Fixture for creating a temporary database session for testing."""
    engine = create_engine("sqlite:///:memory:")

    Base.metadata.create_all(engine)

    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()

    try:
        yield session
    finally:
        session.close()
        engine.dispose()
