import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model.task import Task
from service.kanban_service import build_kanban_board
from utils.database import Base

@pytest.fixture
def db():
  engine = create_engine("sqlite:///:memory:")

  Base.metadata.create_all(engine)

  Session = sessionmaker(bind=engine)
  session = Session()

  yield session

  session.close()

def test_build_empty_board(db):
  board = build_kanban_board(db)

  assert board.todo == []
  assert board.in_progress == []
  assert board.done == []

def test_build_board_with_tasks(db):
  task1 = Task(title="Task 1", description="Description of Task 1", owner="John Doe", kanban_status="todo")
  task2 = Task(title="Task 2", description="Description of Task 2", owner="Jane Smith", kanban_status="in_progress")
  task3 = Task(title="Task 3", description="Description of Task 3", owner="Alice Johnson", kanban_status="done")

  db.add_all([task1, task2, task3])
  db.commit()

  board = build_kanban_board(db)

  assert len(board.todo) == 1
  assert board.todo[0].title == "Task 1"
  
  assert len(board.in_progress) == 1
  assert board.in_progress[0].title == "Task 2"
  
  assert len(board.done) == 1
  assert board.done[0].title == "Task 3"  