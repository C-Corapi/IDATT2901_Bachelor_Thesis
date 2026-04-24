"""API router for handling deliverable-related endpoints."""

import os

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from sqlalchemy.orm import Session

from exceptions.common import DeliverableNotFound
from model.deliverable import Deliverable
from schemas.deliverable import DeliverableCreateModel, DeliverableResponseModel
from service import deliverable_service
from utils.database import get_db

router = APIRouter(
    prefix="/deliverables",
    tags=["Deliverables"],
)


@router.get("/", response_model=list[DeliverableResponseModel])
def get_all_deliverables(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all deliverables from the database."""
    return deliverable_service.get_all_deliverables(db)


@router.post("/extract", response_model=list[DeliverableResponseModel], status_code=201)
def extract_and_save_deliverables(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract deliverables from a given file and save them to the database."""
    print("Extracting deliverables from file:", filepath)
    full_path = os.path.join("documents", filepath)
    deliverables: list[DeliverableCreateModel] = deliverable_service.extract_deliverables(full_path)
    saved: list[Deliverable] = deliverable_service.save_deliverables_to_db(deliverables, db)
    return saved


@router.post("/", response_model=DeliverableResponseModel, status_code=201)
def create_deliverable(deliverable: DeliverableCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new deliverable in the database."""
    return deliverable_service.save_deliverables_to_db([deliverable], db)[0]


@router.get("/{deliverable_id}", response_model=DeliverableResponseModel)
def get_deliverable(deliverable_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific deliverable by its ID."""
    try:
        return deliverable_service.delete_deliverable(db, deliverable_id)
    except DeliverableNotFound:
        raise HTTPException(status_code=404, detail="Deliverable not found")


@router.delete("/{deliverable_id}", status_code=204)
def delete_deliverable(deliverable_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific deliverable by its ID."""
    deleted: bool = deliverable_service.delete_deliverable(db, deliverable_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="DeliverableNotFound")


@router.put("/{deliverable_id}", response_model=DeliverableResponseModel)
def update_deliverable(
    deliverable_id: int, updated_deliverable: DeliverableCreateModel, db: Session = Depends(get_db)  # type: ignore[assignment]
):  # type: ignore[assignment]
    """Update a specific deliverable by its ID."""
    deliverable: Deliverable | None = deliverable_service.update_deliverable(
        db, deliverable_id, updated_deliverable
    )

    if deliverable is None:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    return deliverable
