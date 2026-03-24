"""Service layer for logic related to Tasks."""

import json
from typing import Any

from prompts.task_extraction import TASK_EXTRACTION_PROMPT
from schemas.task import TaskCreateModel
from utils.file_loader import load_file
from utils.llm_client import LlamaClient


def extract_tasks(filepath: str) -> list[TaskCreateModel]:
    """Extract tasks from a given file using an LLM."""
    llm = LlamaClient()

    document: str = load_file(filepath)

    response: str = llm.generate(system_prompt=TASK_EXTRACTION_PROMPT, prompt=document)

    # Converts response to dictionary, then to list of TaskCreateModel instances.
    data: dict[str, Any] = json.loads(response)
    tasks: list[TaskCreateModel] = [
        TaskCreateModel(**d) for d in data.get("tasks", [])
    ]

    return tasks

def save_tasks_to_db(tasks: list[TaskCreateModel], db: Session) -> list[Task]:
    """Save a list of TaskCreateModel instances to the database."""
    db_tasks = [Task(**t.model_dump()) for t in tasks]
    db.add_all(db_tasks)
    db.commit()
    for task in db_tasks:
        db.refresh(task)
    return db_tasks