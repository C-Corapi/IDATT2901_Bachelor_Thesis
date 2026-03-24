"""API router for managing tasks related endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from model.task import Task
from schemas.task import TaskCreateModel, TaskResponseModel
from utils.database import get_db

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get("/", response_model=list[TaskResponseModel])
def get_all_tasks(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all tasks from the database."""
    return db.query(Task).all()


@router.post("/extract", response_model=list[TaskResponseModel], status_code=201)
def extract_and_save_tasks(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract tasks from a given file and save them to the database."""
    from service.task_service import extract_tasks, save_tasks_to_db

    tasks: list[TaskCreateModel] = extract_tasks(filepath)
    saved: list[Task] = save_tasks_to_db(tasks, db)
    return saved
