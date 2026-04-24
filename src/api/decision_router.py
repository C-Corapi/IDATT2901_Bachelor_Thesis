"""API router for handling decision-related endpoints."""

import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from exceptions.common import DecisionNotFound
from model.decision import Decision
from schemas.decision import DecisionCreateModel, DecisionResponseModel
from service import decision_service
from utils.database import get_db

router = APIRouter(
    prefix="/decisions",
    tags=["decisions"],
)


@router.get("/", response_model=list[DecisionResponseModel])
def get_all_decisions(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all decisions from the database."""
    return decision_service.get_all_decisions(db)


@router.post("/extract", response_model=list[DecisionResponseModel], status_code=201)
def extract_and_save_decisions(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract decisions from a given file and save them to the database."""
    full_path = os.path.join("documents", filepath)
    decisions: list[DecisionCreateModel] = decision_service.extract_decisions(full_path)
    saved: list[Decision] = decision_service.save_decisions_to_db(decisions, db)
    return saved


@router.post("/", response_model=DecisionResponseModel, status_code=201)
def create_decision(decision: DecisionCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new decision in the database."""
    return decision_service.save_decisions_to_db([decision], db)[0]


@router.get("/{decision_id}", response_model=DecisionResponseModel)
def get_decision(decision_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific decision by its ID."""
    try:
        return decision_service.get_decision(db, decision_id)
    except DecisionNotFound:
        raise HTTPException(status_code=404, detail="Decision not found")


@router.delete("/{decision_id}", status_code=204)
def delete_decision(decision_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific decision by its ID."""
    deleted: bool = decision_service.delete_decision(db, decision_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Decision not found")


@router.put("/{decision_id}", response_model=DecisionResponseModel)
def update_decision(
    decision_id: int, updated_decision: DecisionCreateModel, db: Session = Depends(get_db)
):  # type: ignore[assignment]
    """Update a specific decision by its ID."""
    try:
        return decision_service.update_decision(db, decision_id, updated_decision)
    except DecisionNotFound:
        raise HTTPException(status_code=404, detail="Decision not found")
