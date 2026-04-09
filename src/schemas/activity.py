"""Pydantic models for Activity API endpoints."""

from typing import Optional

from pydantic import BaseModel, ConfigDict

from enums.canban_status import CanbanStatus


class ActivityBaseModel(BaseModel):
    """Base Pydantic model for Activity."""

    name: str
    description: Optional[str]
    owner: Optional[str] = None
    status: Optional[str] = None


class ActivityCreateModel(ActivityBaseModel):
    """Pydantic model for creating a new Activity."""

    pass


class ActivityResponseModel(ActivityBaseModel):
    """Pydantic model for Activity API responses."""

    id: int
    canban_status: Optional[CanbanStatus]

    model_config = ConfigDict(from_attributes=True)
