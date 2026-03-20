from typing import Optional

from pydantic import BaseModel, ConfigDict


class DeliverableBaseModel(BaseModel):
    name: str
    description: str
    alternatives: str
    nature: str
    reach: str
    deadline: Optional[str] = None
    owner: Optional[str] = None


class DeliverableCreateModel(DeliverableBaseModel):
    """Pydantic model for creating a new Deliverable."""

    pass


class DeliverableResponseModel(DeliverableBaseModel):
    """Pydantic model for Deliverable API responses."""

    id: int

    model_config = ConfigDict(from_attributes=True)
