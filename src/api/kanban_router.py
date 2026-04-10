from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from service.kanban_service import build_kanban_board
from utils.database import get_db

router = APIRouter(
    prefix="/kanban",
    tags=["Kanban"],
)

@router.get("/")
def get_kanban_board(db: Session = Depends(get_db)):
    """Endpoint to retrieve the current state of the Kanban board."""
    return build_kanban_board(db)