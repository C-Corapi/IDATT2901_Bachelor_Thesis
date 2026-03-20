from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..model.deliverable import Deliverable
from ..schemas.deliverable import DeliverableResponseModel


router = APIRouter(
    prefix="/deliverables",
    tags=["Deliverables"],
)

@router.get("/", response_model=list[DeliverableResponseModel])
def get_all_deliverables(db: Session = Depends(get_db)):
    """Retrieve all deliverables from the database."""
    return db.query(Deliverable).all()