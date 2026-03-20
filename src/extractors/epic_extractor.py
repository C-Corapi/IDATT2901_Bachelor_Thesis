"""EPIC extraction pipeline for project text.

This module sends project text to the language model, parses the JSON response,
and filters the result so that only verified EPIC items are returned.

The filtering step checks that:
- the item is an EPIC,
- the title is not a merged feature,
- the evidence can be found in the original text,
- and the evidence passes phrase-based validation.

Phrase-based validation uses accepted commitment phrases and rejected
uncertainty phrases to reduce false positives.
"""

import json
import uuid
from typing import Any, Dict, List, Optional

from src.prompts.epic_extraction import SYSTEM_PROMPT, USER_PROMPT
from src.utils.commitment_gate import passes_phrase_gate
from src.utils.evidence import recover_exact_evidence
from src.utils.llm_client import LlamaClient

EPIC_COMMIT_PHRASES: List[str] = [
    "we will",
    "we must",
    "must",
    "shall",
    "should",
    "have to",
    "need to",
    "would like to",
    "i want",
    "we want",
    "i would prefer",
    "agreed",
]

EPIC_REJECT_PHRASES: List[str] = [
    "could",
    "might",
    "may",
    "option",
    "an option",
    "worth looking into",
]


def strip_code_fences(s: str) -> str:
    """Remove markdown code fences from a model response.

    This is used when the model returns JSON wrapped inside triple backticks.
    If the input is not a string, an empty string is returned.

    Args:
        s: Raw text returned by the model.

    Returns:
        The text without surrounding code fences.
    """
    if not isinstance(s, str):
        return ""

    s = s.strip()

    if s.startswith("```"):
        first_newline = s.find("\n")
        if first_newline != -1:
            s = s[first_newline + 1 :]

        if s.endswith("```"):
            s = s[:-3]

    return s.strip()


def extract_json_object(s: str) -> Optional[str]:
    """Extract the outermost JSON object from a string.

    This is a fallback used when the model returns extra text before or after
    the JSON content.

    Args:
        s: Text that may contain a JSON object.

    Returns:
        The JSON object as a string, or None if no valid object boundaries
        are found.
    """
    start = s.find("{")
    end = s.rfind("}")

    if start == -1 or end == -1 or end <= start:
        return None

    return s[start : end + 1]


def safe_load_json(raw: str) -> Optional[Dict[str, Any]]:
    """Parse model output into a JSON object safely.

    The function first tries to parse the raw text directly. If that fails,
    it tries again after removing code fences and extracting the JSON object.

    Args:
        raw: Raw text returned by the model.

    Returns:
        A parsed dictionary if successful, otherwise None.
    """
    if not isinstance(raw, str) or not raw.strip():
        return None

    raw = strip_code_fences(raw)

    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        clipped = extract_json_object(raw)
        if not clipped:
            return None

        try:
            data = json.loads(clipped)
            return data if isinstance(data, dict) else None
        except json.JSONDecodeError:
            return None


def looks_like_feature_phrase(evidence: str) -> bool:
    """Check whether evidence looks like a short and concrete feature phrase.

    This is used as a fallback when the evidence does not pass the normal
    commitment gate. The phrase must be short, non-empty, and not contain
    clear uncertainty.

    Args:
        evidence: Evidence text from the model output.

    Returns:
        True if the evidence looks like a valid short feature phrase,
        otherwise False.
    """
    if not isinstance(evidence, str):
        return False

    ev = evidence.strip().lower()
    if not ev:
        return False

    if "?" in ev:
        return False

    for phrase in EPIC_REJECT_PHRASES:
        if phrase and phrase.lower() in ev:
            return False

    words = ev.split()
    if len(words) < 1 or len(words) > 6:
        return False

    return True


class EpicExtractor:
    """Extract and verify EPIC items from project text.

    The extractor uses the LLM to generate candidate EPICs, then filters the
    result so that only valid and traceable items remain.
    """

    def __init__(self, llm: Optional[LlamaClient] = None, source: str = "documents/test.txt"):
        """Initialize the extractor.

        Args:
            llm: Optional LLM client. If not provided, a new LlamaClient is created.
            source: Source name or file path used for traceability in the output.
        """
        self.llm = llm or LlamaClient()
        self.source = source

    def _call_llm(self, system_prompt: str, user_content: str) -> str:
        """Send prompts to the language model and return the raw response.

        Args:
            system_prompt: System-level instructions for the model.
            user_content: User prompt including the source text.

        Returns:
            Raw text returned by the model.
        """
        response = self.llm.generate(
            system_prompt=system_prompt,
            prompt=user_content,
            max_new_tokens=700,
            temperature=0.0,
        )
        return str(response)

    def extract(self, text: str) -> Dict[str, Any]:
        """Extract EPICs from the given text and return verified items only.

        The method sends the text to the model, parses the response as JSON,
        and filters the items based on type, title quality, evidence recovery,
        and phrase-based validation.

        Args:
            text: Input project text to analyze.

        Returns:
            A dictionary on the form:
            {
                "items": [...]
            }
            where each item is a verified EPIC.
        """
        user_content = USER_PROMPT + "\n\nTEXT:\n" + text
        raw = self._call_llm(SYSTEM_PROMPT, user_content)

        print("=== UNFILTERED, RAW OUTPUT ===")
        print(raw)

        data = safe_load_json(raw)

        if not data:
            return {"items": []}

        items = data.get("items", [])
        if not isinstance(items, list):
            return {"items": []}

        verified_items: List[Dict[str, Any]] = []

        for item in items:
            if not isinstance(item, dict):
                continue

            if item.get("type") != "EPC":
                continue

            title = item.get("title", "")
            if isinstance(title, str) and " and " in title.lower():
                continue

            ev = item.get("evidence", "")
            ev_exact = recover_exact_evidence(ev, text)
            if not ev_exact:
                continue

            passes_gate = passes_phrase_gate(
                ev_exact,
                accept_phrases=EPIC_COMMIT_PHRASES,
                reject_phrases=EPIC_REJECT_PHRASES,
                reject_questions=False,
            )

            if not passes_gate and not looks_like_feature_phrase(ev_exact):
                continue

            item["evidence"] = ev_exact
            item["id"] = str(uuid.uuid4())
            item["source"] = self.source

            verified_items.append(item)

        print("=== VERIFIED FILTERED ITEMS ===")

        return {"items": verified_items}
