"""API router for handling project document-related endpoints."""

import os
import uuid

from fastapi import APIRouter, File, UploadFile

from service.document_service import delete_file, read_file, save_file

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

    content = await file.read()
    save_file(safe_name, content)
    return {"filename": file.filename}


@router.get("/", response_model=list[str])
def get_documents() -> list[str]:
    """Endpoint to list all uploaded documents."""
    files: list[str] = os.listdir("documents")
    return files


@router.get("/{filename}", response_model=str)
def get_document(filename: str) -> str:
    """Endpoint to get content of a document by its filename."""
    return read_file(filename)


@router.delete("/{filename}", status_code=204)
def delete_document(filename: str) -> None:
    """Endpoint to delete a document by its filename."""
    delete_file(filename)
