# Chapter 8 — Asking an AI to Explain a Test, Honestly

## The promise of this chapter

By the end of this chapter, someone watching has:

- built one new endpoint that asks an AI to explain why a test passed, failed, was broken, or was skipped
- seen it work with ZERO setup (a built-in fallback that needs no API key at all)
- seen it work AGAIN with a real AI, using their own credentials, giving genuinely different, more natural answers
- understood exactly what gets sent to the AI and why, instead of treating it as a black box

---

## What has to be true before you record

```powershell
pip show fastapi uvicorn openai
```

On the machine this was built on: `fastapi 0.141.1`, `uvicorn 0.51.0`, `openai 3.9.0`.

This chapter works two ways, and both are real, tested, and shown in this script:

1. **No AI account at all.** The endpoint still works, using a small built-in fallback. This is intentional - you should never be blocked from following along just because you don't have an AI subscription yet.
2. **A real Azure OpenAI account.** Set two environment variables before starting the server:

```powershell
$env:AZURE_OPENAI_API_KEY = "your-own-key-here"
$env:AZURE_OPENAI_ENDPOINT = "https://your-own-resource.openai.azure.com"
python -m uvicorn main:app --port 8834
```

Never put a real key directly in a code file. Environment variables exist exactly so a key can be used without being written down anywhere a repository or a screen recording could capture it.

---

## The narration script

### Scene 1 — Decide what "explain this test" even means

**SCREEN:** A blank page, just the question written out: "What would I actually want to hand an AI to explain one test?"

**SAY:**

"Before writing any AI code, let's answer a plain question. If I wanted a colleague to explain why a test did what it did, what would I actually show them? Its name. Whether it passed, failed, was broken, or was skipped. If it failed, the exact error message. And its steps, with any readable evidence attached - logs, summaries, that kind of thing. Notice what's missing from that list - a screenshot. A colleague could look at a picture, but an AI text model can't, not through this endpoint anyway. So we leave binary evidence out and only hand over the text-shaped evidence. That's the whole plan for this chapter."

### Scene 2 — Turning a test case into plain text

**SCREEN:** `main.py`, the `build_analysis_context` function.

```python
def build_analysis_context(detail: TestCaseDetail) -> str:
    lines = [f"Test case: {detail.name}", f"Status: {detail.status}"]

    if detail.failure_message:
        lines.append(f"Failure message: {detail.failure_message.strip()}")
    if detail.failure_trace:
        lines.append(f"Failure trace: {detail.failure_trace.strip()}")

    lines.append("Steps:")
    for step in detail.steps:
        lines.append(f"  [{step.status}] {step.name}")
        for attachment in step.attachments:
            if not attachment.has_binary_content and attachment.text_content:
                snippet = attachment.text_content.strip()
                if len(snippet) > 500:
                    snippet = snippet[:500] + "...(truncated)"
                lines.append(f"    Attachment '{attachment.name}' ({attachment.mime_type}): {snippet}")

    return "\n".join(lines)
```

**SAY:**

"This function does exactly what we just planned, line by line. Name, status, the failure details if there are any, then every step, and for every step, any text attachment it's carrying - but notice `if not attachment.has_binary_content`. That flag came all the way from Chapter 4's database design. We're not inspecting file extensions here, we're just asking the one honest question that flag already answers: is this readable as text or not?"

### Scene 3 — Two providers, one shared interface

**SCREEN:** `ai_provider.py`, the `AIProvider` abstract class, then `StubAIProvider`.

**SAY:**

"Here's the bit I want you to really take with you, past this project entirely. We're defining ONE shape - something that takes in text and gives back an explanation - and then we're writing TWO different things that do it. The first one doesn't call any AI at all."

```python
class StubAIProvider(AIProvider):
    name = "stub (no AI credentials configured)"

    def analyze(self, context_text: str) -> str:
        lowered = context_text.lower()
        if "status: failed" in lowered:
            return "This test FAILED. That means the test ran all the way through, but..."
        if "status: broken" in lowered:
            return "This test is BROKEN, which is a different thing from failed..."
        if "status: skipped" in lowered:
            return "This test was SKIPPED on purpose and never ran..."
        return "This test PASSED. Every step inside it..."
```

