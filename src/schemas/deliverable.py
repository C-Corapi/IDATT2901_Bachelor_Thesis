"""Pydantic models for Deliverable API requests and responses."""

from typing import Optional

from pydantic import BaseModel, ConfigDict

from enums.canban_status import CanbanStatus


class DeliverableBaseModel(BaseModel):
    """Base Pydantic model for Deliverable."""

    title: str
    requirements: str
    specifications: str
    properties: str
    fit_criterion: str
    owner: Optional[str] = None


class DeliverableCreateModel(DeliverableBaseModel):
    """Pydantic model for creating a new Deliverable."""

    pass


class DeliverableResponseModel(DeliverableBaseModel):
    """Pydantic model for Deliverable API responses."""

    id: int
    canban_status: Optional[CanbanStatus]

    model_config = ConfigDict(from_attributes=True)
