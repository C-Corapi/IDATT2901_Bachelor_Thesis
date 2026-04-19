"""API router for managing epics related endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.epic import Epic
from schemas.epic import EpicCreateModel, EpicResponseModel
from service.epic_service import extract_epics, save_epics_to_db
from utils.database import get_db

router = APIRouter(
    prefix="/epics",
    tags=["Epics"],
)


@router.get("/", response_model=list[EpicResponseModel])  # type: ignore[assignment]
def get_all_epics(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all epics from the database."""
    return db.query(Epic).all()


@router.post("/", response_model=EpicResponseModel, status_code=201)
def create_epic(epic: EpicCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new epic in the database."""
    db_epic = Epic(**epic.model_dump())
    db.add(db_epic)
    db.commit()
    db.refresh(db_epic)
    return db_epic


@router.post("/extract", response_model=list[EpicResponseModel], status_code=201)
def extract_and_save_epics(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract epics from a given file and save them to the database."""
    epics: list[EpicCreateModel] = extract_epics(filepath)
    print("Extracted epics:", epics)
    saved: list[Epic] = save_epics_to_db(epics, db)
    return saved


@router.get("/{epic_id}", response_model=EpicResponseModel)
def get_epic(epic_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific epic by its ID."""
    epic: Epic | None = db.query(Epic).filter(Epic.id == epic_id).first()

    if epic is None:
        raise HTTPException(status_code=404, detail="Epic not found")

    return epic


@router.delete("/{epic_id}", status_code=204)
def delete_epic(epic_id: int, db: Session = Depends(get_db)):
    """Delete a specific epic by its ID."""
    epic: Epic | None = db.query(Epic).filter(Epic.id == epic_id).first()

    if epic is None:
        raise HTTPException(status_code=404, detail="Epic not found")

    db.delete(epic)
    db.commit()


@router.put("/{epic_id}", response_model=EpicResponseModel)
def update_epic(epic_id: int, epic_update: EpicCreateModel, db: Session = Depends(get_db)):
    """Update a specific epic by its ID."""
    epic: Epic | None = db.query(Epic).filter(Epic.id == epic_id).first()

    if epic is None:
        raise HTTPException(status_code=404, detail="Epic not found")

    for key, value in epic_update.model_dump().items():
        setattr(epic, key, value)

    db.commit()
    db.refresh(epic)
    return epic
