"""Tests for the kanban service."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model.task import Task
from service.kanban_service import build_kanban_board
from utils.database import Base


@pytest.fixture
def db_session():
    """Fixture to create a new database session for each test."""
    engine = create_engine("sqlite:///:memory:")

    Base.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    yield session

    session.close()


def test_build_empty_board(db_session):
    """Test that build_kanban_board returns an empty board when there are no tasks in the database."""
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
