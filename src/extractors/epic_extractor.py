import json
import uuid
from typing import Any, Dict, List, Optional

from src.api.llm_client import LlamaClient
from src.prompts.epic_extraction import SYSTEM_PROMPT, USER_PROMPT
from src.utils.commitment_gate import passes_phrase_gate
from src.utils.evidence import recover_exact_evidence


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
    if not isinstance(s, str):
        return ""

    s = s.strip()

    if s.startswith("```"):
        first_newline = s.find("\n")
        if first_newline != -1:
            s = s[first_newline + 1:]

        if s.endswith("```"):
            s = s[:-3]

    return s.strip()


def extract_json_object(s: str) -> Optional[str]:
    start = s.find("{")
    end = s.rfind("}")

    if start == -1 or end == -1 or end <= start:
        return None

    return s[start:end + 1]


def safe_load_json(raw: str) -> Optional[Dict[str, Any]]:
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

    # Korte og konkrete tekstbiter kan være god nok som evidence for en EPIC, så lenge den ikke e for lang.
    if len(words) < 1 or len(words) > 6:
        return False

    return True


class EpicExtractor:
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
        raw = self._call_llm(SYSTEM_PROMPT, user_content)

        print("=== RAW OUTPUT ===")
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

            # Vi ønska én EPIC per feature, ikke at det skal vær sammenslåtte slikt som "Pool and Wine Cellar"
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
            item["scope"] = None
            item["id"] = str(uuid.uuid4())
            item["source"] = self.source

            verified_items.append(item)

        print("=== VERIFIED ITEMS ===")
        print(json.dumps({"items": verified_items}, ensure_ascii=False, indent=2))

        return {"items": verified_items}