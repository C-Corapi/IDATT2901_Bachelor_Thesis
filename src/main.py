"""Run the epic-extraction pipeline on a local document.

This script loads an input document, sends its contents to an LLM with a fixed
system prompt, and prints the extracted epics (expected to be JSON) to stdout.
"""

import os
import json

from fastapi import FastAPI
from api.llm_client import LlamaClient
from prompts.activity_extraction import ACTIVITY_EXTRACTION_PROMPT

# from prompts.decision_extraction import DECISION_EXTRACTION_PROMPT
# from src.extractors.epic_extractor import EpicExtractor
# from prompts.deliverable_extraction import DELIVERABLE_EXTRACTION_PROMPT
from utils.file_loader import load_file

file_path = os.path.join("src", "documents", "test.txt")
text = load_file(file_path)

prompt = text

llm = LlamaClient()

# epic_result = EpicExtractor(source=file_path).extract(text)
# decision_result = llm.generate(system_prompt=DECISION_EXTRACTION_PROMPT, prompt=text)
# deliverable_result = llm.generate(system_prompt=DELIVERABLE_EXTRACTION_PROMPT, prompt=text)
# task_result = llm.generate(system_prompt=TASK_EXTRACTION_PROMPT, prompt=text)
activity_result = llm.generate(system_prompt=ACTIVITY_EXTRACTION_PROMPT, prompt=text)

# print(json.dumps(epic_result, ensure_ascii=False, indent=2))
# print(decision_result)
# print(deliverable_result)
# print(task_result)
print(activity_result)
