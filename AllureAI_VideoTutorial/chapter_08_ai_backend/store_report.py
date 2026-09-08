"""
store_report.py

Connects Chapter 2 (the decoder) to Chapter 3 (the database plan).
Decodes a packed report file, then writes every test case, step, and
attachment into SQLite, using the exact schema we planned earlier -
text-shaped evidence goes into `text_content`, binary-shaped evidence
(like a screenshot) goes into `binary_content`.

Usage:
    python store_report.py bundle.html --db-path tutorial.db --report-name "Homepage Checks Run 1"
"""
import argparse
import sqlite3
from pathlib import Path

from decode_report import decode_report

SCHEMA_FILE = Path(__file__).parent / "schema.sql"

# Allure actually has 20 attachment types (see allure.attachment_type),
# not just the 3 we first tried here. Rather than list every one by
# name, we classify by RULE: anything under text/* is text-shaped, and
# a few application/* types (JSON, XML, YAML) are text-shaped too even
# though their MIME type doesn't start with "text/". Everything else
# (images, zip, pdf, video, pcap) is treated as binary. This rule
# covers every current and future Allure attachment type without us
# having to remember to update a list.
TEXT_LIKE_APPLICATION_TYPES = {"application/json", "application/xml", "application/yaml"}


def is_text_mime_type(mime_type: str) -> bool:
    return mime_type.startswith("text/") or mime_type in TEXT_LIKE_APPLICATION_TYPES


def ensure_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(SCHEMA_FILE.read_text(encoding="utf-8"))


def store_report(html_file: Path, db_path: Path, report_name: str) -> int:
    test_cases = decode_report(html_file)

    passed_count = sum(1 for t in test_cases if t.status == "passed")
    failed_count = sum(1 for t in test_cases if t.status == "failed")
    broken_count = sum(1 for t in test_cases if t.status == "broken")
    skipped_count = sum(1 for t in test_cases if t.status == "skipped")

    connection = sqlite3.connect(db_path)
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


def print_stored_summary(db_path: Path, report_id: int) -> None:
    """Read the data straight back out of SQLite, to prove it actually landed correctly."""
    connection = sqlite3.connect(db_path)
    try:
        cursor = connection.cursor()

        cursor.execute(
            "SELECT report_name, passed_count, failed_count, broken_count, skipped_count FROM reports WHERE id = ?",
            (report_id,),
        )
        report_name, passed_count, failed_count, broken_count, skipped_count = cursor.fetchone()
        print(f"Report #{report_id}: '{report_name}' - {passed_count} passed, {failed_count} failed, "
              f"{broken_count} broken, {skipped_count} skipped")

        cursor.execute("SELECT id, name, status FROM test_cases WHERE report_id = ?", (report_id,))
        for test_case_id, name, status in cursor.fetchall():
            cursor.execute("SELECT COUNT(*) FROM test_steps WHERE test_case_id = ?", (test_case_id,))
            step_count = cursor.fetchone()[0]

            cursor.execute(
                """SELECT COUNT(*), SUM(LENGTH(binary_content)), SUM(LENGTH(text_content))
                   FROM attachments WHERE step_id IN
                   (SELECT id FROM test_steps WHERE test_case_id = ?)""",
                (test_case_id,),
            )
            attachment_count, binary_bytes, text_chars = cursor.fetchone()
            binary_bytes = binary_bytes or 0
            text_chars = text_chars or 0

            print(f"  - [{status:6}] {name}  ({step_count} steps, {attachment_count} attachments, "
                  f"{binary_bytes} binary bytes, {text_chars} text characters)")
    finally:
        connection.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html_file", type=Path)
    parser.add_argument("--db-path", type=Path, default=Path("tutorial.db"))
    parser.add_argument("--report-name", default="Homepage Checks")
    args = parser.parse_args()

    report_id = store_report(args.html_file, args.db_path, args.report_name)
    print_stored_summary(args.db_path, report_id)


if __name__ == "__main__":
    main()
