"""
ai_provider.py

Two different ways to answer "why did this test do what it did":

  - StubAIProvider: no network call at all, a small set of plain rules
    based on the test's status. Always available, always instant, and
    it means this whole chapter is testable even with zero setup.

  - AzureOpenAIProvider: a real call to Azure OpenAI's chat completions
    API. Credentials are read ONLY from environment variables
    (AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT) - never hardcode a
    key in this file or anywhere else in this project.

`get_ai_provider()` picks whichever one is actually usable right now,
and always tells you which one it picked.
"""
import os
from abc import ABC, abstractmethod


class AIProvider(ABC):
    name: str

    @abstractmethod
    def analyze(self, context_text: str) -> str:
        """Given a plain-text description of one test case, explain what happened."""


class StubAIProvider(AIProvider):
    name = "stub (no AI credentials configured)"

    def analyze(self, context_text: str) -> str:
        lowered = context_text.lower()

        if "status: failed" in lowered:
            return (
                "This test FAILED. That means the test ran all the way through, but one "
                "of its checks (an assert statement) got a value it did not expect. Look "
                "at the failure message in the context above for the exact expected-versus-"
                "actual comparison - that's almost always where the real story is."
            )
        if "status: broken" in lowered:
            return (
                "This test is BROKEN, which is a different thing from failed. Broken means "
                "something went wrong before any real check even got to run - usually a bug "
                "in the test itself (like referencing something that does not exist), rather "
                "than the system under test actually behaving incorrectly."
            )
        if "status: skipped" in lowered:
            return "This test was SKIPPED on purpose and never ran, so there is nothing to diagnose here."

        return (
            "This test PASSED. Every step inside it, and every check inside those steps, "
            "completed exactly as expected."
        )


class AzureOpenAIProvider(AIProvider):
    name = "azure_openai"

    def __init__(self):
        from openai import AzureOpenAI  # imported lazily so the stub path never needs this package

        api_key = os.environ["AZURE_OPENAI_API_KEY"]
        endpoint = os.environ["AZURE_OPENAI_ENDPOINT"]
        api_version = os.environ.get("AZURE_OPENAI_API_VERSION", "2024-05-01-preview")
        self.deployment_name = os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-35-turbo")
        self.client = AzureOpenAI(api_key=api_key, api_version=api_version, azure_endpoint=endpoint)

    def analyze(self, context_text: str) -> str:
        response = self.client.chat.completions.create(
            model=self.deployment_name,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful test analysis assistant. Explain, in plain, "
                        "simple English, why a test passed, failed, was broken, or was "
                        "skipped, using ONLY the context you are given. Keep it short - "
                        "three or four sentences at most."
                    ),
                },
                {"role": "user", "content": context_text},
            ],
            temperature=0.3,
            max_tokens=300,
        )
        return response.choices[0].message.content


def get_ai_provider() -> AIProvider:
    """Use real Azure OpenAI if it's configured; otherwise fall back to the stub."""
    if os.getenv("AZURE_OPENAI_API_KEY") and os.getenv("AZURE_OPENAI_ENDPOINT"):
        try:
            return AzureOpenAIProvider()
        except Exception:
            # Credentials present but something else is wrong (bad key, network, etc.)
            # Fall back rather than take the whole endpoint down.
            return StubAIProvider()
    return StubAIProvider()
