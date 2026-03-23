"""API router for managing tasks related endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from model.task import Task
from schemas.task import TaskResponseModel
from utils.database import get_db

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get("/", response_model=list[TaskResponseModel])
def get_all_tasks(db: Session = Depends(get_db)): # type: ignore[assignment]
    """Retrieve all tasks from the database."""
    return db.query(Task).all()
