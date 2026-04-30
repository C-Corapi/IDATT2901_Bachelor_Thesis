"""Tests for the decision service."""

import json
from unittest.mock import MagicMock, patch

import pytest

from exceptions.common import DecisionNotFound
from model.decision import Decision
from schemas.decision import DecisionCreateModel
from service import decision_service
from service.decision_service import extract_decisions, save_decisions_to_db


def test_extract_decisions_should_return_list_of_decisions():
    """Test that extract_decisions returns a list of decisions when decisions exist."""
    fake_document = "This is a test document containing decisions."

    fake_llm_response = json.dumps(
        {
            "decisions": [
                {
                    "title": "Decision 1",
                    "description": "Description of Decision 1",
                    "alternatives": "Alternatives for Decision 1",
                    "nature": "Nature of Decision 1",
                    "reach": "Reach of Decision 1",
                    "deadline": "Deadline for Decision 1",
                    "owner": "John Doe",
                },
                {
                    "title": "Decision 2",
                    "description": "Description of Decision 2",
                    "alternatives": "Alternatives for Decision 2",
                    "nature": "Nature of Decision 2",
                    "reach": "Reach of Decision 2",
                    "deadline": "Deadline for Decision 2",
                    "owner": "Jane Smith",
                },
            ]
        }
    )

    with patch("service.decision_service.load_file", return_value=fake_document), patch(
        "service.decision_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_decisions("fake_path.txt")

        assert len(result) == 2
        assert result[0].title == "Decision 1"
        assert result[0].description == "Description of Decision 1"
        assert result[0].owner == "John Doe"
        assert result[0].nature == "Nature of Decision 1"
        assert result[1].title == "Decision 2"


def test_extract_decisions_should_handle_empty_response():
    """Test that extract_decisions returns an empty list when no decisions exist."""
    fake_document = "This is a test document containing no decisions."

    fake_llm_response = json.dumps({"decisions": []})

    with patch("service.decision_service.load_file", return_value=fake_document), patch(
        "service.decision_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_decisions("fake_path.txt")

        assert isinstance(result, list)
        assert len(result) == 0


def test_save_decisions_to_db_should_save_decisions_to_database(db_session):
    """Test that save_decisions_to_db saves a list of decisions to the database."""
    decisions = [
        DecisionCreateModel(
            title="Decision 1",
            description="Description of Decision 1",
            alternatives="Alternatives for Decision 1",
            nature="Nature of Decision 1",
            reach="Reach of Decision 1",
            deadline="Deadline for Decision 1",
            owner="John Doe",
        ),
        DecisionCreateModel(
            title="Decision 2",
            description="Description of Decision 2",
            alternatives="Alternatives for Decision 2",
            nature="Nature of Decision 2",
            reach="Reach of Decision 2",
            deadline="Deadline for Decision 2",
            owner="Jane Smith",
        ),
    ]

    result = save_decisions_to_db(decisions, db_session)

    assert len(result) == 2
    assert result[0].id is not None
    assert result[0].title == "Decision 1"

    stored = db_session.query(Decision).all()
    assert len(stored) == 2


def test_get_all_decisions_should_return_list_of_decisions(monkeypatch):
    """Test that get_all_decisions returns a list of decisions."""
    fake_db = MagicMock()

    fake_decisions = [Decision(id=1, title="decision1"), Decision(id=2, title="decision2")]

    def mock_get_all(db):
        return fake_decisions

    monkeypatch.setattr("src.service.decision_service.decision_repository.get_all", mock_get_all)

    result = decision_service.get_all_decisions(fake_db)

    assert result == fake_decisions


def test_get_decision_should_return_decision_with_id_if_exists(monkeypatch):
    """Test that get_decision returns the decision with the given ID if it exists."""
    fake_db = MagicMock()

    fake_decision = Decision(id=1, title="decision1")

    def mock_get_decision(db, decision_id):
        return fake_decision

    monkeypatch.setattr(
        "src.service.decision_service.decision_repository.get_by_id", mock_get_decision
    )

    result = decision_service.get_decision(fake_db, 1)

    assert result == fake_decision


def test_get_decision_should_raise_on_invalid_id(monkeypatch):
    """Test that get decision raises when repository returns None."""
    fake_db = MagicMock()

    fake_id = 2

    def mock_get_decision(db, decision_id):
        return None

    monkeypatch.setattr(decision_service.decision_repository, "get_by_id", mock_get_decision)

    with pytest.raises(DecisionNotFound):
        decision_service.get_decision(fake_db, fake_id)


def test_delete_decision_should_return_true_when_deleted(monkeypatch):
    """Tests that delete_decision returns True after deleting an decision."""
    fake_db = MagicMock()

    def mock_delete(db, decision_id):
        return True

    monkeypatch.setattr(decision_service.decision_repository, "delete", mock_delete)

    result = decision_service.delete_decision(fake_db, 1)

    assert result is True


def test_delete_decision_should_return_false_when_not_found(monkeypatch):
    """Tests that delete_decision returns false when given invalid ID."""
    fake_db = MagicMock()

    def mock_delete(db, decision_id):
        return False

    monkeypatch.setattr(decision_service.decision_repository, "delete", mock_delete)

    result = decision_service.delete_decision(fake_db, 999)

    assert result is False


def test_update_decision_should_return_updated_decision_when_updated(monkeypatch):
    """Tests that update_decision returns the updated decision."""
    fake_db = MagicMock()
    decision_id = 1

    updated_input = MagicMock(spec=DecisionCreateModel)
    updated_decision = MagicMock()

    def mock_update(db, id, update):
        assert db == fake_db
        assert id == decision_id
        assert update == updated_input
        return updated_decision

    monkeypatch.setattr(decision_service.decision_repository, "update", mock_update)

    result = decision_service.update_decision(fake_db, decision_id, updated_input)

    assert result == updated_decision


def test_update_decision_should_raise_when_not_found(monkeypatch):
    """Test that update_decision raises exception when given invalid ID."""
    fake_db = MagicMock()
    decision_id = 999

    updated_input = MagicMock(spec=DecisionCreateModel)

    def mock_update(db, id, updated):
        return None

    monkeypatch.setattr(decision_service.decision_repository, "update", mock_update)

    with pytest.raises(DecisionNotFound):
        decision_service.update_decision(fake_db, decision_id, updated_input)
