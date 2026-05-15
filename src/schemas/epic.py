"""Pydantic models for Epic API endpoints."""

from pydantic import BaseModel, ConfigDict

from enums.kanban_status import KanbanStatus


class EpicBaseModel(BaseModel):
    """Base Pydantic model for Epic."""

    title: str
    description: str | None = None
    classification: str | None = None
    owner: str | None = None
    scope: str | None = None
    use_case: str | None = None
    user_story: str | None = None
    non_functional_requirements: str | None = None
    source: str | None = None
    confidence: float | None = None


class EpicCreateModel(EpicBaseModel):
    """Pydantic model for creating a new Epic."""

    pass


class EpicResponseModel(EpicBaseModel):
    """Pydantic model for Epic API responses."""

    id: int
    kanban_status: KanbanStatus

    model_config = ConfigDict(from_attributes=True)
