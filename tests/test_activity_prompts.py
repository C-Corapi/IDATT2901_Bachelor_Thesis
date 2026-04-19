"""Tests for the activity metadata type system prompts.

Tests verify that the prompt constant remains non-empty and continues to
contain key constraints and required fields needed for deterministic downstream
parsing (e.g., JSON decoding).
"""

from prompts.activity_extraction import ACTIVITY_EXTRACTION_PROMPT


def test_prompt_is_non_empty() -> None:
    """Verify the prompt is defined and not empty after stripping whitespace."""
    assert isinstance(ACTIVITY_EXTRACTION_PROMPT, str)
    assert ACTIVITY_EXTRACTION_PROMPT.strip() != ""


def test_prompt_returns_json_only() -> None:
    """Verify the prompt instructs the model to return valid JSON only."""
    assert "Return valid JSON only" in ACTIVITY_EXTRACTION_PROMPT


def test_prompt_requests_required_attributes() -> None:
    """Verify the prompt includes all required activity attributes."""
    required_fields = [
        "title",
        "description",
        "owner",
        "status",
    ]
    missing = [field for field in required_fields if field not in ACTIVITY_EXTRACTION_PROMPT]
    assert missing == []


def test_prompt_contains_correct_json_shape() -> None:
    """Verify the prompt includes an correct JSON structure for activites."""
    assert (
        '"activities"' in ACTIVITY_EXTRACTION_PROMPT or "'activites'" in ACTIVITY_EXTRACTION_PROMPT
    )
    assert "{" in ACTIVITY_EXTRACTION_PROMPT and "}" in ACTIVITY_EXTRACTION_PROMPT
