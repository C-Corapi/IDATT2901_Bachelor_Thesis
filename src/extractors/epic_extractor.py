import json
import uuid
from typing import Any, Dict, List, Optional

from src.api.llm_client import LlamaClient
from src.prompts.epic_extraction import SYSTEM_PROMPT, USER_PROMPT
from src.utils.commitment_gate import passes_phrase_gate
from src.utils.evidence import recover_exact_evidence


# EPIC-specific phrase rules (kept local to the EPIC extractor)
EPIC_COMMIT_PHRASES: List[str] = [
    "we will",
    "we must",
    "must",
    "shall",
    "should",
    "have to",
    "need to",
    "would like to",
    "I want",
    "we want ",
]

EPIC_REJECT_PHRASES: List[str] = [
    "could",
    "might",
    "may",
    "option",
    "an option",
    "sounds good",
    "worth looking into",
]

ALLOWED_SCOPE = {"Local", "Global"}


def looks_like_code(output: str) -> bool:
    if not isinstance(output, str):
        return False
    s = output.strip().lower()
    return (
            s.startswith("```")
            or "```python" in s
            or "import " in s
            or "def " in s
            or "return json.dumps" in s
    )


def strip_code_fences(s: str) -> str:
    """
    Remove leading/trailing markdown code fences if present.
    Handles ```json ... ```, ```python ... ```, etc.
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
    start = s.find("{")
    end = s.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    return s[start : end + 1]


def safe_load_json(raw: str) -> Optional[Dict[str, Any]]:
    """
    Try strict json.loads; if it fails, try clipping {...}.
    Returns dict or None.
    """
    if not isinstance(raw, str) or not raw.strip():
        return None

    raw2 = strip_code_fences(raw)

    try:
        data = json.loads(raw2)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        clipped = extract_json_object(raw2)
        if not clipped:
            return None
        try:
            data = json.loads(clipped)
            return data if isinstance(data, dict) else None
        except json.JSONDecodeError:
            return None


def normalize_scope(item: Dict[str, Any]) -> None:
    # Canonical rule: always null unless explicitly stated.
    scope = item.get("scope")
    if scope not in ALLOWED_SCOPE:
        item["scope"] = None
    # Extra strict for now (matches your working prototype)
    item["scope"] = None


class EpicExtractor:
    """
    Extract EPIC (EPC) items from unstructured text using the LLM,
    then apply strict parsing + validation + filtering.
    """

    def __init__(self, llm: Optional[LlamaClient] = None, source: str = "documents/test.txt"):
        self.llm = llm or LlamaClient()
        self.source = source

    def _call_llm(self, system_prompt: str, user_content: str) -> str:
        return self.llm.generate(
            system_prompt=system_prompt,
            prompt=user_content,
            max_new_tokens=700,
            temperature=0.0,
        )

    def extract(self, text: str) -> Dict[str, Any]:
        user_content = USER_PROMPT + "\n\nTEXT:\n" + text

        # Add a minimal anti-code guard to the system prompt (helps reduce code-block outputs)
        anti_code_guard = """
CRITICAL OUTPUT CONSTRAINTS:
- Do NOT output code.
- Do NOT output markdown or triple backticks.
- Output must start with '{' and end with '}'.
"""

        raw = self._call_llm(SYSTEM_PROMPT + anti_code_guard, user_content)

        # If the model still outputs code, retry once with an even stricter system reminder.
        if looks_like_code(raw):
            strict_retry = SYSTEM_PROMPT + anti_code_guard + """
STRICT JSON MODE:
If you cannot comply, output exactly: { "items": [] }
"""
            raw = self._call_llm(strict_retry, user_content)

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

            ev = item.get("evidence", "")
            ev_exact = recover_exact_evidence(ev, text)
            if not ev_exact:
                continue

            # EPIC commitment gate (EPIC rules)
            if not passes_phrase_gate(
                    ev_exact,
                    accept_phrases=EPIC_COMMIT_PHRASES,
                    reject_phrases=EPIC_REJECT_PHRASES,
                    reject_questions=True,
            ):
                continue

            # Replace evidence with exact substring from TEXT
            item["evidence"] = ev_exact

            # Enforce scope rule
            normalize_scope(item)

            # Optional internal fields (useful for demo/logging)
            item["id"] = str(uuid.uuid4())
            item["source"] = self.source

            verified_items.append(item)

        return {"items": verified_items}