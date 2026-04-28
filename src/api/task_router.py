"""API router for managing tasks related endpoints."""

import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from exceptions.common import TaskNotFound
from model.task import Task
from schemas.task import TaskCreateModel, TaskResponseModel
from service import task_service
from utils.database import get_db

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get("/", response_model=list[TaskResponseModel])
def get_all_tasks(db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve all tasks from the database."""
    return task_service.get_all_tasks(db)


@router.post("/extract", response_model=list[TaskResponseModel], status_code=201)
def extract_and_save_tasks(filepath: str, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Extract tasks from a given file and save them to the database."""
    full_path = os.path.join("documents", filepath)
    tasks: list[TaskCreateModel] = task_service.extract_tasks(full_path)
    saved: list[Task] = task_service.save_tasks_to_db(tasks, db)
    return saved


@router.post("/", response_model=TaskResponseModel, status_code=201)
def create_task(task: TaskCreateModel, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Create a new task in the database."""
    return task_service.save_tasks_to_db([task], db)[0]


@router.get("/{task_id}", response_model=TaskResponseModel)
def get_task(task_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Retrieve a specific task by its ID."""
    try:
        return task_service.get_task(db, task_id)
    except TaskNotFound:
        raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):  # type: ignore[assignment]
    """Delete a specific task by its ID."""
    deleted: bool = task_service.delete_task(db, task_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")


@router.put("/{task_id}", response_model=TaskResponseModel)
def update_task(
    task_id: int, updated_task: TaskCreateModel, db: Session = Depends(get_db)
):  # type: ignore[assignment]
    """Update a specific task by its ID."""
    try:
        return task_service.update_task(db, task_id, updated_task)
    except TaskNotFound:
        raise HTTPException(status_code=404, detail="Task not found")
