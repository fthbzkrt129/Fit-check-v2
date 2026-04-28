# Wrap-Up Pipeline Setup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Sekronet-style wrap-up pipeline to Virtulize with mandatory NotebookLM handoff to the `Virtualize` notebook.

**Architecture:** Extend `second-brain/` with wrap-up-specific raw/wiki/runbook/project memory files, add wrap-up workflow rules into schema, and define a local orchestrator document under `.agent/agents/`. The implementation records wrap-up sessions as dual artifacts: raw session record plus wiki source page, with `index`, `overview`, `log`, and NotebookLM integration updated as part of the same flow.

**Tech Stack:** Markdown, git-aware session audit, npm scripts, NotebookLM MCP, Obsidian-compatible wikilinks

---

## Chunk 1: Extend Memory Structure

### Task 1: Add required wrap-up directories

**Files:**
- Create: `second-brain/raw/wrap-ups/.gitkeep`
- Create: `second-brain/wiki/project/.gitkeep`
- Create: `second-brain/wiki/runbooks/.gitkeep`

- [ ] Step 1: Create the wrap-up raw folder and the missing wiki memory folders.
- [ ] Step 2: Verify the folder structure matches the wrap-up spec.

### Task 2: Seed project/runbook memory pages

**Files:**
- Create: `second-brain/wiki/project/agents-and-memory-strategy.md`
- Create: `second-brain/wiki/runbooks/wiki-update-rules.md`

- [ ] Step 1: Create a project page that explains the memory layer strategy and includes wrap-up as an official workflow.
- [ ] Step 2: Create a runbook page that documents how wrap-up updates raw, wiki, log, overview, and NotebookLM.
- [ ] Step 3: Cross-link both pages from each other where useful.

## Chunk 2: Add Wrap-Up Workflow To Schema

### Task 3: Extend `second-brain/schema/CLAUDE.md`

**Files:**
- Modify: `second-brain/schema/CLAUDE.md`

- [ ] Step 1: Add `wrap-up` as an explicit operation type and session-close trigger workflow.
- [ ] Step 2: Add raw wrap-up and wiki source naming conventions.
- [ ] Step 3: Add the required wrap-up sections: session summary, changes audit, quality check, skills/tools, learnings, next context, blockers.
- [ ] Step 4: Add session-attribution rules so unrelated dirty worktree changes are not misattributed.
- [ ] Step 5: Add repo-specific quality scope for both root `package.json` and `apps/web/package.json`.
- [ ] Step 6: Add mandatory NotebookLM handoff rules for notebook `Virtualize` (`ae930df0-0cc0-4899-8843-963bee33fcf3`).

### Task 4: Extend `second-brain/schema/AGENTS.md`

**Files:**
- Modify: `second-brain/schema/AGENTS.md`

- [ ] Step 1: Add a concise wrap-up trigger list.
- [ ] Step 2: Add the wrap-up execution order.
- [ ] Step 3: Add the mandatory NotebookLM add-source step and failure logging rule.

## Chunk 3: Add Local Orchestrator Definition

### Task 5: Create local wrap-up orchestrator file

**Files:**
- Create: `.agent/agents/virtulize-wrap-up-orchestrator.md`

- [ ] Step 1: Create the agent file with role, triggers, sequence, outputs, and guardrails.
- [ ] Step 2: Include the NotebookLM notebook name and id.
- [ ] Step 3: Include root/app quality-check behavior and session attribution rules.

## Chunk 4: Create A Real Wrap-Up Example

### Task 6: Create the first raw wrap-up artifact

**Files:**
- Create: `second-brain/raw/wrap-ups/wrap-up-2026-04-11-wrap-up-pipeline-bootstrap.md`

- [ ] Step 1: Write a real raw wrap-up document for this implementation session.
- [ ] Step 2: Include all required sections from the spec.
- [ ] Step 3: Run and record `git status` and `git diff --stat` in the changes audit section.
- [ ] Step 4: Record quality results separately for root and `apps/web`.
- [ ] Step 5: Explicitly record missing scripts as `not available` instead of implying pass.
- [ ] Step 6: Record NotebookLM success or blocker status explicitly.

### Task 7: Create the companion wiki source page

**Files:**
- Create: `second-brain/wiki/sources/session-2026-04-11-wrap-up-pipeline-bootstrap-wrapup.md`

- [ ] Step 1: Create the wiki source page that summarizes the wrap-up session.
- [ ] Step 2: Include a concise used skills/tools summary in the wiki source page.
- [ ] Step 3: Link the raw wrap-up file and related project/runbook/schema pages.
- [ ] Step 4: Capture quality notes and blockers in concise wiki form.

## Chunk 5: Update Navigation And Durable Memory

### Task 8: Update index, overview, and log

**Files:**
- Modify: `second-brain/wiki/index.md`
- Modify: `second-brain/wiki/overview.md`
- Modify: `second-brain/wiki/log.md`

- [ ] Step 1: Add entries for the new runbook, project page, and wrap-up source page to `index.md`.
- [ ] Step 2: Update `overview.md` to mention the new wrap-up pipeline and NotebookLM-backed session memory flow.
- [ ] Step 3: Add a `wrap-up` operation type to `log.md` and append a session entry for the bootstrap wrap-up.

### Task 9: Update durable memory pages with the new workflow

**Files:**
- Modify: `second-brain/wiki/project/agents-and-memory-strategy.md`
- Modify: `second-brain/wiki/runbooks/wiki-update-rules.md`

- [ ] Step 1: Record the wrap-up pipeline as an official memory-maintenance workflow.
- [ ] Step 2: Link to the first wrap-up source page as a concrete example.

## Chunk 6: NotebookLM Handoff And Verification

### Task 10: Upload the raw wrap-up file to NotebookLM

**Files:**
- Verify: `second-brain/raw/wrap-ups/wrap-up-2026-04-11-wrap-up-pipeline-bootstrap.md`

- [ ] Step 1: Add the raw wrap-up markdown file to notebook `Virtualize` using NotebookLM source-add.
- [ ] Step 2: If upload succeeds, record the notebook handoff in the raw wrap-up and log.
- [ ] Step 3: If upload fails, record the failure and retry context in the raw wrap-up and log instead of silently skipping.

### Task 11: Verify end-to-end wrap-up completeness

**Files:**
- Verify: `second-brain/schema/CLAUDE.md`
- Verify: `second-brain/schema/AGENTS.md`
- Verify: `.agent/agents/virtulize-wrap-up-orchestrator.md`
- Verify: `second-brain/raw/wrap-ups/wrap-up-2026-04-11-wrap-up-pipeline-bootstrap.md`
- Verify: `second-brain/wiki/sources/session-2026-04-11-wrap-up-pipeline-bootstrap-wrapup.md`
- Verify: `second-brain/wiki/index.md`
- Verify: `second-brain/wiki/overview.md`
- Verify: `second-brain/wiki/log.md`

- [ ] Step 1: Confirm the wrap-up workflow exists in both schema files.
- [ ] Step 2: Confirm the runbook and project pages are indexed.
- [ ] Step 3: Confirm the raw and wiki wrap-up files cross-reference each other and related pages.
- [ ] Step 4: Confirm `log.md` contains a `wrap-up` entry.
- [ ] Step 5: Confirm NotebookLM handoff status is recorded explicitly.
