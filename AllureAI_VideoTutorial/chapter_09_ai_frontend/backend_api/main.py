"""
main.py

Everything from Chapter 8 (the /analyze endpoint) and the streaming
chat endpoint, plus:
POST /reports/upload - accepts a REAL Allure single-file HTML report
(either legacy Promise.allSettled or allure-combine format - see
allure_html_decoder.py, ported from the team's production analyzer),
decodes it, and stores it in SQLite, ready to browse immediately.
POST /reports/{id}/analyze - a whole-report AI summary, highlighting
any failing tests, shown automatically the moment a report is opened.

Run it with:
    python -m uvicorn main:app --port 8834

Then open http://127.0.0.1:8834/docs to try every endpoint by hand.
"""
import sqlite3
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import allure_html_decoder
from ai_provider import StubAIProvider, get_ai_provider
from chat_manager import SessionStore, TokenManager, build_system_message
from decode_report import TestCase, decode_report
from store_report import ensure_schema, is_text_mime_type

DB_PATH = Path(__file__).parent / "tutorial.db"

app = FastAPI(title="Chapter 9 - Streaming AI Chat")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

session_store = SessionStore()
token_manager = TokenManager()


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row  # lets us read columns by name, not just position
    return connection


# ---------------------------------------------------------------------------
# Response shapes. Deciding these up front is what makes the endpoint
# functions below almost boring to write - the hard thinking already
# happened here.
# ---------------------------------------------------------------------------
class ReportSummary(BaseModel):
    id: int
    report_name: str
    created_at: str
    passed_count: int
    failed_count: int
    broken_count: int
    skipped_count: int


class TestCaseSummary(BaseModel):
    id: int
    name: str
    status: str


class AttachmentSummary(BaseModel):
    id: int
    name: str
    mime_type: str
    text_content: Optional[str] = None
    has_binary_content: bool


class StepDetail(BaseModel):
    id: int
    step_order: int
    name: str
    status: str
    attachments: list[AttachmentSummary]


class TestCaseDetail(BaseModel):
    id: int
    name: str
    status: str
    failure_message: Optional[str] = None
    failure_trace: Optional[str] = None
    steps: list[StepDetail]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/reports", response_model=list[ReportSummary])
