"""Phrase-based validation used to filter extracted metadata items.

This module contains a general phrase gate that can be reused across
different metadata types. The gate checks whether evidence contains
accepted phrases, avoids rejected phrases, and optionally rejects questions.
"""

from typing import Sequence


def passes_phrase_gate(
    evidence: str,
    *,
    accept_phrases: Sequence[str],
    reject_phrases: Sequence[str] = (),
    reject_questions: bool = True,
) -> bool:
    """Check whether evidence passes a phrase-based validation step.

    The function returns True only when the evidence contains at least one
    accepted phrase, does not contain any rejected phrases, and is not a
    question if question rejection is enabled.

    Args:
        evidence: The evidence text to validate.
        accept_phrases: Phrases that indicate the evidence should be accepted.
        reject_phrases: Phrases that indicate the evidence should be rejected.
        reject_questions: If True, evidence containing a question mark is rejected.

    Returns:
        True if the evidence passes the phrase-based gate, otherwise False.
    """
    if not isinstance(evidence, str):
        return False

    if reject_questions and "?" in evidence:
        return False

    ev = evidence.lower()

    for phrase in reject_phrases:
        if phrase and phrase.lower() in ev:
            return False

    for phrase in accept_phrases:
        if phrase and phrase.lower() in ev:
            return True

    return False
