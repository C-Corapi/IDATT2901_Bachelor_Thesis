"""Service layer for logic related to Activities."""

import json
from typing import Any

from sqlalchemy.orm import Session

from model.activity import Activity
from prompts.activity_extraction import ACTIVITY_EXTRACTION_PROMPT
from schemas.activity import ActivityCreateModel
from utils.file_loader import load_file
from utils.llm_client import LlamaClient


def extract_activities(filepath: str) -> list[ActivityCreateModel]:
    """Extract activities from a given file using an LLM."""
    llm = LlamaClient()

    document: str = load_file(filepath)

    response: str = llm.generate(system_prompt=ACTIVITY_EXTRACTION_PROMPT, prompt=document)

    # Converts response to dictionary, then to list of ActivityCreateModel instances.
    data: dict[str, Any] = json.loads(response)
    activities: list[ActivityCreateModel] = [
        ActivityCreateModel(**d) for d in data.get("activities", [])
    ]

    return activities

def save_activities_to_db(activities: list[ActivityCreateModel], db: Session) -> list[Activity]:
    """Save a list of ActivityCreateModel instances to the database."""
    db_activities = [Activity(**a.model_dump()) for a in activities]
    db.add_all(db_activities)
    db.commit()
    for activity in db_activities:
        db.refresh(activity)
    return db_activities