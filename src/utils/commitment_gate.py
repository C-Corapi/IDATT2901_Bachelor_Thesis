from typing import Sequence


def passes_phrase_gate(
        evidence: str,
        *,
        accept_phrases: Sequence[str],
        reject_phrases: Sequence[str] = (),
        reject_questions: bool = True,
) -> bool:
    """
    Generic phrase-based gate.

    Returns True only if:
    - evidence contains at least one accept phrase (case-insensitive),
    - evidence contains no reject phrases (case-insensitive),
    - evidence is not a question.
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