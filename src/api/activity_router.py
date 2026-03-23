"""API router for activity-related endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from model.activity import Activity
from schemas.activity import ActivityResponseModel
from utils.database import get_db

router = APIRouter(
    prefix="/activities",
    tags=["Activities"],
)


@router.get("/", response_model=list[ActivityResponseModel])
def get_all_activities(db: Session = Depends(get_db)): # type: ignore[assignment]
    """Retrieve all activities from the database."""
    return db.query(Activity).all()
