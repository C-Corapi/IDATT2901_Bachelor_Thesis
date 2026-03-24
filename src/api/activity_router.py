"""API router for activity-related endpoints."""

from fastapi import APIRouter, Depends
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
