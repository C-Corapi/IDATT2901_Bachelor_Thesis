"""Service layer for logic related to documents."""

from pathlib import Path

from fastapi import HTTPException

BASE_DIR = Path("uploads").resolve()


def _resolve_path(filename: str) -> Path:
    """Returns the path of a given file."""
    file_path: Path = (BASE_DIR / filename).resolve()

    if not str(file_path).startswith(str(BASE_DIR)):
        raise HTTPException(status_code=400, detail="Invalid file path")

    return file_path


def delete_file(filename: str) -> None:
    """Deletes the file with the specified name."""
    file_path: Path = _resolve_path(filename)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    file_path.unlink()


def read_file(filename: str) -> str:
    """Returns the content of the given file as a string."""
    file_path: Path = _resolve_path(filename)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return file_path.read_text(encoding="utf-8")


def save_file(filename: str, content: bytes) -> None:
    """Saves a file with the given name and content in the file storage."""
    file_path = _resolve_path(filename)

    with open(file_path, "wb") as f:
        f.write(content)
