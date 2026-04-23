"""Repository for decision-related database operations."""

from sqlalchemy.orm import Session

from model.decision import Decision
from schemas.decision import DecisionCreateModel


def get_all(db: Session) -> list[Decision]:
    """Retrieve all decisions from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Decision]: A list of all decisions in the database.
    """
    return db.query(Decision).all()


def get_by_id(db: Session, id: int) -> Decision | None:
    """Retrieve a decision by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the decision to retrieve.

    Returns:
        Decision | None: The decision with the specified ID, or None if not found.
    """
    return db.query(Decision).filter(Decision.id == id).first()


def add(db: Session, decision: DecisionCreateModel) -> Decision:
    """Adds a new decision to the database.

    Args:
        db (Session): The database session.
        decision (DecisionCreateModel): The decision data to add.

    Returns:
        Decision: The newly created decision.
    """
    db_decision: Decision = Decision(**decision.model_dump())

    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)

    return db_decision


def delete(db: Session, id: int) -> bool:
    """Deletes a decision by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the decision to delete.

    Returns:
        bool: True if the decision was deleted, False if not found.
    """
    decision: Decision | None = db.query(Decision).filter(Decision.id == id).first()

    if decision is None:
        return False

    db.delete(decision)
    db.commit()

    return True


def update(db: Session, id: int, updated_decision: DecisionCreateModel) -> Decision | None:
    """Updates the decision with the specified ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the decision to update.
        updated_decision (DecisionCreateModel): The updated decision data.

    Returns:
        Decision | None: The updated decision, or None if not found.
    """
    decision: Decision | None = db.query(Decision).filter(Decision.id == id).first()

    if decision is None:
        return None

    for key, value in updated_decision.model_dump().items():
        setattr(decision, key, value)

    db.commit()
    db.refresh(decision)

    return decision
