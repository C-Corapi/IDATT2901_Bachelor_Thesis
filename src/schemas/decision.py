from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

class DecisionBaseMode(BaseModel):
    name: str
    description: str
    alternatives: str
    nature: str
    reach: str
    deadline: Optional[datetime] = None
    owner: Optional[str] = None

class DecisionCreateModel(DecisionBaseMode):
    """Pydantic model for creating a new Decision."""
    pass

class DecisionResponseModel(DecisionBaseMode):
    """Pydantic model for Decision API responses."""
    id: int

    model_config = ConfigDict(from_attributes=True)