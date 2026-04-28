"""Tests for the task service."""

import json
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from exceptions.common import TaskNotFound
from model.task import Task
from schemas.task import TaskCreateModel
from service import task_service
from service.task_service import extract_tasks, save_tasks_to_db
from utils.database import Base


def test_extract_tasks_should_return_list_of_tasks():
    """Test that extract_tasks returns a list of tasks when the LLM response contains tasks."""
    fake_document = "This is a test document containing tasks."

    fake_llm_response = json.dumps(
        {
            "tasks": [
                {
                    "title": "Task 1",
                    "description": "Description of Task 1",
                    "owner": "John Doe",
                    "status": "Open",
                },
                {
                    "title": "Task 2",
                    "description": "Description of Task 2",
                    "owner": "Jane Smith",
                    "status": "In Progress",
                },
            ]
        }
    )

    with patch("service.task_service.load_file", return_value=fake_document), patch(
        "service.task_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_tasks("fake_path.txt")

        assert len(result) == 2
        assert result[0].title == "Task 1"
        assert result[0].description == "Description of Task 1"
        assert result[0].owner == "John Doe"
        assert result[0].status == "Open"
        assert result[1].title == "Task 2"


def test_extract_tasks_should_handle_empty_response():
    """Test that extract_tasks returns an empty list when the LLM response contains no tasks."""
    fake_document = "This is a test document containing no tasks."

    fake_llm_response = json.dumps({"tasks": []})

    with patch("service.task_service.load_file", return_value=fake_document), patch(
        "service.task_service.LlamaClient"
    ) as MockLlamaClient:

        mock_llm_instance = MockLlamaClient.return_value
        mock_llm_instance.generate.return_value = fake_llm_response

        result = extract_tasks("fake_path.txt")

        assert isinstance(result, list)
        assert len(result) == 0


@pytest.fixture
def db_session():
    """Fixture to create a new database session for each test."""
    engine = create_engine("sqlite:///:memory:")

    Base.metadata.create_all(engine)

    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()

    yield session

    session.close()


def test_save_tasks_to_db(db_session):
    """Test that save_tasks_to_db saves a list of tasks to the database."""
    tasks = [
        TaskCreateModel(
            title="Task 1",
            description="Description of Task 1",
            owner="John Doe",
            status="Open",
            time_logged="2024-06-01T10:00:00Z",
        ),
        TaskCreateModel(
            title="Task 2",
            description="Description of Task 2",
            owner="Jane Smith",
            status="In Progress",
            target_date="2024-06-15T17:00:00Z",
        ),
    ]

    save_tasks_to_db(tasks, db_session)

    result = db_session.query(Task).all()
    assert len(result) == 2
    assert result[0].title == "Task 1"
    assert result[0].description == "Description of Task 1"
    assert result[0].owner == "John Doe"
    assert result[0].status == "Open"
    assert result[0].time_logged == "2024-06-01T10:00:00Z"
    assert result[0].target_date is None
    assert result[1].title == "Task 2"
    assert result[1].time_logged is None
    assert result[1].target_date == "2024-06-15T17:00:00Z"


def test_get_all_tasks_should_return_list_of_tasks(monkeypatch):
    """Test that get_all_tasks returns a list of tasks."""
    fake_db = MagicMock()

    fake_tasks = [
        Task(id=1, title="task1"),
        Task(id=2, title="task2")
    ]

    def mock_get_all(db):
        return fake_tasks
    
    monkeypatch.setattr(
        "src.service.task_service.task_repository.get_all",
        mock_get_all
    )

    result = task_service.get_all_tasks(fake_db)

    assert result == fake_tasks


def test_get_task_should_return_task_with_id_if_exists(monkeypatch):
    """Test that get_task returns the task with the given ID if it exists."""
    fake_db = MagicMock()

    fake_task = Task(id=1, title="task1")

    def mock_get_task(db, task_id):
        return fake_task

    monkeypatch.setattr(
        "src.service.task_service.task_repository.get_by_id",
        mock_get_task
    )

    result = task_service.get_task(fake_db, 1)

    assert result == fake_task

def test_get_task_should_raise_on_invalid_id(monkeypatch):
    """Test that get task raises when repository returns None."""
    fake_db = MagicMock()

    fake_id = 2

    def mock_get_task(db, task_id):
        return None
    
    monkeypatch.setattr(
        task_service.task_repository,
        "get_by_id",
        mock_get_task
    )

    with pytest.raises(TaskNotFound):
        task_service.get_task(fake_db, fake_id)
    

def test_delete_task_should_return_true_when_deleted(monkeypatch):
    """Tests that delete_task returns True after deleting an task."""
    fake_db = MagicMock()

    def mock_delete(db, task_id):
        return True

    monkeypatch.setattr(
        task_service.task_repository,
        "delete",
        mock_delete
    )

    result = task_service.delete_task(fake_db, 1)

    assert result is True

def test_delete_task_should_return_false_when_not_found(monkeypatch):
    """Tests that delete_task returns false when given invalid ID."""
    fake_db = MagicMock()

    def mock_delete(db, task_id):
        return False

    monkeypatch.setattr(
        task_service.task_repository,
        "delete",
        mock_delete
    )

    result = task_service.delete_task(fake_db, 999)

    assert result is False

def test_update_task_should_return_updated_task_when_updated(monkeypatch):
    """Tests that update_task returns the updated task."""
    fake_db = MagicMock()
    task_id = 1

    updated_input = MagicMock(spec=TaskCreateModel)
    updated_task = MagicMock()

    def mock_update(db, id, update):
        assert db == fake_db
        assert id == task_id
        assert update == updated_input
        return updated_task
    
    monkeypatch.setattr(
        task_service.task_repository,
        "update",
        mock_update
    )

    result = task_service.update_task(fake_db, task_id, updated_input)

    assert result == updated_task


def test_update_task_should_raise_when_not_found(monkeypatch):
    """Test that update_task raises exception when given invalid ID"""
    fake_db = MagicMock()
    task_id = 999

    updated_input = MagicMock(spec=TaskCreateModel)

    def mock_update(db, id, updated):
        return None

    monkeypatch.setattr(
        task_service.task_repository,
        "update",
        mock_update
    )

    with pytest.raises(TaskNotFound):
        task_service.update_task(fake_db, task_id, updated_input)

