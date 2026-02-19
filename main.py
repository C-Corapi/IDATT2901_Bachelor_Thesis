from src.api.llm_client import LlamaClient
from src.utils.file_loader import load_file

text = load_file("src\\documents\\test.txt")

prompt = text + "\n\n Can you identify the epics in the document?"

llm = LlamaClient()
result = llm.generate(text)

print(result)