"""API router for managing epics related endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from model.epic import Epic
from schemas.epic import EpicCreate, EpicCreateModel, EpicResponse
from utils.database import get_db

router = APIRouter(
    prefix="/epics",
    tags=["Epics"],
)


@router.get("/", response_model=list[EpicResponse])
def get_all_epics(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all epics from the database."""
    return db.query(Epic).all()


@router.post("/", response_model=EpicResponse, status_code=201)
def create_epic(epic: EpicCreate, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new epic in the database."""
    db_epic = Epic(**epic.model_dump())
    db.add(db_epic)
    db.commit()
    db.refresh(db_epic)
    return db_epic


@router.post("/extract", response_model=list[EpicResponse], status_code=201)
def extract_and_save_epics(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract epics from a given file and save them to the database."""
    from service.epic_service import extract_epics, save_epics_to_db

    epics: list[EpicCreateModel] = extract_epics(filepath)
    saved: list[Epic] = save_epics_to_db(epics, db)
    return saved
