"""
chat_manager.py

Two small, focused pieces:

  - TokenManager: counts roughly how many "tokens" a piece of text is
    worth (AI models charge and think in tokens, not characters), and
    trims old chat history once a conversation gets too long to fit.

  - ChatSession / SessionStore: one chat conversation per session_id,
    kept in memory. Each session remembers its own message history and
    which test case (if any) it's currently talking about.
"""
import os
import time
from dataclasses import dataclass, field
from typing import Optional


class TokenManager:
    """
    Counts tokens using tiktoken if it's available, otherwise falls back
    to a rough "4 characters per token" estimate - the same resilience
    trick used in the real production Allure AI project, so a network
    hiccup fetching tiktoken's data file never takes the whole server
    down over something as small as token counting.
    """

    def __init__(self, max_context_tokens: int = 4000, response_buffer: int = 500):
        self.max_context_tokens = max_context_tokens
        self.response_buffer = response_buffer
        self.available_tokens = max_context_tokens - response_buffer
        self.encoding = None
        try:
            import tiktoken
            self.encoding = tiktoken.get_encoding("cl100k_base")
        except Exception:
            self.encoding = None

    def count_tokens(self, text: str) -> int:
        if self.encoding is not None:
            return len(self.encoding.encode(text))
        return max(1, len(text) // 4)

    def trim_history(self, system_message: dict, history: list[dict]) -> list[dict]:
        """
        Keep the system message and as much RECENT history as fits in
        the available token budget, dropping the oldest messages first.
        """
        budget = self.available_tokens - self.count_tokens(system_message["content"])
        kept_reversed = []

        for message in reversed(history):
            cost = self.count_tokens(message["content"])
            if cost > budget:
                break
            kept_reversed.append(message)
            budget -= cost

        return [system_message] + list(reversed(kept_reversed))


@dataclass
class ChatSession:
    session_id: str
    history: list[dict] = field(default_factory=list)
    current_test_case_context: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    last_activity: float = field(default_factory=time.time)

    def add_message(self, role: str, content: str) -> None:
        self.history.append({"role": role, "content": content})
        self.last_activity = time.time()


class SessionStore:
    """All chat sessions, kept in memory. Restarting the server forgets everything -
    that's a deliberate, honest limitation for a teaching project, not a bug."""

    def __init__(self):
        self._sessions: dict[str, ChatSession] = {}

    def get_or_create(self, session_id: str) -> ChatSession:
        if session_id not in self._sessions:
            self._sessions[session_id] = ChatSession(session_id=session_id)
        return self._sessions[session_id]

    def all_sessions(self) -> list[ChatSession]:
        return list(self._sessions.values())


def build_system_message(test_case_context: Optional[str]) -> dict:
    base_instructions = (
        "You are a helpful assistant embedded in a test report viewer. "
        "Answer the user's questions about their test results clearly and briefly. "
        "If you don't have enough information to answer, say so honestly instead of guessing."
    )
    if test_case_context:
        content = f"{base_instructions}\n\nHere is the test case currently being discussed:\n{test_case_context}"
    else:
        content = f"{base_instructions}\n\nNo specific test case has been selected yet."
    return {"role": "system", "content": content}
