"""API router for handling project document-related endpoints."""

import os
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post("/upload", status_code=201)
async def upload_document(file: UploadFile = File(...)):
    """Endpoint for uploading a document."""
    # Generate a unique filename to avoid collisions and save the uploaded file to disk.
    filename: str = file.filename or "file"
    safe_name: str = f"{uuid.uuid4()}_{filename}"

    file_path: str = os.path.join("documents", safe_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return {"filename": safe_name, "message": "File uploaded successfully"}


@router.get("/", response_model=list[str])
def get_documents() -> list[str]:
    """Endpoint to list all uploaded documents."""
    files: list[str] = os.listdir("documents")
    return files


@router.get("/{filename}", response_model=str)
def get_document(filename: str) -> str:
    """Endpoint to get content of a document by its filename."""
    file_path: str = os.path.join("documents", filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    with open(file_path, "r") as f:
        return f.read()
