from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..model.epic import Epic

router = APIRouter(
    prefix="/epics",
    tags=["Epics"],
)

@router.get("/", response_model=list[Epic])
def get_all_epics(db: Session = Depends(get_db)):
    """Retrieve all epics from the database."""
    return db.query(Epic).all()

@router.post("/")
def create_epic(epic: Epic, db: Session = Depends(get_db)):
    """Create a new epic in the database."""
    db.add(epic)
    db.commit()
    db.refresh(epic)
    return epic