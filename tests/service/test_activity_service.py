import json
from unittest.mock import MagicMock, patch

from service.activity_service import extract_activities

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