**SAY:**

"Just a handful of plain rules, based on the one word that matters most - the status. No network call, no API key, no cost, no waiting. And this is what lets everything we build stay testable even before anyone's touched a real AI account."

**SCREEN:** `AzureOpenAIProvider`.

```python
def __init__(self):
    from openai import AzureOpenAI
    api_key = os.environ["AZURE_OPENAI_API_KEY"]
    endpoint = os.environ["AZURE_OPENAI_ENDPOINT"]
    ...
```

**SAY:**

"And here's the real one. Notice it reads its key from an environment variable, never from a line of code. And notice `get_ai_provider()` right underneath it - it checks if real credentials are actually set, and only then reaches for the real one. Otherwise, it quietly falls back to the stub. Nothing breaks either way."

### Scene 4 — Running it with no AI account at all

**SCREEN:** Terminal.

```powershell
python -m uvicorn main:app --port 8834
```

Then, in `/docs`, "Try it out" on `POST /test-cases/{test_case_id}/analyze` with a passed test's ID, then a failed one, then the broken one, then the skipped one.

**SAY (real responses, one per status, from this exact setup):**

```
[test 1, passed]   "This test PASSED. Every step inside it, and every check inside those
                     steps, completed exactly as expected."

[test 2, failed]   "This test FAILED. That means the test ran all the way through, but one
                     of its checks (an assert statement) got a value it did not expect..."

[test 7, broken]   "This test is BROKEN, which is a different thing from failed. Broken
                     means something went wrong before any real check even got to run..."

[test 9, skipped]  "This test was SKIPPED on purpose and never ran, so there is nothing to
                     diagnose here."
```

"Four different, correct explanations, and not a single AI account involved yet. That's the whole point of building the stub first."

### Scene 5 — Running it again, with a real AI

**SCREEN:** A fresh terminal, credentials set, server restarted.

```powershell
$env:AZURE_OPENAI_API_KEY = "your-own-key"
$env:AZURE_OPENAI_ENDPOINT = "https://your-own-resource.openai.azure.com"
python -m uvicorn main:app --port 8834
```

Same four requests again.

**SAY (real responses from this exact setup, using a genuine Azure OpenAI account):**

```
[test 1, passed]  "The test passed because it successfully accessed the Python.org homepage,
                    downloaded the HTML content, and confirmed that the word 'Python' appears
                    on the page. All steps completed without errors..."

[test 2, failed]  "The test failed because it was designed to fail by checking for text that
                    does not exist on the page. Specifically, the assertion expected the page
                    to contain the phrase 'This text will never appear on python.org,' which
                    was not found..."

[test 7, broken]  "The test is broken because it tried to access a header named
                    'X-Definitely-Not-A-Real-Header' in the response, which does not exist.
                    This caused a KeyError, an unexpected error that stopped the test from
                    completing..."

[test 9, skipped] "The test was skipped intentionally as indicated by the step 'When I skip
                    this check on purpose.' The initial step passed, but the test did not
                    proceed further because it was designed to be skipped..."
```

"Look closely - same four tests, same context we built, but genuinely more natural explanations, and the AI even correctly picked out the exact broken header name from the context we handed it, without us telling it to look for that specifically. That's the real value an AI adds here - not deciding pass or fail, we already know that - but turning raw evidence into a fluent explanation."

### Scene 6 — Wrap-up

**SAY:**

"So here's what we built. One endpoint, one clear plan for what evidence an AI actually needs, and two completely swappable ways of answering - one free and instant, one real and a little smarter. Neither path is fake, and neither path is required to understand the other. That's the whole architecture.

Next time, we take this exact endpoint and put it behind a real chat window - streaming responses as they're written, a proper conversation, and the finished Allure AI Report Analyser. See you there."

---

## What to show on screen — director's notes

