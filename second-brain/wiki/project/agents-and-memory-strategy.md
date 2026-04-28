---
title: Agents And Memory Strategy
type: project
status: active
created: 2026-04-11
updated: 2026-04-11
source_count: 2
tags:
  - project
  - agents
  - memory
  - wrap-up
---

# Agents And Memory Strategy

This page tracks how `Virtulize` turns session work into durable project memory.

## Current Strategy

- `second-brain/schema/CLAUDE.md` defines the full memory contract.
- `second-brain/schema/AGENTS.md` defines the short execution guide.
- `second-brain/wiki/` is the durable synthesis layer.
- `second-brain/raw/` stores immutable source material, including wrap-up records.
- Session closing now follows a formal wrap-up pipeline instead of relying on chat history alone.

## Wrap-Up Pipeline

The wrap-up pipeline creates two persistent artifacts for each meaningful session close:

- a raw record in `second-brain/raw/wrap-ups/`
- a companion source page in `second-brain/wiki/sources/`

The flow also updates `[[overview]]`, `[[index]]`, and `[[log]]`, and uploads the raw wrap-up source to the NotebookLM notebook `Virtualize` when possible.

## NotebookLM Integration

- Notebook: `Virtualize`
- Notebook ID: `ae930df0-0cc0-4899-8843-963bee33fcf3`
- Wrap-up completion requires either successful upload or an explicit logged blocker.

## Example Session

- [[session-2026-04-11-wrap-up-pipeline-bootstrap-wrapup]]

## Related Pages

- [[wiki-update-rules]]
- [[overview]]
- [[log]]
