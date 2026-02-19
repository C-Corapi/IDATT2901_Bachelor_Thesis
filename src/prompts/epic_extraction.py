EXTRACTION_PROMPT = """
You are an AI system that extracts project managment epics from documents.

Rules:
- Return valid JSON only.

Output format (JSON):
{
    "epics": [
        "title": "short epic title",
        "description": "1-2 sentence description",
        "owner": "who is responsible for this epic",
        "stakeholder": "who are the ones affected by this epic",
        "scope": "global/local (does this affect more than one team)"
    ]
}
"""