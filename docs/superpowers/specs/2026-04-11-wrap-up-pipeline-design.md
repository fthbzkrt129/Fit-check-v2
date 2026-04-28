# Virtulize Wrap-Up Pipeline Design

## Goal

Add a persistent wrap-up pipeline to this repository that mirrors the operational behavior used in `Sekronet`: every meaningful session close should produce a raw wrap-up record, a durable wiki source page, index/log/overview updates, and a mandatory NotebookLM handoff.

## Why This Exists

The current `second-brain/` setup supports ingest, query, and lint, but it does not yet have a formal session-closing ritual. That means important learnings, quality check results, blockers, and next-session context can remain trapped in chat history.

The wrap-up pipeline fixes that by turning each meaningful session close into a structured memory event.

## Source Pattern To Replicate

From `Sekronet`, the relevant pattern is not a single markdown template. It is a compound workflow:

1. A session-close event creates a raw wrap-up markdown file.
2. A companion wiki source page summarizes the wrap-up for the knowledge layer.
3. The wiki index, overview, and log are updated.
4. Related runbook, project, or research pages may be updated when the session changes operating knowledge.
5. External memory handoff may be attempted as part of the closing flow.

For `Virtulize`, the same pattern should be adopted.

## Required Scope

This first implementation must include:

- a formal `wrap-up` workflow in `second-brain/schema/CLAUDE.md`
- a shorter operator-facing `wrap-up` workflow in `second-brain/schema/AGENTS.md`
- a runbook page documenting the wiki update rules for wrap-up
- a project page documenting the wrap-up pipeline as part of memory strategy
- a raw wrap-up naming convention
- a wiki wrap-up source naming convention
- `index.md`, `log.md`, and `overview.md` updates
- mandatory NotebookLM integration using the notebook named `Virtualize`

## NotebookLM Requirement

NotebookLM integration is mandatory in phase 1.

The system must target the notebook:

- Notebook title: `Virtualize`
- Notebook ID: `ae930df0-0cc0-4899-8843-963bee33fcf3`

Wrap-up is considered fully complete only if one of the following is recorded:

1. the wrap-up raw markdown was added to the `Virtualize` notebook successfully, or
2. the attempt failed and the failure was explicitly logged as a blocker with enough detail for retry.

## Directory Additions

The current `second-brain/wiki/` layout should be extended with these directories:

```text
second-brain/wiki/
  project/
  runbooks/
```

These are needed to mirror the durable operational memory pattern used in `Sekronet`.

## Wrap-Up Trigger Rules

The pipeline should trigger when the user says or clearly implies:

- `wrap up`
- `wrap-up`
- `done for now`
- `finish coding`
- `bugunluk kapat`
- `oturumu kapat`
- other direct session-closing intent

## Wrap-Up Workflow

When wrap-up is triggered, the agent should perform this sequence:

1. Audit current changes and touched files.
2. Run quality checks relevant to the repo.
3. Summarize what changed.
4. Capture learnings in a reusable format.
5. Capture next-session context and blockers.
6. Write a raw wrap-up file under `second-brain/raw/`.
7. Write a corresponding source page under `second-brain/wiki/sources/`.
8. Update related runbook or project pages when the session changed process knowledge.
9. Update `second-brain/wiki/index.md`.
10. Update `second-brain/wiki/overview.md` when the operating memory changed materially.
11. Append a `wrap-up`-style `log` event using the existing `schema` or `query`/`ingest`-compatible logging pattern.
12. Add the raw wrap-up file to the NotebookLM notebook `Virtualize`, or log the failure explicitly.

## Session Attribution Rules

Wrap-up must distinguish between this session's work and unrelated dirty-worktree changes.

Default attribution rules:

1. `Changes Audit` must report the full current worktree state using git.
2. `Session-touched files` should include files that the agent modified in the current session.
3. `Related existing changes` may be mentioned separately if they affect the same area but were not created by the current session.
4. The raw wrap-up must not imply authorship of unrelated changes.

