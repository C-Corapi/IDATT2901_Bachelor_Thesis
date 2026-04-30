"""Service layer for logic related to Delivarables."""

import json
from typing import Any

from sqlalchemy.orm import Session

from exceptions.common import DeliverableNotFound
from model.deliverable import Deliverable
from prompts.deliverable_extraction import DELIVERABLE_EXTRACTION_PROMPT
from repository import deliverable_repository
from schemas.deliverable import DeliverableCreateModel
from utils.file_loader import load_file
from utils.llm_client import LlamaClient


def extract_deliverables(filepath: str) -> list[DeliverableCreateModel]:
    """Extract deliverables from a given file using an LLM."""
    llm = LlamaClient()

    document: str = load_file(filepath)

    response: str = llm.generate(system_prompt=DELIVERABLE_EXTRACTION_PROMPT, prompt=document)
    print("LLM response:", response)

    # Converts response to dictionary, then to list of DeliverableCreateModel instances.
    data: dict[str, Any] = json.loads(response)
    deliverables: list[DeliverableCreateModel] = [
        DeliverableCreateModel(**d) for d in data.get("deliverables", [])
    ]

    return deliverables


def save_deliverables_to_db(
    deliverables: list[DeliverableCreateModel], db: Session
) -> list[Deliverable]:
    """Save a list of DeliverableCreateModel instances to the database."""
    db_deliverables = [Deliverable(**d.model_dump()) for d in deliverables]
    db.add_all(db_deliverables)
    db.commit()
    for deliverable in db_deliverables:
        db.refresh(deliverable)
    return db_deliverables


def get_all_deliverables(db: Session) -> list[Deliverable]:
    """Retrieve all deliverables from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Deliverable]: A list of all deliverables in the database.
    """
    return deliverable_repository.get_all(db)


def get_deliverable(db: Session, deliverable_id: int) -> Deliverable:
    """Retrieve a deliverable by its ID.

    Args:
        db (Session): The database session.
        deliverable_id (int): The ID of the deliverable to retrieve.

    Returns:
        Deliverable: The deliverable with the specified ID.
    Raise:
        DeliverableNotFound: If no deliverable with the specified ID is found.
    """
    deliverable: Deliverable | None = deliverable_repository.get_by_id(db, deliverable_id)

    if deliverable is None:
        raise DeliverableNotFound()

    return deliverable


def delete_deliverable(db: Session, deliverable_id: int) -> bool:
    """Deletes a deliverable by its ID.

    Args:
        db (Session): The database session.
        deliverable_id (int): The ID of the deliverable to delete.

    Returns:
        bool: True if a deliverable was deleted, False otherwise.
    """
    return deliverable_repository.delete(db, deliverable_id)


def update_deliverable(
    db: Session, deliverable_id: int, updated_deliverable: DeliverableCreateModel
) -> Deliverable:
    """Updates a deliverable by its ID.

    Args:
        db (Session): The database session.
        deliverable_id (int): The ID of the deliverable to update.
        updated_deliverable (DeliverableCreateModel): The updated deliverable data.

    Returns:
        Deliverable: The updated deliverable.

    Raises:
        DeliverableNotFound: If no deliverable with the specified ID is found.
    """
    deliverable: Deliverable | None = deliverable_repository.update(
        db, deliverable_id, updated_deliverable
    )

    if deliverable is None:
        raise DeliverableNotFound()

    return deliverable
