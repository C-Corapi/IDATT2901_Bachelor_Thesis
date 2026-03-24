"""Service layer for handling business logic related to Decisions."""

import json
from typing import Any

from sqlalchemy.orm import Session

from model.decision import Decision
from prompts.decision_extraction import DECISION_EXTRACTION_PROMPT
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
