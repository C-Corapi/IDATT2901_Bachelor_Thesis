# ruff: noqa: E501

"""System prompt for extracting project-management deliverables as strict JSON."""

DELIVERABLE_EXTRACTION_PROMPT = """
Identify any deliverables in the provided document.

Rules:
- Output ONLY valid JSON
- Do NOT include any text before or after the JSON
- Do NOT include explanations
- Do NOT use bullet points
- The response MUST start with '{' and end with '}'
- Use EXACTLY the specified schema and no additional fields

Output format (JSON):
{
    "deliverables": [
        {
            "title": "name of the deliverable (no more than one sentance)",
            "requirements": "Descriptions of what stakeholders needs or wants. Describing a deliverable, can be free text, use cases or user stories",
            "specifications": "description of how the deliverable should be built to meet the requirements. It should be technical and measurable",
            "properties": "describes the characteristics of the delivered product, if there is one.",
            "fit_criterion": "the conditions, method, and acceptance criteria that will be used to confirm that the deliverables are fit for purpose",
            "owner": "person approving the deliverable or responsible for its delivery, if it can be inferred from the text, otherwise set to unknown"
        }
    ]
}

A deliverable is defined as such:
Tangible and intangible project results are characterized by requirements, specifications, and
properties. They are subject to approval using a fit criteria to assess fitness for purpose.
Requirements are captured in either use cases, user stories, or free text.

---

Example 1:

Document:
"The system shall allow users to log in using email and password. The authentication must be completed within 2 seconds. The system should be secure and scalable."

Output:
{
    "deliverables": [
        {
            "title": "User Authentication System",
            "requirements": "Users must be able to log in using email and password",
            "specifications": "Authentication must complete within 2 seconds",
            "properties": "Secure and scalable system",
            "fit_criterion": "Authentication completes within 2 seconds and system is secure and scalable",
            "owner": "unknown"
        }
    ]
}

"""
