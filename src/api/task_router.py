"""API router for managing tasks related endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.task import Task
from schemas.task import TaskCreateModel, TaskResponseModel
from service.task_service import extract_tasks, save_tasks_to_db
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
    tasks: list[TaskCreateModel] = extract_tasks(filepath)
    saved: list[Task] = save_tasks_to_db(tasks, db)
    return saved


@router.post("/", response_model=TaskResponseModel, status_code=201)
def create_task(task: TaskCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new task in the database."""
    return save_tasks_to_db([task], db)[0]


@router.get("/{task_id}", response_model=TaskResponseModel)
def get_task(task_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific task by its ID."""
    task: Task | None = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific task by its ID."""
    task: Task | None = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()


@router.put("/{task_id}", response_model=TaskResponseModel)
def update_task(
    task_id: int, updated_task: TaskCreateModel, db: Session = Depends(get_db)
):  # type: ignore[assignment]
    """Update a specific task by its ID."""
    task: Task | None = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in updated_task.model_dump().items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task
