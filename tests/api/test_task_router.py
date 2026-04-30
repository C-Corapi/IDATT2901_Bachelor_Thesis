"""Test for task router."""

from unittest.mock import patch

from exceptions.common import TaskNotFound


def test_get_all_tasks(client):
    """Test get all tasks responds 200."""
    mock_data = [
        {"id": 1, "title": "D1", "kanban_status": "todo"},
        {"id": 2, "title": "D2", "kanban_status": "done"},
    ]

    with patch("api.task_router.task_service.get_all_tasks", return_value=mock_data):
        response = client.get("/tasks/")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "D1"
    assert data[0]["kanban_status"] == "todo"


def test_create_task(client):
    """Test create task responds 201."""
    input_data = {"title": "New task"}
    returned = {"id": 1, "title": "New task", "kanban_status": "backlog"}

    with patch(
        "api.task_router.task_service.save_tasks_to_db",
        return_value=[returned],
    ):
        response = client.post("/tasks/", json=input_data)

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "New task"
    assert data["kanban_status"] == "backlog"


def test_get_task_success(client):
    """Test get task success responds 200."""
    mock_task = {"id": 1, "title": "Test", "kanban_status": "backlog"}

    with patch(
        "api.task_router.task_service.get_task",
        return_value=mock_task,
    ):
        response = client.get("/tasks/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Test"
    assert data["kanban_status"] == "backlog"


def test_get_task_not_found(client):
    """Test task not found responds 404."""
    with patch(
        "api.task_router.task_service.get_task",
        side_effect=TaskNotFound(),
    ):
        response = client.get("/tasks/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_delete_task_success(client):
    """Test delete task success responds 204."""
    with patch(
        "api.task_router.task_service.delete_task",
        return_value=True,
    ):
        response = client.delete("/tasks/1")

    assert response.status_code == 204
    assert response.content == b""


def test_delete_task_not_found(client):
    """Test delete task not found responds 404."""
    with patch(
        "api.task_router.task_service.delete_task",
        return_value=False,
    ):
        response = client.delete("/tasks/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_update_task_success(client):
    """Test update task success responds 200."""
    updated = {"id": 1, "title": "Updated", "kanban_status": "backlog"}
    payload = {"title": "Updated"}

    with patch(
        "api.task_router.task_service.update_task",
        return_value=updated,
    ):
        response = client.put("/tasks/1", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == "Updated"


def test_update_task_not_found(client):
    """Test that update task returns 404 when not found."""
    with patch(
        "api.task_router.task_service.update_task",
        side_effect=TaskNotFound(),
    ):
        response = client.put("/tasks/999", json={"title": "X"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"
