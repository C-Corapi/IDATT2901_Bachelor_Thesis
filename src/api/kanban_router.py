"""Defines the API router for Kanban board-related endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from schemas.kanban import KanbanBoard, KanbanCard
from service.kanban_service import build_kanban_board, update_kanban_card_in_db
from utils.database import get_db

router = APIRouter(
    prefix="/kanban",
    tags=["Kanban"],
)


@router.get("/", response_model=KanbanBoard)
def get_kanban_board(db: Session = Depends(get_db)):
    """Endpoint to retrieve the current state of the Kanban board."""
    return build_kanban_board(db)


@router.post("/update", response_model=KanbanCard)
def update_kanban_card(newCard: KanbanCard, db: Session = Depends(get_db)):
    """Endpoint to update the status of a card on the Kanban board in the db."""
    return update_kanban_card_in_db(newCard, db)
