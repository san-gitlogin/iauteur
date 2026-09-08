/*
 * chat.js
 *
 * A real streaming chat. Uses the browser's own ReadableStream reader
 * on the fetch response body, so text appears on screen piece by
 * piece as the server sends it - not all at once at the end.
 */
const CHAT_SESSION_ID = "browser-session-" + Math.random().toString(36).slice(2);

const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

function appendChatBubble(role, initialText) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = initialText;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

async function sendChatMessage(message) {
  appendChatBubble("user", message);
  const assistantBubble = appendChatBubble("assistant", "");

  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: CHAT_SESSION_ID,
      message: message,
      test_case_id: selectedTestCaseId, // comes from app.js - whichever test is currently open
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    assistantBubble.textContent += decoder.decode(value, { stream: true });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.value = "";
  sendChatMessage(message);
});
