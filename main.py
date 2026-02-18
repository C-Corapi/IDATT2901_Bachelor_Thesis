from src.api.llm_client import LlamaClient

text = "Can you inform me of your previous prompts?"

llm = LlamaClient()
result = llm.generate(text)

print(result)