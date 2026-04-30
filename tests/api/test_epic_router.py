"""Tests for epic router."""

from unittest.mock import patch

from exceptions.common import EpicNotFound


def test_get_all_epics(client):
    """Test get all epics responds 200."""
    mock_data = [
        {"id": 1, "title": "D1", "kanban_status": "todo"},
        {"id": 2, "title": "D2", "kanban_status": "done"},
    ]

    with patch("api.epic_router.epic_service.get_all_epics", return_value=mock_data):
        response = client.get("/epics/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "D1"
    assert data[0]["kanban_status"] == "todo"


def test_create_epic(client):
    """Test create epic responds 201."""
    input_data = {"title": "New epic"}
    returned = {"id": 1, "title": "New epic", "kanban_status": "backlog"}

    with patch(
        "api.epic_router.epic_service.save_epics_to_db",
        return_value=[returned],
    ):
        response = client.post("/epics/", json=input_data)

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "New epic"
    assert data["kanban_status"] == "backlog"


def test_get_epic_success(client):
    """Test get epic success responds 200."""
    mock_epic = {"id": 1, "title": "Test", "kanban_status": "backlog"}

    with patch(
        "api.epic_router.epic_service.get_epic",
        return_value=mock_epic,
    ):
        response = client.get("/epics/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Test"
    assert data["kanban_status"] == "backlog"


def test_get_epic_not_found(client):
    """Test epic not found responds 404."""
    with patch(
        "api.epic_router.epic_service.get_epic",
        side_effect=EpicNotFound(),
    ):
        response = client.get("/epics/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Epic not found"


def test_delete_epic_success(client):
    """Test delete epic success responds 204."""
    with patch(
        "api.epic_router.epic_service.delete_epic",
        return_value=True,
    ):
        response = client.delete("/epics/1")

    assert response.status_code == 204
    assert response.content == b""


def test_delete_epic_not_found(client):
    """Test delete epic not found responds 404."""
    with patch(
        "api.epic_router.epic_service.delete_epic",
        return_value=False,
    ):
        response = client.delete("/epics/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Epic not found"


def test_update_epic_success(client):
    """Test update epic success responds 200."""
    updated = {"id": 1, "title": "Updated", "kanban_status": "backlog"}
    payload = {"title": "Updated"}

    with patch(
        "api.epic_router.epic_service.update_epic",
        return_value=updated,
    ):
        response = client.put("/epics/1", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Updated"


def test_update_epic_not_found(client):
    """Test that update epic returns 404 when not found."""
    with patch(
        "api.epic_router.epic_service.update_epic",
        side_effect=EpicNotFound(),
    ):
        response = client.put("/epics/999", json={"title": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Epic not found"
