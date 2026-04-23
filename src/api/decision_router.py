"""API router for handling decision-related endpoints."""

import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.decision import Decision
from schemas.decision import DecisionCreateModel, DecisionResponseModel
from service.decision_service import extract_decisions, save_decisions_to_db
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
    full_path = os.path.join("documents", filepath)
    decisions: list[DecisionCreateModel] = extract_decisions(full_path)
    saved: list[Decision] = save_decisions_to_db(decisions, db)
    return saved


@router.post("/", response_model=DecisionResponseModel, status_code=201)
def create_decision(decision: DecisionCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new decision in the database."""
    return save_decisions_to_db([decision], db)[0]


@router.get("/{decision_id}", response_model=DecisionResponseModel)
def get_decision(decision_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific decision by its ID."""
    decision: Decision | None = db.query(Decision).filter(Decision.id == decision_id).first()

    if decision is None:
        raise HTTPException(status_code=404, detail="Decision not found")

    return decision


@router.delete("/{decision_id}", status_code=204)
def delete_decision(decision_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific decision by its ID."""
    decision: Decision | None = db.query(Decision).filter(Decision.id == decision_id).first()

    if decision is None:
        raise HTTPException(status_code=404, detail="Decision not found")

    db.delete(decision)
    db.commit()


@router.put("/{decision_id}", response_model=DecisionResponseModel)
def update_decision(
    decision_id: int, updated_decision: DecisionCreateModel, db: Session = Depends(get_db)
):  # type: ignore[assignment]
    """Update a specific decision by its ID."""
    decision: Decision | None = db.query(Decision).filter(Decision.id == decision_id).first()

    if decision is None:
        raise HTTPException(status_code=404, detail="Decision not found")

    for key, value in updated_decision.model_dump().items():
        setattr(decision, key, value)

    db.commit()
    db.refresh(decision)
    return decision
