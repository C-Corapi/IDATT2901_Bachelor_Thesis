import os
import uuid

from fastapi import APIRouter, File, UploadFile


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

    