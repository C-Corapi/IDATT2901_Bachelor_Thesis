"""API router for handling decision-related endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from model.decision import Decision
from schemas.decision import DecisionCreateModel, DecisionResponseModel
from service.desicion_service import extract_decisions, save_decisions_to_db
from utils.database import get_db

router = APIRouter(
    prefix="/decisions",
    tags=["decisions"],
)


@router.get("/", response_model=list[DecisionResponseModel])
def get_all_decisions(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all decisions from the database."""
    return db.query(Decision).all()


@router.post("/extract", response_model=list[DecisionResponseModel], status_code=201)
def extract_and_save_decisions(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract decisions from a given file and save them to the database."""
    decisions: list[DecisionCreateModel] = extract_decisions(filepath)
    saved: list[Decision] = save_decisions_to_db(decisions, db)
    return saved
