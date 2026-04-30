"""Tests for the deliverable service."""

import json
from unittest.mock import MagicMock, patch

import pytest

from exceptions.common import DeliverableNotFound
from model.deliverable import Deliverable
from schemas.deliverable import DeliverableCreateModel
from service import deliverable_service
from service.deliverable_service import extract_deliverables, save_deliverables_to_db


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


def test_get_all_deliverables_should_return_list_of_deliverables(monkeypatch):
    """Test that get_all_deliverables returns a list of deliverables."""
    fake_db = MagicMock()

    fake_deliverables = [
        Deliverable(id=1, title="deliverable1"),
        Deliverable(id=2, title="deliverable2"),
    ]

    def mock_get_all(db):
        return fake_deliverables

    monkeypatch.setattr(
        "src.service.deliverable_service.deliverable_repository.get_all", mock_get_all
    )

    result = deliverable_service.get_all_deliverables(fake_db)

    assert result == fake_deliverables


def test_get_deliverable_should_return_deliverable_with_id_if_exists(monkeypatch):
    """Test that get_deliverable returns the deliverable with the given ID if it exists."""
    fake_db = MagicMock()

    fake_deliverable = Deliverable(id=1, title="deliverable1")

    def mock_get_deliverable(db, deliverable_id):
        return fake_deliverable

    monkeypatch.setattr(
        "src.service.deliverable_service.deliverable_repository.get_by_id", mock_get_deliverable
    )

    result = deliverable_service.get_deliverable(fake_db, 1)

    assert result == fake_deliverable


def test_get_deliverable_should_raise_on_invalid_id(monkeypatch):
    """Test that get deliverable raises when repository returns None."""
    fake_db = MagicMock()

    fake_id = 2

    def mock_get_deliverable(db, deliverable_id):
        return None

    monkeypatch.setattr(
        deliverable_service.deliverable_repository, "get_by_id", mock_get_deliverable
    )

    with pytest.raises(DeliverableNotFound):
        deliverable_service.get_deliverable(fake_db, fake_id)


def test_delete_deliverable_should_return_true_when_deleted(monkeypatch):
    """Tests that delete_deliverable returns True after deleting an deliverable."""
    fake_db = MagicMock()

    def mock_delete(db, deliverable_id):
        return True

    monkeypatch.setattr(deliverable_service.deliverable_repository, "delete", mock_delete)

    result = deliverable_service.delete_deliverable(fake_db, 1)

    assert result is True


def test_delete_deliverable_should_return_false_when_not_found(monkeypatch):
    """Tests that delete_deliverable returns false when given invalid ID."""
    fake_db = MagicMock()

    def mock_delete(db, deliverable_id):
        return False

    monkeypatch.setattr(deliverable_service.deliverable_repository, "delete", mock_delete)

    result = deliverable_service.delete_deliverable(fake_db, 999)

    assert result is False


def test_update_deliverable_should_return_updated_deliverable_when_updated(monkeypatch):
    """Tests that update_deliverable returns the updated deliverable."""
    fake_db = MagicMock()
    deliverable_id = 1

    updated_input = MagicMock(spec=DeliverableCreateModel)
    updated_deliverable = MagicMock()

    def mock_update(db, id, update):
        assert db == fake_db
        assert id == deliverable_id
        assert update == updated_input
        return updated_deliverable

    monkeypatch.setattr(deliverable_service.deliverable_repository, "update", mock_update)

    result = deliverable_service.update_deliverable(fake_db, deliverable_id, updated_input)

    assert result == updated_deliverable


def test_update_deliverable_should_raise_when_not_found(monkeypatch):
    """Test that update_deliverable raises exception when given invalid ID."""
    fake_db = MagicMock()
    deliverable_id = 999

    updated_input = MagicMock(spec=DeliverableCreateModel)

    def mock_update(db, id, updated):
        return None

    monkeypatch.setattr(deliverable_service.deliverable_repository, "update", mock_update)

    with pytest.raises(DeliverableNotFound):
        deliverable_service.update_deliverable(fake_db, deliverable_id, updated_input)
