"""Pydantic models for Epic API endpoints."""

from typing import Optional

from pydantic import BaseModel, ConfigDict


class EpicBase(BaseModel):
    """Base Pydantic model for Epic."""
    name: str
    description: str
    classification: Optional[str] = None
    owner: Optional[str] = None
    scope: Optional[str] = None
    use_case: Optional[str] = None
    user_story: Optional[str] = None
    non_functional_requirements: Optional[str] = None


class EpicCreate(EpicBase):
    """Pydantic model for creating a new Epic."""

    pass


class EpicResponse(EpicBase):
    """Pydantic model for Epic API responses."""

    id: int

    model_config = ConfigDict(from_attributes=True)
