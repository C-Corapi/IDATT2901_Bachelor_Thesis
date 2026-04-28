from unittest.mock import patch

from exceptions.common import DeliverableNotFound


def test_get_all_deliverables(client):
    """Test get all deliverables responds 200."""
    mock_data = [
        {"id": 1, "title": "D1", "kanban_status": "todo"},
        {"id": 2, "title": "D2", "kanban_status": "done"},
    ]

    with patch("api.deliverable_router.deliverable_service.get_all_deliverables", return_value=mock_data):
        response = client.get("/deliverables/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "D1"
    assert data[0]["kanban_status"] == "todo"

def test_create_deliverable(client):
    """Test create deliverable responds 201."""
    input_data = {"title": "New deliverable"}
    returned = {"id": 1, "title": "New deliverable", "kanban_status": "backlog"}

    with patch(
        "api.deliverable_router.deliverable_service.save_deliverables_to_db",
        return_value=[returned],
    ):
        response = client.post("/deliverables/", json=input_data)

    assert response.status_code == 201
    
    data = response.json()

    assert data["title"] == "New deliverable"
    assert data["kanban_status"] == "backlog"

def test_get_deliverable_success(client):
    """Test get deliverable success responds 200."""
    mock_deliverable = {"id": 1, "title": "Test", "kanban_status": "backlog"}

    with patch(
        "api.deliverable_router.deliverable_service.get_deliverable",
        return_value=mock_deliverable,
    ):
        response = client.get("/deliverables/1")

    assert response.status_code == 200
    
    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Test"
    assert data["kanban_status"] == "backlog"

def test_get_deliverable_not_found(client):
    """Test deliverable not found responds 404."""
    with patch(
        "api.deliverable_router.deliverable_service.get_deliverable",
        side_effect=DeliverableNotFound(),
    ):
        response = client.get("/deliverables/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Deliverable not found"

def test_delete_deliverable_success(client):
    """Test delete deliverable success responds 204"""
    with patch(
        "api.deliverable_router.deliverable_service.delete_deliverable",
        return_value=True,
    ):
        response = client.delete("/deliverables/1")

    assert response.status_code == 204
    assert response.content == b""

def test_delete_deliverable_not_found(client):
    """Test delete deliverable not found responds 404."""
    with patch(
        "api.deliverable_router.deliverable_service.delete_deliverable",
        return_value=False,
    ):
        response = client.delete("/deliverables/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Deliverable not found"

def test_update_deliverable_success(client):
    """Test update deliverable success responds 200."""
    updated = {"id": 1, "title": "Updated", "kanban_status": "backlog"}
    payload = {"title": "Updated"}

    with patch(
        "api.deliverable_router.deliverable_service.update_deliverable",
        return_value=updated,
    ):
        response = client.put("/deliverables/1", json=payload)

    assert response.status_code == 200
    
    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Updated"

def test_update_deliverable_not_found(client):
    """Test that update deliverable returns 404 when not found."""
    with patch(
        "api.deliverable_router.deliverable_service.update_deliverable",
        side_effect=DeliverableNotFound(),
    ):
        response = client.put("/deliverables/999", json={"title": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Deliverable not found"
