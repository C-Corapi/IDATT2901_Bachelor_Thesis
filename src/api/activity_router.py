"""API router for activity-related endpoints."""

import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from exceptions.common import ActivityNotFound
from model.activity import Activity
from schemas.activity import ActivityCreateModel, ActivityResponseModel
from service import activity_service
from utils.database import get_db

router = APIRouter(
    prefix="/activities",
    tags=["Activities"],
)


@router.get("/", response_model=list[ActivityResponseModel])
def get_all_activities(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all activities from the database."""
    return activity_service.get_all_activities(db)


@router.post("/extract", response_model=list[ActivityResponseModel], status_code=201)
def extract_and_save_activities(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract activities from a given file and save them to the database."""
    full_path = os.path.join("documents", filepath)
    activities: list[ActivityCreateModel] = activity_service.extract_activities(full_path)
    saved: list[Activity] = activity_service.save_activities_to_db(activities, db)
    return saved


@router.post("/", response_model=ActivityResponseModel, status_code=201)
def create_activity(activity: ActivityCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new activity in the database."""
    return activity_service.save_activities_to_db([activity], db)[0]


@router.get("/{activity_id}", response_model=ActivityResponseModel)
def get_activity(activity_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific activity by its ID."""
    try:
        return activity_service.get_activity(db, activity_id)
    except ActivityNotFound:
        raise HTTPException(status_code=404, detail="Activity not found")


@router.delete("/{activity_id}", status_code=204)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific activity by its ID."""
    deleted: bool = activity_service.delete_activity(db, activity_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Activity not found")


@router.put("/{activity_id}", response_model=ActivityResponseModel)
def update_activity(
    activity_id: int, updated_activity: ActivityCreateModel, db: Session = Depends(get_db)
):  # type: ignore[assignment]
    """Update a specific activity by its ID."""
    try:
        return activity_service.update_activity(db, activity_id, updated_activity)
    except ActivityNotFound:
        raise HTTPException(status_code=404, detail="Activity not found")