| Moment | What to show | Why |
|---|---|---|
| Scene 1 | A crossed-out picture icon next to "screenshot" on the evidence list | Makes the binary-vs-text exclusion decision visible and deliberate |
| Scene 2 | The `has_binary_content` flag highlighted with a line drawn back to Chapter 4's schema diagram | Reinforces that this decision was made chapters ago, not invented here |
| Scene 3 | Two labelled boxes, "Stub" and "Real AI," both flowing into one shared "AIProvider" shape | Visualizes the interface-first design |
| Scene 4 vs Scene 5 | Split screen, same four requests, stub answers on the left fading into real-AI answers on the right | The direct compare is the whole payoff of the chapter |
| Scene 6 | The AIProvider box from Scene 3, with a new "chat window" icon appearing next to it | Sets up Chapter 9 |

### Suggested on-screen animation / graphic overlays

- **Scene 1:** Four evidence icons (name tag, status light, error bubble, log lines) sliding into a basket, with a picture icon bouncing OFF the basket instead of going in.
- **Scene 3:** The `AIProvider` shape drawn as a simple funnel - two different colored inputs (stub, real) pouring into the same funnel shape, coming out the bottom as one `analysis` text box.
- **Scene 4:** Each of the four responses appears with a small grey "no AI used" watermark in the corner, subtly present the whole scene.
- **Scene 5:** The grey watermark from Scene 4 flips to a small green "real AI" badge the moment each response appears, same position, so the before/after is felt even without re-reading the text.
- **Scene 6:** A small speech-bubble icon animates in next to the funnel shape, pulsing gently, hinting at the chat interface coming next.

---

## Key takeaways

1. Decide what evidence an AI actually needs BEFORE writing any AI-calling code - here, that meant deliberately excluding binary attachments and relying on a flag (`has_binary_content`) that was designed all the way back in Chapter 4.
2. Defining one shared interface (`AIProvider.analyze`) and writing two implementations behind it means the rest of the app never needs to know or care which one is actually running.
3. A deterministic, no-network stub isn't a shortcut to skip - it's what keeps a project testable and demoable with zero setup, and it's a good habit for any feature that depends on an external paid service.
4. Real AI credentials belong in environment variables, read at runtime - never typed directly into a source file, ever.
5. The AI's real value here wasn't deciding pass/fail - the database already knew that with certainty. Its value was turning structured evidence into a fluent, natural explanation, including correctly noticing specific details (like the exact broken header name) buried in the context it was given.

---

## Verified facts used in this script

- Environment: fastapi 0.141.1, uvicorn 0.51.0, openai 3.9.0, tested against a real database built from the Chapter 1-4 pipeline (10 test cases: 7 passed, 1 failed, 1 broken, 1 skipped).
- Stub mode (no environment variables set): `POST /test-cases/{id}/analyze` for test IDs 1 (passed), 2 (failed), 7 (broken), and 9 (skipped) returned `provider: "stub (no AI credentials configured)"` and the four exact response texts shown above.
- Real mode (genuine Azure OpenAI credentials set via environment variables only, verified live, never written to any file in this project): the same four requests returned `provider: "azure_openai"` and the four exact response texts shown above - including the AI correctly naming the exact broken header (`X-Definitely-Not-A-Real-Header`) purely from the context text it was given.
- `/openapi.json` confirmed the new route `/test-cases/{test_case_id}/analyze` is registered alongside the Chapter 6 routes.
- The `AzureOpenAIProvider` deployment name used (`gpt-35-turbo`) was confirmed live to route to an actual `gpt-4.1-mini` model on the tested resource - deployment names on Azure OpenAI do not have to match the underlying model name, worth knowing if a viewer's own resource behaves the same way.

## Files that belong in the project folder for this chapter

```
chapter_08_ai_backend/
  schema.sql, decode_report.py, store_report.py, bundle.html, tutorial.db   <- carried over from Chapter 6
  main.py            <- Chapter 6's API + build_analysis_context() + POST /test-cases/{id}/analyze
  ai_provider.py      <- AIProvider interface, StubAIProvider, AzureOpenAIProvider, get_ai_provider()
  requirements.txt    <- fastapi, uvicorn, requests, openai
```
