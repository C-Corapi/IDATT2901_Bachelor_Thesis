"""Tests for the epic metadata type system prompts.

Tests verify that the prompt constant remains non-empty and continues to
contain key constraints and required fields needed for deterministic downstream
parsing (e.g., JSON decoding).
"""

from prompts.epic_extraction import EPIC_EXTRACTION_PROMPT


def test_prompt_is_non_empty() -> None:
    """Verify the prompt is defined and not empty after stripping whitespace."""
    assert isinstance(EPIC_EXTRACTION_PROMPT, str)
    assert EPIC_EXTRACTION_PROMPT.strip() != ""


def test_prompt_returns_json_only() -> None:
    """Verify the prompt instructs the model to return valid JSON only."""
    assert "Return valid JSON only" in EPIC_EXTRACTION_PROMPT


def test_prompt_requests_required_attributes() -> None:
    """Verify the prompt includes all required decision attributes."""
    required_fields = ["title", "description", "owner", "stakeholder", "scope"]
    missing = [field for field in required_fields if field not in EPIC_EXTRACTION_PROMPT]
    assert missing == []


def test_prompt_contains_correct_json_shape() -> None:
    """Verify the prompt includes an correct JSON structure for decisions."""
    assert '"epics"' in EPIC_EXTRACTION_PROMPT or "'epics'" in EPIC_EXTRACTION_PROMPT
    assert "{" in EPIC_EXTRACTION_PROMPT and "}" in EPIC_EXTRACTION_PROMPT