Recommended raw-wrap-up wording:

- `Bu oturumda degistirilen dosyalar`
- `Ilgili ama bu oturumda baslatilmamis mevcut degisiklikler`

If attribution is uncertain, the wrap-up must say so explicitly.

## Raw Wrap-Up File Contract

Raw wrap-up files should live under:

- `second-brain/raw/wrap-ups/`

Filename convention:

- `wrap-up-YYYY-MM-DD-<slug>.md`

Required sections:

- `Oturum Ozeti`
- `Changes Audit`
- `Quality Check`
- `Skills ve Tool Kullanimi`
- `Learning Capture`
- `Next Session Context`
- `Blocker / Risk`

## Wiki Source Page Contract

Wrap-up source pages should live under:

- `second-brain/wiki/sources/`

Filename convention:

- `session-YYYY-MM-DD-<slug>-wrapup.md`

Required content:

- a short session-level synthesis
- core changes
- quality and blocker summary
- used skills/tools summary
- links to related wiki pages
- link or reference to the raw wrap-up file

## Related Memory Pages

If the session changed how the project is operated, the wrap-up flow should update:

- `second-brain/wiki/runbooks/` for repeatable operational guidance
- `second-brain/wiki/project/` for durable strategy, process, or architecture memory

This is especially important when the session introduced a new workflow, tool chain, or agent routing pattern.

## Agent / Orchestrator Layer

To approximate the `Sekronet` behavior more closely, this repo should also add a local agent definition layer:

```text
.agent/agents/
  virtulize-wrap-up-orchestrator.md
```

This file should describe the wrap-up flow, quality checks, notebook handoff, and wiki update order. It does not need to be fully executable by an external harness on day one, but it should capture the pipeline contract in a reusable form.

## Quality Check Rules

Wrap-up quality checks should be repo-aware:

- run `git status`
- run `git diff --stat`
- run root-level checks for the root `package.json`
- run app-level checks for `apps/web/package.json`
- report root and app results separately
- run `npm run build` only where the script exists
- run `npm run test` only where the script exists
- run `npm run lint` only where the script exists
- run `npm run typecheck` only where the script exists

Missing scripts are not silent passes. They should be recorded explicitly.

### Repo-Specific Quality Scope

For `Virtulize`, quality checks should use this order:

1. Root package at `package.json`
2. Web app package at `apps/web/package.json`

Expected handling:

- If both exist, both are evaluated and reported separately.
- If a script exists at root but not under `apps/web`, note the app-level script as missing.
- If a script exists under `apps/web` but not at root, note the root-level script as missing.
- If a package path is present but generated output such as `.next/` is dirty, the wrap-up should not mistake generated files for meaningful authored changes unless they were intentionally part of the session.

## Logging Rules

The log must record wrap-up completion with:

- date
- title/slug
- touched pages
- whether NotebookLM upload succeeded or failed

Because the current second-brain log schema already uses typed operations, the design may either:

1. add `wrap-up` as an explicit operation type, or
2. log wrap-up under `schema` or `query` while clearly labeling it as wrap-up content.

Recommended: add `wrap-up` as an explicit operation type for clarity.

## Overview Update Rules

`second-brain/wiki/overview.md` should be updated during wrap-up only when the session changed the long-lived operating state of the project or the memory system.

Examples:

- new workflow introduced
- new agent layer added
- new quality gate adopted
- new recurring blocker discovered

## Recommendation

Implement the `Sekronet` pattern as a `Virtulize`-adapted clone:

- same raw + wiki source dual record
- same quality/learning/next-context structure
- same memory-page update behavior
- same session-closing intent trigger
- mandatory NotebookLM handoff to `Virtualize`

The main adaptation is that `Virtulize` will use `second-brain/` as its memory root rather than the flatter `Sekronet` vault layout.
