import json
from unittest.mock import patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model.decision import Decision
from schemas.decision import DecisionCreateModel
from service.decision_service import extract_decisions, save_decisions_to_db
from utils.database import Base

def extract_decisions_should_return_list_of_decisions():
  fake_document = "This is a test document containing decisions."

  fake_llm_response = json.dumps({
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
              "owner": "Jane Smith"
          },
      ]
  })

  with patch("service.decision_service.load_file", return_value=fake_document) as mock_load_file, \
        patch("service.decision_service.LlamaClient") as MockLlamaClient:
    
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
  fake_document = "This is a test document containing no decisions."

  fake_llm_response = json.dumps({
      "decisions": []
  })

  with patch("service.decision_service.load_file", return_value=fake_document) as mock_load_file, \
        patch("service.decision_service.LlamaClient") as MockLlamaClient:
    
    mock_llm_instance = MockLlamaClient.return_value
    mock_llm_instance.generate.return_value = fake_llm_response

    result = extract_decisions("fake_path.txt")

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

def test_save_decisions_to_db_should_save_decisions_to_database(db_session):
  decisions = [
    DecisionCreateModel(
      title="Decision 1",
      description="Description of Decision 1",
      alternatives="Alternatives for Decision 1",
      nature="Nature of Decision 1",
      reach="Reach of Decision 1",
      deadline="Deadline for Decision 1",
      owner="John Doe"
    ),
    DecisionCreateModel(
      title="Decision 2",
      description="Description of Decision 2",
      alternatives="Alternatives for Decision 2",
      nature="Nature of Decision 2",
      reach="Reach of Decision 2",
      deadline="Deadline for Decision 2",
      owner="Jane Smith"
    )
  ]

  result = save_decisions_to_db(decisions, db_session)

  assert len(result) == 2
  assert result[0].id is not None
  assert result[0].title == "Decision 1"

  stored = db_session.query(Decision).all()
  assert len(stored) == 2