"""
main.py

Connects Chapter 5 (FastAPI) to Chapter 4 (the SQLite database). Every
endpoint here reads real rows out of tutorial.db and hands them back
as JSON - or, for a screenshot, as the actual raw image bytes, so a
future frontend can point an <img> tag straight at our API.

Run it with:
    python -m uvicorn main:app --port 8834

Then open http://127.0.0.1:8834/docs to try every endpoint by hand.
"""
import sqlite3
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_PATH = Path(__file__).parent / "tutorial.db"

app = FastAPI(title="Chapter 6 - FastAPI + SQLite")

# The frontend in Chapter 7 runs on a DIFFERENT port (Flask, e.g. 5000)
# than this API (FastAPI, e.g. 8834). Browsers block a webpage from one
# port calling an API on another port unless that API explicitly says
# "yes, this is allowed" - that permission is called CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
