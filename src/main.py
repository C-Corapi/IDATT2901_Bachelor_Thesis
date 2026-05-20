"""Run the epic-extraction pipeline on a local document.

This script loads an input document, sends its contents to an LLM with a fixed
system prompt, and prints the extracted epics (expected to be JSON) to stdout.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import (
    activity_router,
    decision_router,
    deliverable_router,
    document_router,
    epic_router,
    kanban_router,
    task_router,
)

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(epic_router.router)
app.include_router(decision_router.router)
app.include_router(deliverable_router.router)
app.include_router(task_router.router)
app.include_router(activity_router.router)
app.include_router(kanban_router.router)
app.include_router(document_router.router)
