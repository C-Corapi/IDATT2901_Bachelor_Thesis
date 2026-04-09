"""Pydantic models for Decision API requests and responses."""

from typing import Optional

from pydantic import BaseModel, ConfigDict

from enums.canban_status import CanbanStatus


class DecisionBaseModel(BaseModel):
    """Base Pydantic model for Decision."""

    title: str
    description: str
    alternatives: Optional[str] = None
    nature: Optional[str] = None
    reach: Optional[str] = None
    deadline: Optional[str] = None
    owner: Optional[str] = None


class DecisionCreateModel(DecisionBaseModel):
    """Pydantic model for creating a new Decision."""

    pass


class DecisionResponseModel(DecisionBaseModel):
    """Pydantic model for Decision API responses."""

    id: int
    canban_status: Optional[CanbanStatus]

    model_config = ConfigDict(from_attributes=True)
