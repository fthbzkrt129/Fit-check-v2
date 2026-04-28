---
title: Wiki Update Rules
type: runbook
status: active
created: 2026-04-11
updated: 2026-04-11
source_count: 2
tags:
  - runbook
  - wiki
  - memory
  - wrap-up
---

# Wiki Update Rules

The second brain is an operational memory layer, not a loose note dump.

## Core Rules

- Read the wiki first, then source pages, then raw files only if needed.
- Every meaningful ingest, query, lint, schema update, or wrap-up must update `[[log]]`.
- Every active wiki page should remain discoverable from `[[index]]`.
- `[[overview]]` should only change when the long-lived operating picture changes materially.
- Raw files are immutable after durable placement.

## Wrap-Up Rules

When a session is closed with wrap-up intent:

1. Audit current changes with git.
2. Run repo-aware quality checks.
3. Write a raw wrap-up markdown file under `second-brain/raw/wrap-ups/`.
4. Write a companion source page under `second-brain/wiki/sources/`.
5. Update related project/runbook pages if process knowledge changed.
6. Update `[[index]]`, `[[overview]]`, and `[[log]]`.
7. Add the raw wrap-up file to NotebookLM notebook `Virtualize`, or log the failure explicitly.

## Session Attribution

- Distinguish `Bu oturumda degistirilen dosyalar` from unrelated existing worktree changes.
- Do not claim authorship of unrelated dirty files.
- Generated output such as `.next/` should only be called out as authored work if it was intentionally part of the session outcome.

## Quality Scope

- Root package: `package.json`
- Web app package: `apps/web/package.json`

Report script presence and results separately for each package.

## Example Session

- [[session-2026-04-11-wrap-up-pipeline-bootstrap-wrapup]]

## Related Pages

- [[agents-and-memory-strategy]]
- [[overview]]
- [[log]]
