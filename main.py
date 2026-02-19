import os

from src.api.llm_client import LlamaClient
from src.utils.file_loader import load_file

file_path = os.path.join("src", "documents", "test.txt")
text = load_file(file_path)

prompt = text + "\n\n Can you identify the epics in the document?"

llm = LlamaClient()
result = llm.generate(text)

print(result)