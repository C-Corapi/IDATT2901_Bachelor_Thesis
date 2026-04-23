"""Repository for deliverable-related database operations."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from model.deliverable import Deliverable
from schemas.deliverable import DeliverableCreateModel


def get_all(db: Session) -> list[Deliverable]:
    """Retrieve all deliverables from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Deliverable]: A list of all deliverables in the database.
    """
    return db.query(Deliverable).all()


def get_by_id(db: Session, id: int) -> Deliverable | None:
    """Retrieve a deliverable by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the deliverable to retrieve.

    Returns:
        Deliverable | None: The deliverable with the specified ID, or None if not found.
    """
    stmt = select(Deliverable).where(Deliverable.id == id)
    return db.execute(stmt).scalar_one_or_none()


def add(db: Session, deliverable: DeliverableCreateModel) -> Deliverable:
    """Adds a new deliverable to the database.

    Args:
        db (Session): The database session.
        deliverable (DeliverableCreateModel): The deliverable data to add.

    Returns:
        Deliverable: The newly created deliverable.
    """
    db_deliverable: Deliverable = Deliverable(**deliverable.model_dump())

    db.add(db_deliverable)
    db.commit()
    db.refresh(db_deliverable)

    return db_deliverable


def delete(db: Session, id: int) -> bool:
    """Deletes a deliverable by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the deliverable to delete.

    Returns:
        bool: True if the deliverable was deleted, False if not found.
    """
    stmt = select(Deliverable).where(Deliverable.id == id)
    deliverable: Deliverable | None = db.execute(stmt).scalar_one_or_none()

    if deliverable is None:
        return False

    db.delete(deliverable)
    db.commit()

    return True


def update(db: Session, id: int, updated_deliverable: DeliverableCreateModel) -> Deliverable | None:
    """Updates the deliverable with the specified ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the deliverable to update.
        updated_deliverable (DeliverableCreateModel): The updated deliverable data.

    Returns:
        Deliverable | None: The updated deliverable, or None if not found.
    """
    stmt = select(Deliverable).where(Deliverable.id == id)
    deliverable: Deliverable | None = db.execute(stmt).scalar_one_or_none()

    if deliverable is None:
        return None

    for key, value in updated_deliverable.model_dump().items():
        setattr(deliverable, key, value)

    db.commit()
    db.refresh(deliverable)

    return deliverable
