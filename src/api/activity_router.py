"""API router for activity-related endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.activity import Activity
from schemas.activity import ActivityCreateModel, ActivityResponseModel
from service.activity_service import extract_activities, save_activities_to_db
from utils.database import get_db

router = APIRouter(
    prefix="/activities",
    tags=["Activities"],
)


@router.get("/", response_model=list[ActivityResponseModel])
def get_all_activities(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all activities from the database."""
    return db.query(Activity).all()


@router.post("/extract", response_model=list[ActivityResponseModel], status_code=201)
def extract_and_save_activities(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract activities from a given file and save them to the database."""
    activities: list[ActivityCreateModel] = extract_activities(filepath)
    saved: list[Activity] = save_activities_to_db(activities, db)
    return saved


@router.post("/", response_model=ActivityResponseModel, status_code=201)
def create_activity(activity: ActivityCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new activity in the database."""
    return save_activities_to_db([activity], db)[0]


@router.get("/{activity_id}", response_model=ActivityResponseModel)
def get_activity(activity_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific activity by its ID."""
    activity: Activity | None = db.query(Activity).filter(Activity.id == activity_id).first()

    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    return activity


@router.delete("/{activity_id}", status_code=204)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific activity by its ID."""
    activity: Activity | None = db.query(Activity).filter(Activity.id == activity_id).first()

    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()


@router.put("/{activity_id}", response_model=ActivityResponseModel)
def update_activity(
    activity_id: int, updated_activity: ActivityCreateModel, db: Session = Depends(get_db)
):  # type: ignore[assignment]
    """Update a specific activity by its ID."""
    activity: Activity | None = db.query(Activity).filter(Activity.id == activity_id).first()

    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    for key, value in updated_activity.model_dump().items():
        setattr(activity, key, value)

    db.commit()
    db.refresh(activity)
    return activity
