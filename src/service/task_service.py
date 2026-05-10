"""Service layer for logic related to Tasks."""

import json
from typing import Any

from sqlalchemy.orm import Session

from exceptions.common import TaskNotFound
from model.task import Task
from prompts.task_extraction import TASK_EVALUATION_PROMPT, TASK_EXTRACTION_PROMPT
from repository import task_repository
from schemas.task import TaskCreateModel
from utils.file_loader import load_file
from utils.llm_client import LlamaClient


def extract_tasks(filepath: str) -> list[TaskCreateModel]:
    """Extract tasks from a given file using an LLM."""
    llm = LlamaClient()

    document: str = load_file(filepath)

    response: str = llm.generate(system_prompt=TASK_EXTRACTION_PROMPT, prompt=document)
    evaluated_response: str = llm.generate(system_prompt=TASK_EVALUATION_PROMPT, prompt=response)

    # Converts response to dictionary, then to list of TaskCreateModel instances.
    data: dict[str, Any] = json.loads(evaluated_response)
    tasks: list[TaskCreateModel] = [TaskCreateModel(**d) for d in data.get("tasks", [])]

    return tasks


def save_tasks_to_db(tasks: list[TaskCreateModel], db: Session) -> list[Task]:
    """Save a list of TaskCreateModel instances to the database."""
    db_tasks = [Task(**t.model_dump()) for t in tasks]
    db.add_all(db_tasks)
    db.commit()
    for task in db_tasks:
        db.refresh(task)
    return db_tasks


def get_all_tasks(db: Session) -> list[Task]:
    """Retrieve all tasks from the database.

    Args:
        db (Session): The database session.

    Returns:
        A list of all the tasks in the database.
    """
    return task_repository.get_all(db)


def get_task(db: Session, task_id: int) -> Task:
    """Retrieves a task by its ID.

    Args:
        db (Session): The database session.
        task_id (int): The ID of the task to retrieve.

    Returns:
        Task: The task with the specified ID.

    Raises:
        TaskNotFound: If no task with the specified ID is found.
    """
    task: Task | None = task_repository.get_by_id(db, task_id)

    if task is None:
        raise TaskNotFound()

    return task


def delete_task(db: Session, task_id: int) -> bool:
    """Deletes a task by its ID.

    Args:
        db (Session): The database session.
        task_id (int): The ID of the task to delete.

    Returns:
        bool: True if a task is deleted, False otherwise.
    """
    return task_repository.delete(db, task_id)


def update_task(db: Session, task_id: int, updated_task: TaskCreateModel) -> Task:
    """Updates a task.

    Args:
        db (Session): The database session.
        task_id: The ID of the task to update.
        updated_task: The updated task data.

    Returns:
        Task: The updated task.

    Raises:
        TaskNotFound: If no task with the specified ID is found.
    """
    task: Task | None = task_repository.update(db, task_id, updated_task)

    if task is None:
        raise TaskNotFound()

    return task
