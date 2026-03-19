from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TaskBaseModel(BaseModel):
    name: str
    description: Optional[str]
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
    epic_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)