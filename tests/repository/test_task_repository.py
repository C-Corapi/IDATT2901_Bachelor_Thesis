"""Tests for task repository."""

from model.task import Task
from repository import task_repository
from schemas.task import TaskCreateModel


def test_get_all_empty(db_session):
    """Test that get_all returns empty list if DB is table is empty."""
    result = task_repository.get_all(db_session)
    assert result == []


def test_get_all_with_data(db_session):
    """Test that get_all retrieves the stored tasks."""
    task1 = Task(title="A1")
    task2 = Task(title="A2")

    db_session.add_all([task1, task2])
    db_session.commit()

    result = task_repository.get_all(db_session)

    assert len(result) == 2
    assert {a.title for a in result} == {"A1", "A2"}


def test_get_by_id_found(db_session):
    """Test that get_by_id retrieves the task."""
    task = Task(title="Test task")
    db_session.add(task)
    db_session.commit()

    result = task_repository.get_by_id(db_session, task.id)

    assert result is not None
    assert result.id == task.id
    assert result.title == "Test task"


def test_get_by_id_not_found(db_session):
    """Test that None is returned on invalid ID."""
    result = task_repository.get_by_id(db_session, 999)
    assert result is None


def test_add_task(db_session):
    """Test that new task is stored."""
    task_data = TaskCreateModel(title="New task", description="Description")

    result = task_repository.add(db_session, task_data)

    assert result.id is not None
    assert result.title == "New task"
    assert result.description == "Description"

    db_task = db_session.query(Task).first()
    assert db_task is not None
    assert db_task.title == "New task"


def test_delete_existing_task(db_session):
    """Test that delete returns True on delete and it deletes the task."""
    task = Task(title="To Delete")
    db_session.add(task)
    db_session.commit()

    result = task_repository.delete(db_session, task.id)

    assert result is True
    assert db_session.query(Task).count() == 0


def test_delete_nonexistent_task(db_session):
    """Test that delete returns False on invalid ID."""
    result = task_repository.delete(db_session, 999)
    assert result is False


def test_update_task(db_session):
    """Test that tasks get updated and stored."""
    task = Task(title="Old Title")
    db_session.add(task)
    db_session.commit()

    updated_data = TaskCreateModel(title="Updated Title", description="Description")

    result = task_repository.update(db_session, task.id, updated_data)

    assert result is not None
    assert result.title == "Updated Title"

    db_task = db_session.query(Task).first()
    assert db_task.title == "Updated Title"


def test_update_nonexistent_task(db_session):
    """Test that update returns none if no task matches the ID."""
    updated_data = TaskCreateModel(title="Updated", description="Description")

    result = task_repository.update(db_session, 999, updated_data)

    assert result is None


def test_update_multiple_fields(db_session):
    """Test that all fields are updated."""
    task = Task(title="Old", description="Old desc")
    db_session.add(task)
    db_session.commit()

    updated_data = TaskCreateModel(title="New", description="New desc")

    result = task_repository.update(db_session, task.id, updated_data)

    assert result is not None
    assert result.title == "New"
    assert result.description == "New desc"
