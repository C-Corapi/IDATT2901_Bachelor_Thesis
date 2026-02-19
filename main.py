from src.api.llm_client import LlamaClient
from src.utils.file_loader import load_file
from src.prompts.epic_extraction import EXTRACTION_PROMPT

text = load_file("src/documents/test.txt")

prompt = text
print(prompt)

llm = LlamaClient()
result = llm.generate(system_prompt=EXTRACTION_PROMPT, prompt=text)

print(result)