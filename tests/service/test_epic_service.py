"""Tests for the epic service."""

import json
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from exceptions.common import EpicNotFound
from model.epic import Epic
from schemas.epic import EpicCreateModel
from service import epic_service
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

def test_get_all_epics_should_return_list_of_epics(monkeypatch):
    """Test that get_all_epics returns a list of epics."""
    fake_db = MagicMock()

    fake_epics = [
        Epic(id=1, title="epic1"),
        Epic(id=2, title="epic2")
    ]

    def mock_get_all(db):
        return fake_epics
    
    monkeypatch.setattr(
        "src.service.epic_service.epic_repository.get_all",
        mock_get_all
    )

    result = epic_service.get_all_epics(fake_db)

    assert result == fake_epics


def test_get_epic_should_return_epic_with_id_if_exists(monkeypatch):
    """Test that get_epic returns the epic with the given ID if it exists."""
    fake_db = MagicMock()

    fake_epic = Epic(id=1, title="epic1")

    def mock_get_epic(db, epic_id):
        return fake_epic

    monkeypatch.setattr(
        "src.service.epic_service.epic_repository.get_by_id",
        mock_get_epic
    )

    result = epic_service.get_epic(fake_db, 1)

    assert result == fake_epic

def test_get_epic_should_raise_on_invalid_id(monkeypatch):
    """Test that get epic raises when repository returns None."""
    fake_db = MagicMock()

    fake_id = 2

    def mock_get_epic(db, epic_id):
        return None
    
    monkeypatch.setattr(
        epic_service.epic_repository,
        "get_by_id",
        mock_get_epic
    )

    with pytest.raises(EpicNotFound):
        epic_service.get_epic(fake_db, fake_id)
    

def test_delete_epic_should_return_true_when_deleted(monkeypatch):
    """Tests that delete_epic returns True after deleting an epic."""
    fake_db = MagicMock()

    def mock_delete(db, epic_id):
        return True

    monkeypatch.setattr(
        epic_service.epic_repository,
        "delete",
        mock_delete
    )

    result = epic_service.delete_epic(fake_db, 1)

    assert result is True

def test_delete_epic_should_return_false_when_not_found(monkeypatch):
    """Tests that delete_epic returns false when given invalid ID."""
    fake_db = MagicMock()

    def mock_delete(db, epic_id):
        return False

    monkeypatch.setattr(
        epic_service.epic_repository,
        "delete",
        mock_delete
    )

    result = epic_service.delete_epic(fake_db, 999)

    assert result is False

def test_update_epic_should_return_updated_epic_when_updated(monkeypatch):
    """Tests that update_epic returns the updated epic."""
    fake_db = MagicMock()
    epic_id = 1

    updated_input = MagicMock(spec=EpicCreateModel)
    updated_epic = MagicMock()

    def mock_update(db, id, update):
        assert db == fake_db
        assert id == epic_id
        assert update == updated_input
        return updated_epic
    
    monkeypatch.setattr(
        epic_service.epic_repository,
        "update",
        mock_update
    )

    result = epic_service.update_epic(fake_db, epic_id, updated_input)

    assert result == updated_epic


def test_update_epic_should_raise_when_not_found(monkeypatch):
    """Test that update_epic raises exception when given invalid ID"""
    fake_db = MagicMock()
    epic_id = 999

    updated_input = MagicMock(spec=EpicCreateModel)

    def mock_update(db, id, updated):
        return None

    monkeypatch.setattr(
        epic_service.epic_repository,
        "update",
        mock_update
    )

    with pytest.raises(EpicNotFound):
        epic_service.update_epic(fake_db, epic_id, updated_input)

