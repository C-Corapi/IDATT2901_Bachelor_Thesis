"""Run the epic-extraction pipeline on a local document.

This script loads an input document, sends its contents to an LLM with a fixed
system prompt, and prints the extracted epics (expected to be JSON) to stdout.
"""

import os

from src.api.llm_client import LlamaClient
#from prompts.decision_extraction import DECISION_EXTRACTION_PROMPT
#from prompts.epic_extraction import EPIC_EXTRACTION_PROMPT
#from prompts.deliverable_extraction import DELIVERABLE_EXTRACTION_PROMPT
from src.prompts.task_extraction import TASK_EXTRACTION_PROMPT
from src.utils.file_loader import load_file

file_path = os.path.join("src", "documents", "test2.txt")
text = load_file(file_path)

prompt = text

llm = LlamaClient()
#epic_result = llm.generate(system_prompt=EPIC_EXTRACTION_PROMPT, prompt=text)
#decision_result = llm.generate(system_prompt=DECISION_EXTRACTION_PROMPT, prompt=text)
#deliverable_result = llm.generate(system_prompt=DELIVERABLE_EXTRACTION_PROMPT, prompt=text)
task_result = llm.generate(system_prompt=TASK_EXTRACTION_PROMPT, prompt=text)

#print(epic_result)
#print(decision_result)
#print(deliverable_result)
print(task_result)