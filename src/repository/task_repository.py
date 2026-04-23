"""Repository for task-related database operations."""

from typing import cast

from sqlalchemy import select
from sqlalchemy.orm import Session

from model.task import Task
from schemas.task import TaskCreateModel


def get_by_id(db: Session, id: int) -> Task | None:
    """Retrieve a task by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the task to retrieve.

    Returns:
        Task | None: The task with the specified ID, or None if not found.
    """
    stmt = select(Task).where(Task.id == id)
    return db.execute(stmt).scalar_one_or_none()


def get_all(db: Session) -> list[Task]:
    """Retrieve all tasks from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Task]: A list of all tasks in the database.
    """
    stmt = select(Task)
    return cast(list[Task], db.execute(stmt).scalars().all())


def add(db: Session, task: TaskCreateModel) -> Task:
    """Adds a new task to the database.

    Args:
        db (Session): The database session.
        task (TaskCreateModel): The task data to add.

    Returns:
        Task: The newly created task.
    """
    db_task: Task = Task(**task.model_dump())

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task


def delete(db: Session, id: int) -> bool:
    """Deletes a task by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the task to delete.

    Returns:
        bool: True if the task was deleted, False if not found.
    """
    stmt = select(Task).where(Task.id == id)
    task: Task | None = db.execute(stmt).scalar_one_or_none()

    if task is None:
        return False

    db.delete(task)
    db.commit()
    return True


def update(db: Session, id: int, updated_task: TaskCreateModel) -> Task | None:
    """Updates a task by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the task to update.
        updated_task (Task): The updated task data.

    Returns:
        Task | None: The updated task, or None if not found.
    """
    stmt = select(Task).where(Task.id == id)
    task: Task | None = db.execute(stmt).scalar_one_or_none()

    if task is None:
        return None

    for key, value in updated_task.model_dump().items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task
