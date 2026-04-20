"""File loading utilities for reading supported document formats."""

from docx import Document


def load_file(path: str) -> str:
    """Loads a supported file type and return its contents as a string.

    Currently, only plain text files (".txt") are supported.

    Args:
        path: Path to the file to load.

    Returns:
        The file contents as a string.

    Raises:
        ValueError: If the file extension is not supported.
    """
    if path.endswith(".txt"):
        return load_txt_file(path)
    if path.endswith(".docx"):
        return load_docx_file(path)
    raise ValueError(f"Unsupported file type: {path}")


def load_txt_file(path: str) -> str:
    """Loads a text file and return its contents.

    Args:
        path: Path to a ".txt" file.

    Returns:
        The complete file contents as a string.

    Raises:
        OSError: If the file cannot be opened or read (e.g., missing permissions).
    """
    with open(path, "r", encoding="utf-8", errors="replace") as file:
        content = file.read()
        return content


def load_docx_file(path: str) -> str:
    """Loads a docx file and return its contents.

    Args:
        path: Path to a ".docx" file.

    Returns:
        The complete file contents as a string.

    Raises:
        OSError: If the file cannot be opened or read (e.g., missing permissions).
    """
    doc = Document(path)
    content = "\n".join(paragraph.text for paragraph in doc.paragraphs)
    return content
