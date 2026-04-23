"""Tests for the document service."""

import pytest
from fastapi import HTTPException

from service.document_service import BASE_DIR, _resolve_path, delete_file, read_file, save_file


def test_resolve_path_valid():
    """Test that _resolve_path correctly resolves a valid file path."""
    result = _resolve_path("test.txt")

    assert result.parent == BASE_DIR
    assert result.name == "test.txt"


def test_resolve_path_blocks_path_traversal():
    """Test that _resolve_path blocks path traversal attempts."""
    with pytest.raises(HTTPException) as exc_info:
        _resolve_path("../secret.txt")

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Invalid file path"


def test_delete_file_success(monkeypatch, tmp_path):
    """Test that delete_file successfully deletes an existing file."""
    monkeypatch.setattr("service.document_service.BASE_DIR", tmp_path)
    file = tmp_path / "test.txt"
    file.write_text("Test content")

    delete_file("test.txt")

    assert not file.exists()


def test_delete_file_not_found(tmp_path, monkeypatch):
    """Test that delete_file raises an HTTPException when the file does not exist."""
    monkeypatch.setattr("service.document_service.BASE_DIR", tmp_path)

    with pytest.raises(HTTPException) as exc:
        delete_file("missing.txt")

    assert exc.value.status_code == 404
    assert exc.value.detail == "File not found"


def test_read_file_success(tmp_path, monkeypatch):
    """Test that read_file successfully reads the content of an existing file."""
    monkeypatch.setattr("service.document_service.BASE_DIR", tmp_path)
    file = tmp_path / "test.txt"
    file.write_text("Test content")

    content = read_file("test.txt")

    assert content == "Test content"


def test_read_file_not_found(tmp_path, monkeypatch):
    """Tetst that read_file raises an HTTPException when the file does not exist."""
    monkeypatch.setattr("service.document_service.BASE_DIR", tmp_path)

    with pytest.raises(HTTPException) as exc:
        read_file("missing.txt")

    assert exc.value.status_code == 404
    assert exc.value.detail == "File not found"


def test_save_file_success(tmp_path, monkeypatch):
    """Test that save_file successfully saves content to a file."""
    monkeypatch.setattr("service.document_service.BASE_DIR", tmp_path)

    save_file("test.txt", b"Test content")

    file = tmp_path / "test.txt"

    assert file.exists()
    assert file.name == "test.txt"
    assert file.read_text() == "Test content"
