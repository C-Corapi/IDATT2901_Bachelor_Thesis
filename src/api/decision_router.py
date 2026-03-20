from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.utils.database import get_db
from src.model.decision import Decision
from src.model.decision import Decision
from src.schemas.decision import DecisionResponseModel


router = APIRouter(
    prefix="/decisions",
    tags=["decisions"],
)

@router.get("/", response_model=list[DecisionResponseModel])
def get_all_decisions(db: Session = Depends(get_db)):
    """Retrieve all decisions from the database."""
    return db.query(Decision).all()