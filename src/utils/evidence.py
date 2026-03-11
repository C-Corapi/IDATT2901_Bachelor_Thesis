import re
from typing import Optional


def _norm_spaces_and_punct(s: str) -> str:
    # 1) collapse whitespace
    s = re.sub(r"\s+", " ", s).strip()
    # 2) remove spaces before punctuation like "traditional , in" -> "traditional, in"
    s = re.sub(r"\s+([,.;:!?])", r"\1", s)
    return s


def _expand_trailing_punct(original: str, start: int, end_inclusive: int) -> str:
    """
    Return original[start:end_inclusive+1], but include trailing sentence punctuation
    if it exists immediately after the match in the original text.
    """
    end = end_inclusive
    if end + 1 < len(original) and original[end + 1] in ".!?":
        end += 1
    return original[start : end + 1]


def recover_exact_evidence(evidence: str, source_text: str) -> Optional[str]:
    """
    Return an exact substring from source_text if we can align 'evidence' to the source.

    Tries:
    1) exact match
    2) case-insensitive exact match
    3) normalized whitespace/punctuation match (case-insensitive), then map back to original
    """
    if not isinstance(evidence, str) or not isinstance(source_text, str):
        return None

    ev = evidence.strip()
    if not ev:
        return None

    original = source_text

    # 1) exact
    idx0 = original.find(ev)
    if idx0 != -1:
        start = idx0
        end = idx0 + len(ev) - 1
        return _expand_trailing_punct(original, start, end)

    # 2) case-insensitive exact
    lower_text = original.lower()
    lower_ev = ev.lower()
    idx = lower_text.find(lower_ev)
    if idx != -1:
        start = idx
        end = idx + len(ev) - 1
        return _expand_trailing_punct(original, start, end)

    # 3) normalized match (case-insensitive) with mapping
    normalized_chars = []
    norm_to_orig = []  # norm index -> original index
    i = 0
    while i < len(original):
        ch = original[i]

        # collapse whitespace runs into single space
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
    norm_source = re.sub(r"\s+([,.;:!?])", r"\1", norm_source)  # no strip
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