def list_reports():
    connection = get_connection()
    try:
        rows = connection.execute(
            "SELECT id, report_name, created_at, passed_count, failed_count, broken_count, skipped_count "
            "FROM reports ORDER BY id"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        connection.close()


@app.get("/reports/{report_id}/test-cases", response_model=list[TestCaseSummary])
def list_test_cases_for_report(report_id: int):
    connection = get_connection()
    try:
        report_row = connection.execute("SELECT id FROM reports WHERE id = ?", (report_id,)).fetchone()
        if report_row is None:
            raise HTTPException(status_code=404, detail=f"No report with id {report_id}")

        rows = connection.execute(
            "SELECT id, name, status FROM test_cases WHERE report_id = ? ORDER BY id", (report_id,)
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        connection.close()


@app.get("/test-cases/{test_case_id}", response_model=TestCaseDetail)
def get_test_case_detail(test_case_id: int):
    """The main 'fetch everything about one test' endpoint - steps AND their attachments."""
    connection = get_connection()
    try:
        test_case_row = connection.execute(
            "SELECT id, name, status, failure_message, failure_trace FROM test_cases WHERE id = ?",
            (test_case_id,),
        ).fetchone()
        if test_case_row is None:
            raise HTTPException(status_code=404, detail=f"No test case with id {test_case_id}")

        step_rows = connection.execute(
            "SELECT id, step_order, name, status FROM test_steps WHERE test_case_id = ? ORDER BY step_order",
            (test_case_id,),
        ).fetchall()

        steps = []
        for step_row in step_rows:
            attachment_rows = connection.execute(
                """SELECT id, name, mime_type, text_content, binary_content
                   FROM attachments WHERE step_id = ? ORDER BY id""",
                (step_row["id"],),
            ).fetchall()

            attachments = [
                AttachmentSummary(
                    id=a["id"],
                    name=a["name"],
                    mime_type=a["mime_type"],
                    text_content=a["text_content"],
                    has_binary_content=a["binary_content"] is not None,
                )
                for a in attachment_rows
            ]

            steps.append(StepDetail(
                id=step_row["id"], step_order=step_row["step_order"],
                name=step_row["name"], status=step_row["status"], attachments=attachments,
            ))

        return TestCaseDetail(
            id=test_case_row["id"], name=test_case_row["name"], status=test_case_row["status"],
            failure_message=test_case_row["failure_message"], failure_trace=test_case_row["failure_trace"],
            steps=steps,
        )
    finally:
        connection.close()


@app.get("/attachments/{attachment_id}/raw")
def get_attachment_raw(attachment_id: int):
    """
    Returns the RAW bytes of an attachment, with the correct content type,
    instead of JSON. This is what lets a future frontend point an <img>
    tag straight at this URL and have the browser just show the picture.
    """
    connection = get_connection()
    try:
        row = connection.execute(
            "SELECT mime_type, text_content, binary_content FROM attachments WHERE id = ?",
            (attachment_id,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail=f"No attachment with id {attachment_id}")

        if row["binary_content"] is not None:
            return Response(content=row["binary_content"], media_type=row["mime_type"])
        return Response(content=row["text_content"] or "", media_type=row["mime_type"])
    finally:
        connection.close()


# ---------------------------------------------------------------------------
# AI analysis
# ---------------------------------------------------------------------------
class AnalysisResponse(BaseModel):
    test_case_id: int
    provider: str
    analysis: str
    context_used: str


def build_analysis_context(detail: TestCaseDetail) -> str:
    """
    Turn one TestCaseDetail into a plain-text description an AI (or a
    human) can read top to bottom. Only TEXT-shaped attachments are
    included - a screenshot's raw bytes would be useless in a prompt,
    and its mime type already tells us that without any special-casing.
    """
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


@app.post("/test-cases/{test_case_id}/analyze", response_model=AnalysisResponse)
def analyze_test_case(test_case_id: int):
    """Ask an AI provider (real Azure OpenAI, or the local stub) to explain one test case."""
    detail = get_test_case_detail(test_case_id)  # reuses the Chapter 6 endpoint function directly
    context_text = build_analysis_context(detail)

    provider = get_ai_provider()
    analysis_text = provider.analyze(context_text)

    return AnalysisResponse(
        test_case_id=test_case_id,
        provider=provider.name,
        analysis=analysis_text,
        context_used=context_text,
    )


# ---------------------------------------------------------------------------
# Streaming chat
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    session_id: str
    message: str
    test_case_id: Optional[int] = None


@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    """
    A real back-and-forth conversation, streamed. Each chunk of the AI's
    reply is sent to the browser the moment it's ready, instead of the
    browser waiting for the entire answer before showing anything.
    """
    session = session_store.get_or_create(request.session_id)

    if request.test_case_id is not None:
        detail = get_test_case_detail(request.test_case_id)
        session.current_test_case_context = build_analysis_context(detail)

    session.add_message("user", request.message)

    system_message = build_system_message(session.current_test_case_context)
    messages_for_ai = token_manager.trim_history(system_message, session.history)

    provider = get_ai_provider()

    def token_stream():
        full_reply = ""
        for piece in provider.stream_chat(messages_for_ai):
            full_reply += piece
            yield piece
        session.add_message("assistant", full_reply)

    return StreamingResponse(token_stream(), media_type="text/plain")


@app.get("/chat/{session_id}/history")
def get_chat_history(session_id: str):
    session = session_store.get_or_create(session_id)
    return {"session_id": session_id, "history": session.history}


# ---------------------------------------------------------------------------
# Upload a real Allure HTML report
# ---------------------------------------------------------------------------
class UploadResponse(BaseModel):
    report_id: int
    report_name: str
    detected_format: str
    total_test_cases: int
    passed_count: int
    failed_count: int
    broken_count: int
    skipped_count: int


def store_test_cases(test_cases: list[TestCase], report_name: str) -> int:
    """Shared by every decode path (our own bundle format AND real Allure
    HTML) - once we have TestCase objects, storing them is identical."""
    passed_count = sum(1 for t in test_cases if t.status == "passed")
    failed_count = sum(1 for t in test_cases if t.status == "failed")
    broken_count = sum(1 for t in test_cases if t.status == "broken")
    skipped_count = sum(1 for t in test_cases if t.status == "skipped")

    connection = sqlite3.connect(DB_PATH)
    try:
        ensure_schema(connection)
        cursor = connection.cursor()

        cursor.execute(
            """INSERT INTO reports (report_name, passed_count, failed_count, broken_count, skipped_count)
               VALUES (?, ?, ?, ?, ?)""",
            (report_name, passed_count, failed_count, broken_count, skipped_count),
        )
        report_id = cursor.lastrowid

        for test_case in test_cases:
            cursor.execute(
                """INSERT INTO test_cases (report_id, name, status, failure_message, failure_trace)
                   VALUES (?, ?, ?, ?, ?)""",
                (report_id, test_case.name, test_case.status,
                 test_case.failure_message, test_case.failure_trace),
            )
            test_case_id = cursor.lastrowid

            for step_order, step in enumerate(test_case.steps):
                cursor.execute(
                    """INSERT INTO test_steps (test_case_id, step_order, name, status)
                       VALUES (?, ?, ?, ?)""",
                    (test_case_id, step_order, step.name, step.status),
                )
                step_id = cursor.lastrowid

                for attachment in step.attachments:
                    is_text = is_text_mime_type(attachment.mime_type)
                    text_content = attachment.data.decode("utf-8", errors="replace") if is_text else None
                    binary_content = None if is_text else attachment.data
                    cursor.execute(
                        """INSERT INTO attachments (step_id, name, mime_type, text_content, binary_content)
                           VALUES (?, ?, ?, ?, ?)""",
                        (step_id, attachment.name, attachment.mime_type, text_content, binary_content),
                    )

        connection.commit()
        return report_id
    finally:
        connection.close()


@app.post("/reports/upload", response_model=UploadResponse)
async def upload_report(file: UploadFile = File(...), report_name: str = Form(...)):
    """
    Accepts an uploaded HTML file and figures out, on its own, which of
    three formats it is:
      1. Our own tutorial "bundle.html" (from Chapter 2)
      2. A real Allure single-file report (legacy Promise.allSettled)
      3. A real Allure single-file report packed by allure-combine
    then decodes it and stores it, exactly like every earlier chapter's
    CLI scripts do - this is just the same pipeline, reachable from a
    browser instead of a terminal.
    """
    raw_bytes = await file.read()

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tmp_file:
        tmp_file.write(raw_bytes)
        tmp_path = Path(tmp_file.name)

    try:
        html_text = raw_bytes.decode("utf-8", errors="ignore")

        if '<script id="report-bundle"' in html_text:
            detected_format = "tutorial-bundle"
            test_cases = decode_report(tmp_path)
        elif allure_html_decoder.is_combine_format(html_text):
            detected_format = "allure-combine"
            test_cases = allure_html_decoder.decode_any_report(tmp_path)
        elif "Promise.allSettled" in html_text:
            detected_format = "allure-legacy"
            test_cases = allure_html_decoder.decode_any_report(tmp_path)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unrecognized report format. Expected a Chapter 2 bundle.html, or a real "
                       "Allure single-file report (legacy or allure-combine).",
            )

        if not test_cases:
            raise HTTPException(status_code=400, detail="No test cases were found in this report.")

        report_id = store_test_cases(test_cases, report_name)

        return UploadResponse(
            report_id=report_id,
            report_name=report_name,
            detected_format=detected_format,
            total_test_cases=len(test_cases),
            passed_count=sum(1 for t in test_cases if t.status == "passed"),
            failed_count=sum(1 for t in test_cases if t.status == "failed"),
            broken_count=sum(1 for t in test_cases if t.status == "broken"),
            skipped_count=sum(1 for t in test_cases if t.status == "skipped"),
        )
    finally:
        tmp_path.unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# Whole-report AI summary - shown automatically the moment a report opens
# ---------------------------------------------------------------------------
class FailingTest(BaseModel):
    id: int
    name: str
    status: str
    reason: Optional[str] = None


class ReportAnalysisResponse(BaseModel):
    report_id: int
    provider: str
    summary: str
    failing_tests: list[FailingTest]


@app.post("/reports/{report_id}/analyze", response_model=ReportAnalysisResponse)
def analyze_report(report_id: int):
    """
    One AI call that summarizes the WHOLE report, not just one test.
    The list of failing tests and their reasons comes straight from the
    database (never from parsing the AI's free-text reply) - only the
    narrative summary itself is AI-written. That way the "what actually
    failed" list is always exactly right, even if the AI's wording varies.
    """
    connection = get_connection()
    try:
        report_row = connection.execute(
            "SELECT report_name, passed_count, failed_count, broken_count, skipped_count FROM reports WHERE id = ?",
            (report_id,),
        ).fetchone()
        if report_row is None:
            raise HTTPException(status_code=404, detail=f"No report with id {report_id}")

        test_case_rows = connection.execute(
            "SELECT id, name, status, failure_message FROM test_cases WHERE report_id = ? ORDER BY id",
            (report_id,),
        ).fetchall()
    finally:
        connection.close()

    failing_tests = [
        FailingTest(id=row["id"], name=row["name"], status=row["status"],
                    reason=(row["failure_message"] or "").strip() or None)
        for row in test_case_rows if row["status"] in ("failed", "broken")
    ]

    context_lines = [
        f"Report: {report_row['report_name']}",
        f"Totals: {report_row['passed_count']} passed, {report_row['failed_count']} failed, "
        f"{report_row['broken_count']} broken, {report_row['skipped_count']} skipped, "
        f"{len(test_case_rows)} total test cases.",
        "Test cases:",
    ]
    for row in test_case_rows:
        line = f"  [{row['status']}] {row['name']}"
        if row["status"] in ("failed", "broken") and row["failure_message"]:
            line += f" - reason: {row['failure_message'].strip()}"
        context_lines.append(line)

    provider = get_ai_provider()
    if isinstance(provider, StubAIProvider):
        # The per-test stub logic below only understands "one test, one
        # status" - it doesn't generalize to "many tests, mixed results,
        # one summary." So for a whole-report summary in stub mode, build
        # a correct sentence directly from numbers we already know are
        # right, rather than stretching the per-test stub to fit.
        if failing_tests:
            summary_text = (
                f"{len(failing_tests)} of {len(test_case_rows)} test case(s) need attention "
                f"(status: failed or broken). See the highlighted list below for the exact reason "
                f"behind each one - it's read straight from the test results, not summarized."
            )
        else:
            summary_text = f"All {len(test_case_rows)} test case(s) in this report passed."
    else:
        summary_text = provider.analyze("\n".join(context_lines))

    return ReportAnalysisResponse(
        report_id=report_id, provider=provider.name, summary=summary_text, failing_tests=failing_tests,
    )

