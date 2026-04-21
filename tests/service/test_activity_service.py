import json
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model.activity import Activity
from model.activity import Activity
from schemas.activity import ActivityCreateModel
from service.activity_service import extract_activities, save_activities_to_db, save_activities_to_db
from utils.database import Base

def test_extract_activities_should_return_list_of_activities():
  fake_document = "This is a test document containing activities."

  fake_llm_response = json.dumps({
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
              "status": "In Progress"
          },
      ]
  })

  with patch("service.activity_service.load_file", return_value=fake_document) as mock_load_file, \
        patch("service.activity_service.LlamaClient") as MockLlamaClient:
    
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
  fake_document = "This is a test document containing no activities."

  fake_llm_response = json.dumps({
      "activities": []
  })

  with patch("service.activity_service.load_file", return_value=fake_document) as mock_load_file, \
        patch("service.activity_service.LlamaClient") as MockLlamaClient:
    
    mock_llm_instance = MockLlamaClient.return_value
    mock_llm_instance.generate.return_value = fake_llm_response

    result = extract_activities("fake_path.txt")

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

def test_save_activities_to_db_should_save_activities_to_database(db_session):
  activities = [
  ActivityCreateModel(
      title="Activity 1",
      description="Desc 1",
      owner="John",
      status="Open"
    ),
    ActivityCreateModel(
      title="Activity 2",
      description="Desc 2",
      owner="Jane",
      status="In Progress"
    )
  ]

  result = save_activities_to_db(activities, db_session)

  assert len(result) == 2
  assert result[0].title == "Activity 1"
  assert result[1].title == "Activity 2"

  stored = db_session.query(Activity).all()
  assert len(stored) == 2
