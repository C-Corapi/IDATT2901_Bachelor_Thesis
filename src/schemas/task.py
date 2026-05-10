"""Pydantic schemas for Task-related data validation and serialization."""

from pydantic import BaseModel, ConfigDict

from enums.kanban_status import KanbanStatus


class TaskBaseModel(BaseModel):
    """Base Pydantic model for Task.

    Contains common fields for both creation and response models.
    """

    title: str
    description: str | None = None
    owner: str | None = None
    status: str | None = None
    time_logged: str | None = None
    target_date: str | None = None
    source: str | None = None


class TaskCreateModel(TaskBaseModel):
    """Pydantic model for creating a new Task."""

    pass


class TaskResponseModel(TaskBaseModel):
    """Pydantic model for Task API responses."""

    id: int
    kanban_status: KanbanStatus

    model_config = ConfigDict(from_attributes=True)
