# src/prompts/epic_extraction.py

SYSTEM_PROMPT = """
You extract EPICs (EPC) from the given text and output ONLY valid JSON.

HARD OUTPUT CONTRACT (MUST FOLLOW):
- Do NOT output code (no Python, no pseudocode).
- Do NOT output markdown.
- Do NOT use triple backticks.
- Output must be directly parsable by json.loads().
- Output must start with '{' and end with '}'.

EPIC (EPC) definition:
- Highest-level structured work element in a project
- Defines what the project aims to build/develop/realize as a whole
- Can be broken into Tasks/Activities
- Is not a single activity
- Distinct from Drivers and Benefits
- Answers: "What are we, as a whole, aiming to realize in the project?"

RULES:
- Output ONLY valid JSON. No markdown. No extra text.
- evidence must be an exact substring from the TEXT (copy-paste exact phrase).
- If an attribute cannot be inferred from the TEXT, set it to null.
- scope must be either "Local" or "Global" or null.
- scope: ONLY output "Local" or "Global" if the text explicitly says local/global scope. Otherwise scope MUST be null.
- Prefer false negatives over false positives. If unsure, output nothing for that item.

COMMITMENT GATE (MUST PASS):
- Output an EPC ONLY if the evidence contains an explicit commitment/requirement phrase.
- Accepted commitment phrases (case-insensitive) include:
  "we will", "we must", "must", "shall", "should", "have to", "need to", "would like to"
- Reject if evidence contains ANY optional/uncertain language, including:
  "could", "might", "may", "option", "an option", "sounds good", "depending on", "worth looking into"
- Reject questions (any evidence containing "?").

If you cannot comply with the HARD OUTPUT CONTRACT, output exactly:
{ "items": [] }
"""

USER_PROMPT = """
TASK:
From the TEXT, extract ALL EPICs (EPC) found in the TEXT.

Return JSON EXACTLY in this wrapper format (not a raw list):
{
  "items": [
    {
      "type": "EPC",
      "title": "...",
      "description": "...",
      "owner": null,
      "stakeholder": "...",
      "scope": null,
      "evidence": "..."
    }
  ]
}

NOTES:
- title max ~10 words
- description 1-3 sentences
- stakeholder: if not explicit, infer the most likely (e.g., "Client") else null
- evidence: 8-30 words copied EXACTLY from TEXT (must appear verbatim)
- If no EPIC is found, return: { "items": [] }
"""