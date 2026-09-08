-- schema.sql
--
-- Four tables, one for each "layer" of a test report, matching the
-- shape we already decided on in Chapter 2 (TestCase -> Step -> Attachment).
--
-- The planning question we asked before writing a single line of this:
-- "what different KINDS of data do we actually need to store?"
--   - plain short text            (names, statuses)
--   - long free text              (failure messages, stack traces)
--   - small structured text       (a CSV table, an HTML snippet)
--   - raw binary bytes            (a PNG screenshot)
-- SQLite only really has a handful of storage types (TEXT, INTEGER,
-- REAL, BLOB), so the job of "planning a schema" is really just
-- deciding which of those four boxes each piece of data belongs in,
-- and how the tables relate to each other.

PRAGMA foreign_keys = ON;

-- One row per test run (one row per time you ran your test suite).
-- All FOUR real outcomes get their own count column - passed/failed
-- only would silently hide any broken or skipped tests from every
-- summary built on top of this table.
CREATE TABLE IF NOT EXISTS reports (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    report_name    TEXT NOT NULL,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    passed_count   INTEGER NOT NULL DEFAULT 0,
    failed_count   INTEGER NOT NULL DEFAULT 0,
    broken_count   INTEGER NOT NULL DEFAULT 0,
    skipped_count  INTEGER NOT NULL DEFAULT 0
);

-- One row per test case (per Gherkin Scenario), belonging to one report.
CREATE TABLE IF NOT EXISTS test_cases (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id        INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    status           TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'broken', 'skipped', 'unknown')),
    failure_message  TEXT,               -- long free text, NULL when the test passed
    failure_trace    TEXT                -- long free text, NULL when the test passed
);

-- One row per step inside a test case, in order.
CREATE TABLE IF NOT EXISTS test_steps (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    test_case_id  INTEGER NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
    step_order    INTEGER NOT NULL,   -- 0, 1, 2... so we can show steps in the right order
    name          TEXT NOT NULL,
    status        TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'broken', 'skipped', 'unknown'))
);

-- One row per attachment belonging to one step. This is the table
-- where the "different kinds of data" question actually shows up:
-- text-shaped evidence goes in `text_content`, binary-shaped evidence
-- (like a screenshot) goes in `binary_content`. Exactly one of the two
-- is ever filled in for a given row - never both, never neither.
CREATE TABLE IF NOT EXISTS attachments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    step_id         INTEGER NOT NULL REFERENCES test_steps(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    text_content    TEXT,     -- used for text/plain, text/html, text/csv
    binary_content  BLOB      -- used for image/png and anything else non-text
);

-- Indexes: the two questions we'll ask this database constantly are
-- "give me every test case for report X" and "give me every step for
-- test case Y" - so those are the two lookups we speed up.
CREATE INDEX IF NOT EXISTS idx_test_cases_report_id ON test_cases(report_id);
CREATE INDEX IF NOT EXISTS idx_test_steps_test_case_id ON test_steps(test_case_id);
CREATE INDEX IF NOT EXISTS idx_attachments_step_id ON attachments(step_id);
