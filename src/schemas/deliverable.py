"""Pydantic models for Deliverable API requests and responses."""

from typing import Optional

from pydantic import BaseModel, ConfigDict

from enums.kanban_status import KanbanStatus


class DeliverableBaseModel(BaseModel):
    """Base Pydantic model for Deliverable."""

    title: str
    requirements: str | None = None
    specifications: str | None = None
    properties: str | None = None
    fit_criterion: str | None = None
    owner: str | None = None


class DeliverableCreateModel(DeliverableBaseModel):
    """Pydantic model for creating a new Deliverable."""

    pass


class DeliverableResponseModel(DeliverableBaseModel):
    """Pydantic model for Deliverable API responses."""

    id: int
    kanban_status: KanbanStatus

    model_config = ConfigDict(from_attributes=True)
