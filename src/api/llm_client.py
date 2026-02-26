"""LLM client wrapper for calling Hugging Face Inference API."""

import os

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

print("llm_client.py loaded")

class LlamaClient:
    """Client wrapper around Hugging Face Inference for a Llama chat model.

    Class loads environment variables (via `python-dotenv`) and initializes an
    `InferenceClient` using an API token from the environment.

    Environment variables:
        API_TOKEN: Hugging Face API token used to authenticate requests.
    """

    def __init__(self):
        """Initialize the LLM client using configuration from environment variables.

        Loads variables from a local `.env` file (if present) and reads `API_TOKEN`
        from the environment.

        Raises:
            ValueError: If `API_TOKEN` is not set.
        """
        load_dotenv()

        self.client = InferenceClient(
            model="meta-llama/Llama-3.1-8B-Instruct",
            token=os.getenv("API_TOKEN"),
        )

    def generate(self, system_prompt, prompt, max_new_tokens=500, temperature=0.2):
        """Generates a chat completion from the model.

        Args:
            system_prompt: System instructions that define the assistant's behavior.
            prompt: The user prompt to send to the model.
            max_new_tokens: Maximum number of tokens to generate in the response.
            temperature: Sampling temperature; higher values increase randomness.

        Returns:
            The generated message text.

        Raises:
            RuntimeError: If the upstream API request fails.
        """
        response = self.client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_new_tokens,
            temperature=temperature,
        )

        return response.choices[0].message.content