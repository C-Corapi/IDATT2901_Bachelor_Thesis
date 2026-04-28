"""Tests for the activity service."""

import json
from unittest.mock import MagicMock, patch

import pytest

from exceptions.common import ActivityNotFound
from model.activity import Activity
from schemas.activity import ActivityCreateModel
from service import activity_service
from service.activity_service import extract_activities, save_activities_to_db


def test_extract_activities_should_return_list_of_activities():
    """Test that extract_activities returns a list of activities when there are activities."""
    fake_document = "This is a test document containing activities."

    fake_llm_response = json.dumps(
        {
            "activities": [
                {
                    "title": "Activity 1",
                    "description": "Description of Activity 1",
                    "owner": "John Doe",
                    "status": "Open",
                },
                {
                    "title": "Activity 2",
                    "description": "Description of Activity 2",
                    "owner": "Jane Smith",
                    "status": "In Progress",
                },
            ]
        }
    )

    with patch("service.activity_service.load_file", return_value=fake_document), patch(
        "service.activity_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_activities("fake_path.txt")

        assert len(result) == 2
        assert result[0].title == "Activity 1"
        assert result[0].description == "Description of Activity 1"
        assert result[0].owner == "John Doe"
        assert result[0].status == "Open"
        assert result[1].title == "Activity 2"


def test_extract_activities_should_handle_empty_response():
    """Test that extract_activities returns an empty list when there are no activities."""
    fake_document = "This is a test document containing no activities."

    fake_llm_response = json.dumps({"activities": []})

    with patch("service.activity_service.load_file", return_value=fake_document), patch(
        "service.activity_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_activities("fake_path.txt")

        assert isinstance(result, list)
        assert len(result) == 0


def test_save_activities_to_db_should_save_activities_to_database(db_session):
    """Tests that save_activities_to_db saves a list of activities to the database."""
    activities = [
        ActivityCreateModel(title="Activity 1", description="Desc 1", owner="John", status="Open"),
        ActivityCreateModel(
            title="Activity 2", description="Desc 2", owner="Jane", status="In Progress"
        ),
    ]

    result = save_activities_to_db(activities, db_session)

    assert len(result) == 2
    assert result[0].title == "Activity 1"
    assert result[1].title == "Activity 2"

    stored = db_session.query(Activity).all()
    assert len(stored) == 2

def test_get_all_activities_should_return_list_of_activities(monkeypatch):
    """Test that get_all_activities returns a list of activities."""
    fake_db = MagicMock()

    fake_activities = [
        Activity(id=1, title="activity1"),
        Activity(id=2, title="activity2")
    ]

    def mock_get_all(db):
        return fake_activities
    
    monkeypatch.setattr(
        "src.service.activity_service.activity_repository.get_all",
        mock_get_all
    )

    result = activity_service.get_all_activities(fake_db)

    assert result == fake_activities


def test_get_activity_should_return_activity_with_id_if_exists(monkeypatch):
    """Test that get_activity returns the activity with the given ID if it exists."""
    fake_db = MagicMock()

    fake_activity = Activity(id=1, title="activity1")

    def mock_get_activity(db, activity_id):
        return fake_activity

    monkeypatch.setattr(
        "src.service.activity_service.activity_repository.get_by_id",
        mock_get_activity
    )

    result = activity_service.get_activity(fake_db, 1)

    assert result == fake_activity

def test_get_activity_should_raise_on_invalid_id(monkeypatch):
    """Test that get activity raises when repository returns None."""
    fake_db = MagicMock()

    fake_id = 2

    def mock_get_activity(db, activity_id):
        return None
    
    monkeypatch.setattr(
        activity_service.activity_repository,
        "get_by_id",
        mock_get_activity
    )

    with pytest.raises(ActivityNotFound):
        activity_service.get_activity(fake_db, fake_id)
    

def test_delete_activity_should_return_true_when_deleted(monkeypatch):
    """Tests that delete_activity returns True after deleting an activity."""
    fake_db = MagicMock()

    def mock_delete(db, activity_id):
        return True

    monkeypatch.setattr(
        activity_service.activity_repository,
        "delete",
        mock_delete
    )

    result = activity_service.delete_activity(fake_db, 1)

    assert result is True

def test_delete_activity_should_return_false_when_not_found(monkeypatch):
    """Tests that delete_activity returns false when given invalid ID."""
    fake_db = MagicMock()

    def mock_delete(db, activity_id):
        return False

    monkeypatch.setattr(
        activity_service.activity_repository,
        "delete",
        mock_delete
    )

    result = activity_service.delete_activity(fake_db, 999)

    assert result is False

def test_update_activity_should_return_updated_activity_when_updated(monkeypatch):
    """Tests that update_activity returns the updated activity."""
    fake_db = MagicMock()
    activity_id = 1

    updated_input = MagicMock(spec=ActivityCreateModel)
    updated_activity = MagicMock()

    def mock_update(db, id, update):
        assert db == fake_db
        assert id == activity_id
        assert update == updated_input
        return updated_activity
    
    monkeypatch.setattr(
        activity_service.activity_repository,
        "update",
        mock_update
    )

    result = activity_service.update_activity(fake_db, activity_id, updated_input)

    assert result == updated_activity


def test_update_activity_should_raise_when_not_found(monkeypatch):
    """Test that update_activity raises exception when given invalid ID"""
    fake_db = MagicMock()
    activity_id = 999

    updated_input = MagicMock(spec=ActivityCreateModel)

    def mock_update(db, id, updated):
        return None

    monkeypatch.setattr(
        activity_service.activity_repository,
        "update",
        mock_update
    )

    with pytest.raises(ActivityNotFound):
        activity_service.update_activity(fake_db, activity_id, updated_input)
