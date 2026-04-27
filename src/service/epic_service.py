"""Service layer for logic related to Epics."""

import json
from typing import Any

from sqlalchemy.orm import Session

from exceptions.common import EpicNotFound
from model.epic import Epic
from prompts.epic_extraction import EPIC_EXTRACTION_PROMPT
from repository import epic_repository
from schemas.epic import EpicCreateModel
from utils.file_loader import load_file
from utils.llm_client import LlamaClient


def extract_epics(filepath: str) -> list[EpicCreateModel]:
    """Extract epics from a given file using an LLM."""
    llm = LlamaClient()

    document: str = load_file(filepath)
    response: str = llm.generate(system_prompt=EPIC_EXTRACTION_PROMPT, prompt=document)

    # Converts response to dictionary, then to list of EpicCreateModel instances.
    data: dict[str, Any] = json.loads(response)
    epics: list[EpicCreateModel] = [EpicCreateModel(**d) for d in data.get("epics", [])]

    return epics


def save_epics_to_db(epics: list[EpicCreateModel], db: Session) -> list[Epic]:
    """Save a list of EpicCreateModel instances to the database."""
    db_epics = [Epic(**e.model_dump()) for e in epics]
    db.add_all(db_epics)
    db.commit()
    for epic in db_epics:
        db.refresh(epic)
    return db_epics

def get_all_epics(db: Session) -> list[Epic]:
    """Retrives all epics from the database.
    
    Args:
        db (Session): The database session.

    Returns:
        list[Epic]: A list of all epics int the database.
    """
    return epic_repository.get_all(db)

def get_epic(db: Session, epic_id: int) -> Epic:
    """Retrieve an epic by its ID.
    
    Args:
        db (Session): The database session.
        epic_id (int): The ID of the epic to retrieve.

    Returns:
        Epic: The epic with the specified ID.

    Raises:
        EpicNotFound: If no epic with the specified ID is found.
    """
    epic: Epic | None = epic_repository.get_by_id(db, epic_id)

    if epic is None:
        raise EpicNotFound()
    
    return epic


def delete_epic(db: Session, epic_id: int):
    """Deletes an epic by its id.
    
    Args:
        db (Session): The database session.
        epic_id (int): The ID of the epic to delete.

    Returns:
        bool: True if an epic was deleted, False otherwise.
    """
    return epic_repository.delete(db, epic_id)

def update_epic(db: Session, epic_id: int, updated_epic: EpicCreateModel) -> Epic:
    """Updates an epic by its ID.
    
    Args:
        db (Session): The database session.
        epic_id (int): The ID of the epic to update.

    Returns:
        Epic: The updated epic.
    
    Raises:
        EpicNotFound: If no peic with the specified ID is found.
    """
    epic: Epic | None = epic_repository.update(db, epic_id, updated_epic)

    if epic is None:
        raise EpicNotFound()
    
    return epic
