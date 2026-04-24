"""API router for managing epics related endpoints."""

import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from exceptions.common import EpicNotFound
from model.epic import Epic
from schemas.epic import EpicCreateModel, EpicResponseModel
from service import epic_service
from utils.database import get_db

router = APIRouter(
    prefix="/epics",
    tags=["Epics"],
)


@router.get("/", response_model=list[EpicResponseModel])  # type: ignore[assignment]
def get_all_epics(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all epics from the database."""
    return epic_service.get_all_epics(db)


@router.post("/", response_model=EpicResponseModel, status_code=201)
def create_epic(epic: EpicCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new epic in the database."""
    return epic_service.save_epics_to_db([epic], db)[0]


@router.post("/extract", response_model=list[EpicResponseModel], status_code=201)
def extract_and_save_epics(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract epics from a given file and save them to the database."""
    full_path = os.path.join("documents", filepath)
    epics: list[EpicCreateModel] = epic_service.extract_epics(full_path)
    print("Extracted epics:", epics)
    saved: list[Epic] = epic_service.save_epics_to_db(epics, db)
    return saved


@router.get("/{epic_id}", response_model=EpicResponseModel)
def get_epic(epic_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific epic by its ID."""
    try:
        return epic_service.get_epic(db, epic_id)
    except EpicNotFound:
        raise HTTPException(status_code=404, detail="Epic not found")


@router.delete("/{epic_id}", status_code=204)
def delete_epic(epic_id: int, db: Session = Depends(get_db)):
    """Delete a specific epic by its ID."""
    deleted: bool = epic_service.delete_epic(db, epic_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Epic not found")


@router.put("/{epic_id}", response_model=EpicResponseModel)
def update_epic(epic_id: int, epic_update: EpicCreateModel, db: Session = Depends(get_db)):
    """Update a specific epic by its ID."""
    epic: Epic | None = epic_service.update_epic(db, epic_id, epic_update)

    if epic is None:
        raise HTTPException(status_code=404, detail="Epic not found")

    return epic
