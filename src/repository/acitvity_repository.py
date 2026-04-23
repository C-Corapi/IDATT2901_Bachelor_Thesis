"""Repository for activity-related database operations."""

from sqlalchemy.orm import Session

from model.activity import Activity
from schemas.activity import ActivityCreateModel


def get_all(db: Session) -> list[Activity]:
    """Retrieve all activities from the database.

    Args:
        db (Session): The database session.

    Returns:
        list[Activity]: A list of all activities in the database.
    """
    return db.query(Activity).all()


def get_by_id(db: Session, id: int) -> Activity | None:
    """Retrieve an activity by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the activity to retrieve.

    Returns:
        Activity | None: The activity with the specified ID, or None if not found.
    """
    return db.query(Activity).filter(Activity.id == id).first()


def add(db: Session, activity: ActivityCreateModel) -> Activity:
    """Adds a new activity to the database.

    Args:
        db (Session): The database session.
        activity (ActivityCreateModel): The activity data to add.

    Returns:
        Activity: The newly created activity.
    """
    db_activity: Activity = Activity(**activity.model_dump())

    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    return db_activity


def delete(db: Session, id: int) -> bool:
    """Deletes an activity by its ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the activity to delete.

    Returns:
        bool: True if the activity was deleted, False if it was not found.
    """
    activity: Activity | None = get_by_id(db, id)

    if activity is None:
        return False

    db.delete(activity)
    db.commit()
    return True


def update(db: Session, id: int, updated_activity: ActivityCreateModel) -> Activity | None:
    """Updates the activity with the specified ID.

    Args:
        db (Session): The database session.
        id (int): The ID of the activity to update.
        updated_activity (ActivityCreateModel): The updated activity data.

    Returns:
        Activity | None: The updated activity if found, otherwise None.
    """
    activity: Activity | None = get_by_id(db, id)

    if activity is None:
        return None

    for key, value in updated_activity.model_dump().items():
        setattr(activity, key, value)

    db.commit()
    db.refresh(activity)
    return activity
