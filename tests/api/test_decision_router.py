from unittest.mock import patch

from exceptions.common import DecisionNotFound


def test_get_all_decisions(client):
    """Test get all decisions responds 200."""
    mock_data = [
        {"id": 1, "title": "D1", "kanban_status": "todo"},
        {"id": 2, "title": "D2", "kanban_status": "done"},
    ]

    with patch("api.decision_router.decision_service.get_all_decisions", return_value=mock_data):
        response = client.get("/decisions/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "D1"
    assert data[0]["kanban_status"] == "todo"

def test_create_decision(client):
    """Test create decision responds 201."""
    input_data = {"title": "New decision"}
    returned = {"id": 1, "title": "New decision", "kanban_status": "backlog"}

    with patch(
        "api.decision_router.decision_service.save_decisions_to_db",
        return_value=[returned],
    ):
        response = client.post("/decisions/", json=input_data)

    assert response.status_code == 201
    
    data = response.json()

    assert data["title"] == "New decision"
    assert data["kanban_status"] == "backlog"

def test_get_decision_success(client):
    """Test get decision success responds 200."""
    mock_decision = {"id": 1, "title": "Test", "kanban_status": "backlog"}

    with patch(
        "api.decision_router.decision_service.get_decision",
        return_value=mock_decision,
    ):
        response = client.get("/decisions/1")

    assert response.status_code == 200
    
    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Test"
    assert data["kanban_status"] == "backlog"

def test_get_decision_not_found(client):
    """Test decision not found responds 404."""
    with patch(
        "api.decision_router.decision_service.get_decision",
        side_effect=DecisionNotFound(),
    ):
        response = client.get("/decisions/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Decision not found"

def test_delete_decision_success(client):
    """Test delete decision success responds 204"""
    with patch(
        "api.decision_router.decision_service.delete_decision",
        return_value=True,
    ):
        response = client.delete("/decisions/1")

    assert response.status_code == 204
    assert response.content == b""

def test_delete_decision_not_found(client):
    """Test delete decision not found responds 404."""
    with patch(
        "api.decision_router.decision_service.delete_decision",
        return_value=False,
    ):
        response = client.delete("/decisions/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Decision not found"

def test_update_decision_success(client):
    """Test update decision success responds 200."""
    updated = {"id": 1, "title": "Updated", "kanban_status": "backlog"}
    payload = {"title": "Updated"}

    with patch(
        "api.decision_router.decision_service.update_decision",
        return_value=updated,
    ):
        response = client.put("/decisions/1", json=payload)

    assert response.status_code == 200
    
    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Updated"

def test_update_decision_not_found(client):
    """Test that update decision returns 404 when not found."""
    with patch(
        "api.decision_router.decision_service.update_decision",
        side_effect=DecisionNotFound(),
    ):
        response = client.put("/decisions/999", json={"title": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Decision not found"
