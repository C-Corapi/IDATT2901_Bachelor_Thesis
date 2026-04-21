import json
from unittest.mock import patch

from service.deliverable_service import extract_deliverables


def test_extract_deliverables_should_return_list_of_deliverables():
  fake_document = "This is a test document containing deliverables."

  fake_llm_response = json.dumps(
    {
      "deliverables": [
        {
          "title": "Deliverable 1",
          "requirements": "Requirements for Deliverable 1",
          "specifications": "Specifications for Deliverable 1",
          "properties": "Properties of Deliverable 1",
          "fit_criterion": "Fit criterion for Deliverable 1",
          "owner": "John Doe"
        },
        {
          "title": "Deliverable 2",
          "requirements": "Requirements for Deliverable 2",
          "specifications": "Specifications for Deliverable 2",
          "properties": "Properties of Deliverable 2",
          "fit_criterion": "Fit criterion for Deliverable 2",
          "owner": "Jane Smith"
        },
      ]
    }
  )

  with patch("service.deliverable_service.load_file", return_value=fake_document) as mock_load_file, \
        patch("service.deliverable_service.LlamaClient") as MockLlamaClient:
    mock_llm_instance = MockLlamaClient.return_value
    mock_llm_instance.generate.return_value = fake_llm_response
    result = extract_deliverables("fake_path.txt")

    assert len(result) == 2
    assert result[0].title == "Deliverable 1"
    assert result[1].requirements == "Requirements for Deliverable 2"
    assert result[0].specifications == "Specifications for Deliverable 1"