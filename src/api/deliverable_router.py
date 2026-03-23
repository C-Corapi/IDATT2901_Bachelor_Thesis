"""API router for handling deliverable-related endpoints."""

from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session

from model.deliverable import Deliverable
from schemas.deliverable import DeliverableResponseModel
from utils.database import get_db

router = APIRouter(
    prefix="/deliverables",
    tags=["Deliverables"],
)


@router.get("/", response_model=list[DeliverableResponseModel])
def get_all_deliverables(db: Session = Depends(get_db)): # type: ignore[assignment]
    """Retrieve all deliverables from the database."""
    return db.query(Deliverable).all()
