from sqlalchemy.orm import Session
from ..schemas.activity import ActivityResponseModel
from ..utils.database import get_db
from fastapi import APIRouter, Depends
from src.model.activity import Activity


router = APIRouter(
    prefix="/activities",
    tags=["Activities"],
)

@router.get("/", response_model=list[ActivityResponseModel])
def get_all_activities(db: Session = Depends(get_db)):
    """Retrieve all activities from the database."""
    return db.query(Activity).all()