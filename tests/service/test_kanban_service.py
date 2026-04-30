"""Tests for the kanban service."""

import pytest

from enums.kanban_status import KanbanStatus
from model.task import Task
from schemas.kanban import KanbanCard
from service import kanban_service
from service.kanban_service import build_kanban_board


def test_build_empty_board(db_session):
    """Test that build_kanban_board returns an empty board when there is no metadata."""
    board = build_kanban_board(db_session)

    assert board.todo == []
    assert board.in_progress == []
    assert board.done == []


def test_build_board_with_tasks(db_session):
    """Test that build_kanban_board correctly categorizes tasks based on their kanban_status."""
    task1 = Task(
        title="Task 1", description="Description of Task 1", owner="John Doe", kanban_status="todo"
    )
    task2 = Task(
        title="Task 2",
        description="Description of Task 2",
        owner="Jane Smith",
        kanban_status="in_progress",
    )
    task3 = Task(
        title="Task 3",
        description="Description of Task 3",
        owner="Alice Johnson",
        kanban_status="done",
    )

    db_session.add_all([task1, task2, task3])
    db_session.commit()

    board = build_kanban_board(db_session)

    assert len(board.todo) == 1
    assert board.todo[0].title == "Task 1"

    assert len(board.in_progress) == 1
    assert board.in_progress[0].title == "Task 2"

    assert len(board.done) == 1
    assert board.done[0].title == "Task 3"


def test_update_task_status(db_session):
    """Test updating card status in DB."""
    task = Task(title="Task", kanban_status=KanbanStatus.TODO)
    db_session.add(task)
    db_session.commit()

    card = KanbanCard(id=task.id, type="Task", title="Task", kanban_status=KanbanStatus.DONE)

    kanban_service.update_kanban_card_in_db(card, db_session)

    updated = db_session.query(Task).first()
    assert updated.kanban_status == "done"


def test_update_unknown_type_raises(db_session):
    """Test that invalid metadata type raises."""
    card = KanbanCard(id=1, type="Unknown", title="X", kanban_status=KanbanStatus.TODO)

    with pytest.raises(ValueError, match="Unknown card type"):
        kanban_service.update_kanban_card_in_db(card, db_session)


def test_update_nonexistent_element_raises(db_session):
    """Test that updating a invalid metadata ID raises."""
    card = KanbanCard(id=999, type="Task", title="X", kanban_status=KanbanStatus.DONE)

    with pytest.raises(ValueError, match="not found"):
        kanban_service.update_kanban_card_in_db(card, db_session)


def test_map_task_to_card():
    """Test mapping a metadata type to a card."""
    task = Task(id=1, title="Test", kanban_status="todo")
    card = kanban_service.map_task_to_card(task)

    assert card.id == 1
    assert card.title == "Test"
    assert card.type == "Task"
    assert card.kanban_status == "todo"
