"""Service layer for logic related to Activities."""

import json
from typing import Any

from sqlalchemy.orm import Session

from exceptions.common import ActivityNotFound
from model.activity import Activity
from prompts.activity_extraction import ACTIVITY_EXTRACTION_PROMPT
from repository import acitvity_repository
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


def get_all_activities(db: Session) -> list[Activity]:
    """Retrieve all activities from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Activity]: A list of all activities in the database.
    """
    return acitvity_repository.get_all(db)


def get_activity(db: Session, activity_id: int) -> Activity:
    """Retrieve an activity by its ID.

    Args:
        db (Session): The database session.
        activity_id (int): The ID of the activity to retrieve.

    Returns:
        Activity: The activity with the specified ID.

    Raises:
        ActivityNotFound: If no activity with the specified ID is found.
    """
    activity: Activity | None = acitvity_repository.get_by_id(db, activity_id)

    if activity is None:
        raise ActivityNotFound()

    return activity


def delete_activity(db: Session, activity_id: int) -> bool:
    """Delete an activity by its ID.

    Args:
        db (Session): The database session.
        activity_id (int): The ID of the activity to delete.

    Returns:
        bool: True if an activity was deleted, False otherwise.
    """
    return acitvity_repository.delete(db, activity_id)


def update_activity(
    db: Session, activity_id: int, updated_activity: ActivityCreateModel
) -> Activity:
    """Update an activity by its ID.

    Args:
        db (Session): The database session.
        activity_id (int): The ID of the activity to update.
        updated_activity (ActivityCreateModel): The updated activity data.

    Returns:
        Activity: The updated activity.

    Raises:
        ActivityNotFound: If no activity with the specified ID is found.
    """
    activity: Activity | None = acitvity_repository.update(db, activity_id, updated_activity)

    if activity is None:
        raise ActivityNotFound()

    return activity
