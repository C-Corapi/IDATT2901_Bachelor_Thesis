"""Tests for activity router."""

from unittest.mock import patch

from exceptions.common import ActivityNotFound


def test_get_all_activities(client):
    """Test get all activities responds 200."""
    mock_data = [
        {"id": 1, "title": "A1", "kanban_status": "todo"},
        {"id": 2, "title": "A2", "kanban_status": "done"},
    ]

    with patch("api.activity_router.activity_service.get_all_activities", return_value=mock_data):
        response = client.get("/activities/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "A1"
    assert data[0]["kanban_status"] == "todo"


def test_create_activity(client):
    """Test create activity responds 201."""
    input_data = {"title": "New Activity"}
    returned = {"id": 1, "title": "New Activity", "kanban_status": "backlog"}

    with patch(
        "api.activity_router.activity_service.save_activities_to_db",
        return_value=[returned],
    ):
        response = client.post("/activities/", json=input_data)

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "New Activity"
    assert data["kanban_status"] == "backlog"


def test_get_activity_success(client):
    """Test get activity success responds 200."""
    mock_activity = {"id": 1, "title": "Test", "kanban_status": "backlog"}

    with patch(
        "api.activity_router.activity_service.get_activity",
        return_value=mock_activity,
    ):
        response = client.get("/activities/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Test"
    assert data["kanban_status"] == "backlog"


def test_get_activity_not_found(client):
    """Test activity not found responds 404."""
    with patch(
        "api.activity_router.activity_service.get_activity",
        side_effect=ActivityNotFound(),
    ):
        response = client.get("/activities/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_delete_activity_success(client):
    """Test delete activity success responds 204."""
    with patch(
        "api.activity_router.activity_service.delete_activity",
        return_value=True,
    ):
        response = client.delete("/activities/1")

    assert response.status_code == 204
    assert response.content == b""


def test_delete_activity_not_found(client):
    """Test delete activity not found responds 404."""
    with patch(
        "api.activity_router.activity_service.delete_activity",
        return_value=False,
    ):
        response = client.delete("/activities/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"


def test_update_activity_success(client):
    """Test update activity success responds 200."""
    updated = {"id": 1, "title": "Updated", "kanban_status": "backlog"}
    payload = {"title": "Updated"}

    with patch(
        "api.activity_router.activity_service.update_activity",
        return_value=updated,
    ):
        response = client.put("/activities/1", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Updated"


def test_update_activity_not_found(client):
    """Test that update activity returns 404 when not found."""
    with patch(
        "api.activity_router.activity_service.update_activity",
        side_effect=ActivityNotFound(),
    ):
        response = client.put("/activities/999", json={"title": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"
