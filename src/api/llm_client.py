from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os

print("llm_client.py loaded")

class LlamaClient:
    def __init__(self):
        load_dotenv()

        self.client = InferenceClient(
            model="meta-llama/Llama-3.1-8B-Instruct",
            token=os.getenv("API_TOKEN"),
        )

    def generate(self, system_prompt, prompt, max_new_tokens=500, temperature=0.2):
        response = self.client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_new_tokens,
            temperature=temperature,
        )

        return response.choices[0].message.content