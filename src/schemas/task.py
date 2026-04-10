"""Pydantic schemas for Task-related data validation and serialization."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from enums.kanban_status import KanbanStatus


class TaskBaseModel(BaseModel):
    """Base Pydantic model for Task.

    Contains common fields for both creation and response models.
    """

    name: str
    description: Optional[str] = None
    owner: Optional[str] = None
    status: Optional[str] = None
    time_logged: datetime
    target_date: Optional[date] = None


class TaskCreateModel(TaskBaseModel):
    """Pydantic model for creating a new Task."""

    pass


class TaskResponseModel(TaskBaseModel):
    """Pydantic model for Task API responses."""

    id: int
    kanban_status: Optional[KanbanStatus]

    model_config = ConfigDict(from_attributes=True)
