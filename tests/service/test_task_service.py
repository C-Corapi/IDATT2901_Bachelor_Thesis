import json
from unittest.mock import patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model.task import Task
from schemas.task import TaskCreateModel
from service.task_service import extract_tasks, save_tasks_to_db
from utils.database import Base


def test_extract_taskts_should_return_list_of_tasks():
  fake_document = "This is a test document containing tasks."

  fake_llm_response = json.dumps({
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
              "status": "In Progress"
          },
      ]
  })

  with patch("service.task_service.load_file", return_value=fake_document) as mock_load_file, \
        patch("service.task_service.LlamaClient") as MockLlamaClient:
    
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
  fake_document = "This is a test document containing no tasks."

  fake_llm_response = json.dumps({
      "tasks": []
  })

  with patch("service.task_service.load_file", return_value=fake_document) as mock_load_file, \
        patch("service.task_service.LlamaClient") as MockLlamaClient:
    
    mock_llm_instance = MockLlamaClient.return_value
    mock_llm_instance.generate.return_value = fake_llm_response

    result = extract_tasks("fake_path.txt")

    assert isinstance(result, list)
    assert len(result) == 0

@pytest.fixture
def db_session():
  engine = create_engine("sqlite:///:memory:")

  Base.metadata.create_all(engine)

  TestingSession = sessionmaker(bind=engine)
  session = TestingSession()

  yield session

  session.close()

def test_save_tasks_to_db(db_session):
    tasks = [
        TaskCreateModel(
            title="Task 1",
            description="Description of Task 1",
            owner="John Doe",
            status="Open",
            time_logged="2024-06-01T10:00:00Z"
        ),
        TaskCreateModel(
            title="Task 2",
            description="Description of Task 2",
            owner="Jane Smith",
            status="In Progress",
            target_date="2024-06-15T17:00:00Z"
        ),
    ]

    save_tasks_to_db(tasks, db_session)

    result  = db_session.query(Task).all()
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