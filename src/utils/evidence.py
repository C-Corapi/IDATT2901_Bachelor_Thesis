"""Utilities for recovering exact evidence from the original source text.

This module is used to align evidence suggested by the language model with the
original project text. The goal is to return evidence exactly as it appears in
the source, even when the model has changed case, spacing, or punctuation.
"""

import re
from typing import Optional


def _norm_spaces_and_punct(s: str) -> str:
    """Normalize whitespace and punctuation in a text string.

    The function collapses repeated whitespace into a single space and removes
    spaces that appear directly before punctuation marks.

    Args:
        s: Input text to normalize.

    Returns:
        A normalized version of the text.
    """
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s+([,.;:!?])", r"\1", s)
    return s


def _expand_trailing_punct(original: str, start: int, end_inclusive: int) -> str:
    """Return a substring and include trailing sentence punctuation if present.

    This helps preserve the original evidence more naturally when the matched
    text is immediately followed by sentence-ending punctuation.

    Args:
        original: The original source text.
        start: Start index of the matched substring.
        end_inclusive: End index of the matched substring.

    Returns:
        The matched substring, including trailing punctuation if applicable.
    """
    end = end_inclusive
    if end + 1 < len(original) and original[end + 1] in ".!?":
        end += 1
    return original[start : end + 1]


def recover_exact_evidence(evidence: str, source_text: str) -> Optional[str]:
    """Recover evidence exactly as it appears in the source text.

    The function tries to map model-generated evidence back to the original
    text. This is useful when the model output is almost correct, but not
    character-for-character identical to the source.

    The function tries the following strategies:
    1. Exact match
    2. Case-insensitive exact match
    3. Match after normalizing whitespace and punctuation

    Args:
        evidence: Evidence text suggested by the model.
        source_text: The original project text.

    Returns:
        The exact matching substring from the source text if a match is found,
        otherwise None.
    """
    if not isinstance(evidence, str) or not isinstance(source_text, str):
        return None

    ev = evidence.strip()
    if not ev:
        return None

    original = source_text

    idx0 = original.find(ev)
    if idx0 != -1:
        start = idx0
        end = idx0 + len(ev) - 1
        return _expand_trailing_punct(original, start, end)

    lower_text = original.lower()
    lower_ev = ev.lower()
    idx = lower_text.find(lower_ev)
    if idx != -1:
        start = idx
        end = idx + len(ev) - 1
        return _expand_trailing_punct(original, start, end)

    normalized_chars: list[str] = []
    norm_to_orig: list[int] = []
    i = 0
    while i < len(original):
        ch = original[i]

        if ch.isspace():
            j = i
            while j < len(original) and original[j].isspace():
                j += 1
            if not normalized_chars or normalized_chars[-1] != " ":
                normalized_chars.append(" ")
                norm_to_orig.append(i)
            i = j
            continue

        normalized_chars.append(ch)
        norm_to_orig.append(i)
        i += 1

    norm_source = "".join(normalized_chars)
    norm_source = re.sub(r"\s+([,.;:!?])", r"\1", norm_source)
    norm_ev = _norm_spaces_and_punct(ev)

    idx2 = norm_source.lower().find(norm_ev.lower())
    if idx2 == -1:
        return None

    start_orig = norm_to_orig[idx2]
    end_norm_index = idx2 + len(norm_ev) - 1
    if end_norm_index >= len(norm_to_orig):
        return None
    end_orig = norm_to_orig[end_norm_index]

    return _expand_trailing_punct(original, start_orig, end_orig)
