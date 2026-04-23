"""Tests for the deliverable service."""

import json
from unittest.mock import patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model.deliverable import Deliverable
from schemas.deliverable import DeliverableCreateModel
from service.deliverable_service import extract_deliverables, save_deliverables_to_db
from utils.database import Base


def test_extract_deliverables_should_return_list_of_deliverables():
    """Test that extract_deliverables returns a list of deliverables when deliverables exist."""
    fake_document = "This is a test document containing deliverables."

    fake_llm_response = json.dumps(
        {
            "deliverables": [
                {
                    "title": "Deliverable 1",
                    "requirements": "Requirements for Deliverable 1",
                    "specifications": "Specifications for Deliverable 1",
                    "properties": "Properties of Deliverable 1",
                    "fit_criterion": "Fit criterion for Deliverable 1",
                    "owner": "John Doe",
                },
                {
                    "title": "Deliverable 2",
                    "requirements": "Requirements for Deliverable 2",
                    "specifications": "Specifications for Deliverable 2",
                    "properties": "Properties of Deliverable 2",
                    "fit_criterion": "Fit criterion for Deliverable 2",
                    "owner": "Jane Smith",
                },
            ]
        }
    )

    with patch("service.deliverable_service.load_file", return_value=fake_document), patch(
        "service.deliverable_service.LlamaClient"
    ) as MockLlamaClient:
        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response
        result = extract_deliverables("fake_path.txt")

        assert len(result) == 2
        assert result[0].title == "Deliverable 1"
        assert result[1].requirements == "Requirements for Deliverable 2"
        assert result[0].specifications == "Specifications for Deliverable 1"


def test_extract_deliverables_should_handle_empty_response():
    """Test that extract_deliverables return empty list when no deliverables exist."""
    fake_document = "This is a test document containing no deliverables."

    fake_llm_response = json.dumps({"deliverables": []})

    with patch("service.deliverable_service.load_file", return_value=fake_document), patch(
        "service.deliverable_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_deliverables("fake_path.txt")

        assert isinstance(result, list)
        assert len(result) == 0


@pytest.fixture
def db_session():
    """Fixture for creating a temporary database session for testing."""
    engine = create_engine("sqlite:///:memory:")

    Base.metadata.create_all(engine)

    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()

    yield session

    session.close()


def test_save_deliverables_to_db_should_save_deliverables(db_session):
    """Test that save_deliverables_to_db saves a list of deliverables to the database."""
    deliverables = [
        DeliverableCreateModel(
            title="Deliverable 1",
            requirements="Requirements for Deliverable 1",
            specifications="Specifications for Deliverable 1",
            properties="Properties of Deliverable 1",
            fit_criterion="Fit criterion for Deliverable 1",
            owner="John Doe",
        ),
        DeliverableCreateModel(
            title="Deliverable 2",
            requirements="Requirements for Deliverable 2",
            specifications="Specifications for Deliverable 2",
            properties="Properties of Deliverable 2",
            fit_criterion="Fit criterion for Deliverable 2",
            owner="Jane Smith",
        ),
    ]

    result = save_deliverables_to_db(deliverables, db_session)

    assert len(result) == 2
    assert result[0].title == "Deliverable 1"
    assert result[1].title == "Deliverable 2"

    stored = db_session.query(Deliverable).all()
    assert len(stored) == 2
