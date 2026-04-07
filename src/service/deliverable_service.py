"""Service layer for logic related to Delivarables."""

import json
from typing import Any

from sqlalchemy.orm import Session

from model.deliverable import Deliverable
from prompts.deliverable_extraction import DELIVERABLE_EXTRACTION_PROMPT
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
