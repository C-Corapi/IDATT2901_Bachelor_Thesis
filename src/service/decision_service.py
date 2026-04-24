"""Service layer for handling business logic related to Decisions."""

import json
from typing import Any

from sqlalchemy.orm import Session

from exceptions.common import DecisionNotFound
from model.decision import Decision
from prompts.decision_extraction import DECISION_EXTRACTION_PROMPT
from repository import decision_repository
from schemas.decision import DecisionCreateModel
from utils.file_loader import load_file
from utils.llm_client import LlamaClient


def extract_decisions(filepath: str) -> list[DecisionCreateModel]:
    """Extract decisions from a given file using an LLM."""
    llm = LlamaClient()

    document: str = load_file(filepath)

    response: str = llm.generate(system_prompt=DECISION_EXTRACTION_PROMPT, prompt=document)

    # Converts response to dictionary, then to list of DecisionCreateModel instances.
    data: dict[str, Any] = json.loads(response)
    decisions: list[DecisionCreateModel] = [
        DecisionCreateModel(**d) for d in data.get("decisions", [])
    ]

    return decisions


def save_decisions_to_db(decisions: list[DecisionCreateModel], db: Session) -> list[Decision]:
    """Save a list of DecisionsCreateModel instances to the database."""
    db_decisions = [Decision(**d.model_dump()) for d in decisions]
    db.add_all(db_decisions)
    db.commit()
    for decision in db_decisions:
        db.refresh(decision)
    return db_decisions


def get_all_decisions(db: Session) -> list[Decision]:
    """Retrieve all decisions from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Decision]: A list of all decisions in the database.
    """
    return decision_repository.get_all(db)


def get_decision(db: Session, decision_id: int) -> Decision:
    """Retrieve a decision by its ID.

    Args:
        db (Session): The database session.
        decision_id (int): The ID of the decision to retrieve.

    Returns:
        Decision: The decision with the specified ID.

    Raises:
        DecisionNotFound: If no decision with the specified ID is found.
    """
    decision: Decision | None = decision_repository.get_by_id(db, decision_id)

    if decision is None:
        raise DecisionNotFound()

    return decision


def delete_decision(db: Session, decision_id: int) -> bool:
    """Delete a decision by its ID.

    Args:
        db (Session): The database session.
        decision_id (int): The ID of the decision to delete.

    Returns:
        bool: True if a decision was deleted, False otherwise.
    """
    return decision_repository.delete(db, decision_id)


def update_decision(
    db: Session, decision_id: int, updated_decision: DecisionCreateModel
) -> Decision:
    """Update a decision by its ID.

    Args:
        db (Session): The database session.
        decision_id (int): The ID of the decision to update.
        updated_decision (DecisionCreateModel): The updated decision data.

    Returns:
        Decision: The updated decision.

    Raises:
        DecisionNotFound: If no decision with the specified ID is found.
    """
    decision: Decision | None = decision_repository.update(db, decision_id, updated_decision)

    if decision is None:
        raise DecisionNotFound()

    return decision
