# ruff: noqa: E501

"""System prompt for extracting project-management deliverables as strict JSON."""

DELIVERABLE_EXTRACTION_PROMPT = """
Identify any deliverables in the provided document.

Rules:
- Return valid JSON only
- Write unknown if an attribute is unknown, do not leave anything empty

Output format (JSON):
{
    "deliverables": [
        "requirements": "description of what stakeholders need",
        "specifications": "description of how the deliverable should be built to meet the 
        requirements. It should be technical and measurable",
        "properties": "describes the characteristics of the delivered product, if there is one."
    ]
}

A deliverable is defined as such:
Tangible and intangible project results are characterized by requirements, specifications, and
properties. They are subject to approval using a fit criteria to assess fitness for purpose.
Requirements are captured in either use cases, user stories, or free text.

---

Example:

Document:
"The system shall allow users to log in using email and password. The authentication must be completed within 2 seconds. The system should be secure and scalable."

Output:
{
    "deliverables": [
        {
            "requirements": "Users must be able to log in using email and password",
            "specifications": "Authentication must complete within 2 seconds",
            "properties": "Secure and scalable system"
        }
    ]
}

"""
