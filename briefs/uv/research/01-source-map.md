# uv documentation — crawl inventory

Source root: https://docs.astral.sh/uv/  · crawled 2026-08-21 · sitemap.xml enumerated 85 pages.

Every fact used in this course must trace to a URL in this file (CLAUDE.md LAW 3).
Marked `[read]` once fetched in depth; `[skim]` = title/role known, not needed for a
beginner course; `[skip]` = out of scope, recorded so nobody thinks it was missed.

## Getting started
- [read] /getting-started/installation/ — every install method, verbatim commands
- [read] /getting-started/first-steps/ — thin; just "run uv"
- [read] /getting-started/features/ — THE COMMAND CENSUS. Every command grouped.
- [skim] /getting-started/help/

## Guides (the task-shaped layer — maps closely to chapters)
- [read] /guides/install-python/
- [read] /guides/scripts/
- [read] /guides/tools/
- [read] /guides/projects/
- [ ]    /guides/package/ — publishing
- [read] /guides/migration/pip-to-project/
- [skip] /guides/integration/* (17 pages: docker, github, gitlab, jupyter, marimo,
         pytorch, fastapi, bazel, pre-commit, aws-lambda, aws, azure, google, jfrog,
         coiled, renovate, dependabot) — CI/deployment, wrong audience for a beginner
         course. Candidate for a later standalone episode, not this one.

## Concepts (the WHY layer — where beginner explanations live)
- [read] /concepts/projects/layout/ — pyproject.toml, .venv, uv.lock, .python-version
- [ ]    /concepts/projects/init/
- [read] /concepts/projects/dependencies/ — LARGE. groups, extras, sources, markers
- [ ]    /concepts/projects/run/
- [read] /concepts/projects/sync/ — locking vs syncing, --locked/--frozen/--no-sync
- [ ]    /concepts/projects/config/
- [ ]    /concepts/projects/build/
- [ ]    /concepts/projects/export/
- [skip] /concepts/projects/workspaces/ — monorepo; too advanced
- [read] /concepts/tools/ — ephemeral vs persistent, tool dir, PATH
- [read] /concepts/python-versions/ — managed vs system, discovery order
- [ ]    /concepts/configuration-files/
- [ ]    /concepts/indexes/
- [read] /concepts/resolution/ — resolver, strategies, universal vs platform, markers
- [ ]    /concepts/build-backend/
- [read] /concepts/cache/ — what's cached, invalidation, cache commands
- [skip] /concepts/authentication/* (6 pages) — private indexes; out of scope
- [skip] /concepts/preview/

## The pip interface
- [ ]    /pip/ — index
- [read] /pip/environments/ — WHAT A VENV IS. Activation per shell. Discovery order.
- [ ]    /pip/packages/
- [read] /pip/compile/ — uv pip compile / sync, the pip-tools replacement
- [ ]    /pip/inspection/
- [ ]    /pip/dependencies/
- [ ]    /pip/compatibility/ — deliberate divergences from pip

## Reference
- [read] /reference/benchmarks/ — ⚠ NO NUMBERS ON THIS PAGE. Only a pointer to
         github.com/astral-sh/uv/blob/main/BENCHMARKS.md. Do not quote figures from
         memory; the only on-site claim is the homepage's "10-100x faster".
- [ ]    /reference/environment/ — env vars
- [skim] /reference/cli/ — the full command reference; consult per command
- [skim] /reference/settings/
- [skip] /reference/internals/*, /reference/policies/*, /reference/contributing/
- [ ]    /reference/troubleshooting/ — candidate material for a "when it breaks" chapter
