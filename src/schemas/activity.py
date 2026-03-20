from typing import Optional

from pydantic import BaseModel, ConfigDict


class ActivityBaseModel(BaseModel):
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
    epic_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
