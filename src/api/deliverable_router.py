"""API router for handling deliverable-related endpoints."""

from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session

from model.deliverable import Deliverable
from schemas.deliverable import DeliverableCreateModel, DeliverableResponseModel
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
    from service.deliverable_service import extract_deliverables, save_deliverables_to_db

    deliverables: list[DeliverableCreateModel] = extract_deliverables(filepath)
    saved: list[Deliverable] = save_deliverables_to_db(deliverables, db)
    return saved
