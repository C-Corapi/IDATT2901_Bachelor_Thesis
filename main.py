import os

from src.api.llm_client import LlamaClient
from src.utils.file_loader import load_file
from src.prompts.epic_extraction import EXTRACTION_PROMPT

file_path = os.path.join("src", "documents", "test.txt")
text = load_file(file_path)

prompt = text
print(prompt)

llm = LlamaClient()
result = llm.generate(system_prompt=EXTRACTION_PROMPT, prompt=text)

print(result)