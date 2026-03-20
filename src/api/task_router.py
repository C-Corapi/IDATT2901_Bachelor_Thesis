"""API router for managing tasks related endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.model.task import Task
from src.schemas.task import TaskResponseModel
from src.utils.database import get_db

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get("/", response_model=list[TaskResponseModel])
def get_all_tasks(db: Session = Depends(get_db)):
    """Retrieve all tasks from the database."""
    return db.query(Task).all()
