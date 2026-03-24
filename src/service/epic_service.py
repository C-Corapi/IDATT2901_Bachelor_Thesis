"""Service layer for logic related to Epics."""

import json
from typing import Any

from sqlalchemy.orm import Session

from model.epic import Epic
from prompts.epic_extraction import EPIC_EXTRACTION_PROMPT
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
