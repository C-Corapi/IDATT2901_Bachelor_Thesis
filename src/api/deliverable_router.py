"""API router for handling deliverable-related endpoints."""

from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from sqlalchemy.orm import Session

from model.deliverable import Deliverable
from schemas.deliverable import DeliverableCreateModel, DeliverableResponseModel
from service.deliverable_service import extract_deliverables, save_deliverables_to_db
from utils.database import get_db

router = APIRouter(
    prefix="/deliverables",
    tags=["Deliverables"],
)


@router.get("/", response_model=list[DeliverableResponseModel])
def get_all_deliverables(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all deliverables from the database."""
    return db.query(Deliverable).all()


@router.post("/extract", response_model=list[DeliverableResponseModel], status_code=201)
def extract_and_save_deliverables(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract deliverables from a given file and save them to the database."""
    print("Extracting deliverables from file:", filepath)
    deliverables: list[DeliverableCreateModel] = extract_deliverables(filepath)
    saved: list[Deliverable] = save_deliverables_to_db(deliverables, db)
    return saved


@router.post("/", response_model=DeliverableResponseModel, status_code=201)
def create_deliverable(deliverable: DeliverableCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new deliverable in the database."""
    return save_deliverables_to_db([deliverable], db)[0]


@router.get("/{deliverable_id}", response_model=DeliverableResponseModel)
def get_deliverable(deliverable_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific deliverable by its ID."""
    deliverable: Deliverable | None = (
        db.query(Deliverable).filter(Deliverable.id == deliverable_id).first()
    )

    if deliverable is None:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    return deliverable


@router.delete("/{deliverable_id}", status_code=204)
def delete_deliverable(deliverable_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific deliverable by its ID."""
    deliverable: Deliverable | None = (
        db.query(Deliverable).filter(Deliverable.id == deliverable_id).first()
    )

    if deliverable is None:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    db.delete(deliverable)
    db.commit()


@router.put("/{deliverable_id}", response_model=DeliverableResponseModel)
def update_deliverable(
    deliverable_id: int, updated_deliverable: DeliverableCreateModel, db: Session = Depends(get_db)  # type: ignore[assignment]
):  # type: ignore[assignment]
    """Update a specific deliverable by its ID."""
    deliverable: Deliverable | None = (
        db.query(Deliverable).filter(Deliverable.id == deliverable_id).first()
    )

    if deliverable is None:
        raise HTTPException(status_code=404, detail="Deliverable not found")

    for key, value in updated_deliverable.model_dump().items():
        setattr(deliverable, key, value)

    db.commit()
    db.refresh(deliverable)
    return deliverable
