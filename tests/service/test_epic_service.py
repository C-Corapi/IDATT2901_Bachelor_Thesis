"""Tests for the epic service."""

import json
from unittest.mock import patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model.epic import Epic
from schemas.epic import EpicCreateModel
from service.epic_service import extract_epics, save_epics_to_db
from utils.database import Base


def test_extract_epics_should_return_list_of_epics():
    """Test that extract_epics returns a list of epics when the LLM response contains epics."""
    fake_document = "This is a test document containing epics."

    fake_llm_response = json.dumps(
        {
            "epics": [
                {
                    "title": "Epic 1",
                    "description": "Description of Epic 1",
                    "owner": "John Doe",
                    "stakeholder": "Stakeholders for Epic 1",
                    "Evidence": "Evidence for Epic 1",
                },
                {
                    "title": "Epic 2",
                    "description": "Description of Epic 2",
                    "owner": "Jane Smith",
                    "stakeholder": "Stakeholders for Epic 2",
                    "Evidence": "Evidence for Epic 2",
                },
            ]
        }
    )

    with patch("service.epic_service.load_file", return_value=fake_document), patch(
        "service.epic_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_epics("fake_path.txt")

        assert len(result) == 2
        assert result[0].title == "Epic 1"
        assert result[0].description == "Description of Epic 1"
        assert result[0].owner == "John Doe"
        assert result[1].title == "Epic 2"


def test_extract_epics_should_handle_empty_response():
    """Test that extract_epics returns an empty list when the LLM response contains no epics."""
    fake_document = "This is a test document containing no epics."

    fake_llm_response = json.dumps({"epics": []})

    with patch("service.epic_service.load_file", return_value=fake_document), patch(
        "service.epic_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_epics("fake_path.txt")

        assert isinstance(result, list)
        assert len(result) == 0


@pytest.fixture
def db_session():
    """Test fixture for creating a database session for testing."""
    engine = create_engine("sqlite:///:memory:")

    Base.metadata.create_all(engine)

    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()

    yield session

    session.close()


def test_save_epics_to_db(db_session):
    """Test that save_epics_to_db saves a list of epics to the database."""
    epics = [
        EpicCreateModel(
            title="Epic 1",
            description="Description of Epic 1",
            owner="John Doe",
        ),
        EpicCreateModel(
            title="Epic 2",
            description="Description of Epic 2",
            owner="Jane Smith",
        ),
    ]

    result = save_epics_to_db(epics, db_session)

    assert len(result) == 2
    assert result[0].id is not None
    assert result[0].title == "Epic 1"
    assert result[0].description == "Description of Epic 1"
    assert result[0].owner == "John Doe"
    assert result[1].title == "Epic 2"

    stored = db_session.query(Epic).all()
    assert len(stored) == 2
