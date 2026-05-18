"""Pydantic models for Decision API requests and responses."""

from pydantic import BaseModel, ConfigDict

from enums.kanban_status import KanbanStatus


class DecisionBaseModel(BaseModel):
    """Base Pydantic model for Decision."""

    title: str
    description: str | None = None
    alternatives: str | None = None
    nature: str | None = None
    reach: str | None = None
    deadline: str | None = None
    owner: str | None = None
    source: str | None = None
    confidence: float | None = None


class DecisionCreateModel(DecisionBaseModel):
    """Pydantic model for creating a new Decision."""

    pass


class DecisionResponseModel(DecisionBaseModel):
    """Pydantic model for Decision API responses."""

    id: int
    kanban_status: KanbanStatus

    model_config = ConfigDict(from_attributes=True)
