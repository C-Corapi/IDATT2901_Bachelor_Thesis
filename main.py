"""Run the epic-extraction pipeline on a local document.

This script loads an input document, sends its contents to an LLM with a fixed
system prompt, and prints the extracted epics (expected to be JSON) to stdout.
"""

import os

from src.api.llm_client import LlamaClient
from src.prompts.epic_extraction import EXTRACTION_PROMPT
from src.utils.file_loader import load_file

file_path = os.path.join("src", "documents", "test.txt")
text = load_file(file_path)

prompt = text
print(prompt)

llm = LlamaClient()
result = llm.generate(system_prompt=EXTRACTION_PROMPT, prompt=text)

print(result)