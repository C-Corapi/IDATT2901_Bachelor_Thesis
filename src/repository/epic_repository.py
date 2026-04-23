"""Repository for epic-related database operations."""

from typing import cast

from sqlalchemy import select
from sqlalchemy.orm import Session

from model.epic import Epic
from schemas.epic import EpicCreateModel


def get_by_id(db: Session, id: int) -> Epic | None:
    """Retrieve an epic by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the epic to retrieve.

    Returns:
        Epic | None: The epic with the specified ID, or None if not found.
    """
    stmt = select(Epic).where(Epic.id == id)
    return db.execute(stmt).scalar_one_or_none()


def get_all(db: Session) -> list[Epic]:
    """Retrieve all epics from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Epic]: A list of all epics in the database.
    """
    stmt = select(Epic)
    return cast(list[Epic], db.execute(stmt).scalars().all())


def add(db: Session, epic: EpicCreateModel) -> Epic:
    """Adds a new epic to the database.

    Args:
        db (Session): The database session.
        epic (EpicCreateModel): The epic data to add.

    Returns:
        Epic: The newly created epic.
    """
    db_epic: Epic = Epic(**epic.model_dump())

    db.add(db_epic)
    db.commit()
    db.refresh(db_epic)

    return db_epic


def delete(db: Session, id: int) -> bool:
    """Deletes an epic by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the epic to delete.

    Returns:
        bool: True if the epic was deleted, False if not found.
    """
    stmt = select(Epic).where(Epic.id == id)
    epic: Epic | None = db.execute(stmt).scalar_one_or_none()

    if epic is None:
        return False

    db.delete(epic)
    db.commit()

    return True


def update(db: Session, id: int, updated_epic: EpicCreateModel) -> Epic | None:
    """Updates an epic by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the epic to update.
        updated_epic (EpicCreateModel): The updated epic data.

    Returns:
        Epic | None: The updated epic, or None if not found.
    """
    stmt = select(Epic).where(Epic.id == id)
    epic: Epic | None = db.execute(stmt).scalar_one_or_none()

    if epic is None:
        return None

    for key, value in updated_epic.model_dump().items():
        setattr(epic, key, value)

    db.commit()
    db.refresh(epic)

    return epic
