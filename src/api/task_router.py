from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas.task import TaskResponseModel
from ..model.task import Task


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)

@router.get("/", response_model=list[TaskResponseModel])
def get_all_tasks(db: Session = Depends(get_db)):
    """Retrieve all tasks from the database."""
    return db.query(Task).all()