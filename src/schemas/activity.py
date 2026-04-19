"""Pydantic models for Activity API endpoints."""

from pydantic import BaseModel, ConfigDict

from enums.kanban_status import KanbanStatus


class ActivityBaseModel(BaseModel):
    """Base Pydantic model for Activity."""

    title: str
    description: str | None = None
    owner: str | None = None
    status: str | None = None


class ActivityCreateModel(ActivityBaseModel):
    """Pydantic model for creating a new Activity."""

    pass


class ActivityResponseModel(ActivityBaseModel):
    """Pydantic model for Activity API responses."""

    id: int
    kanban_status: KanbanStatus

    model_config = ConfigDict(from_attributes=True)
