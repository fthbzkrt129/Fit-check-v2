# LLM Wiki Second Brain Setup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a complete markdown-first personal second brain inside this repository with schema files, core wiki structure, and one working ingest example.

**Architecture:** Add a dedicated `second-brain/` directory with strict separation between immutable raw sources, LLM-owned wiki pages, and schema instructions. Initialize the knowledge base with navigation files and one example ingest that updates multiple wiki surfaces.

**Tech Stack:** Markdown, repository file structure, Obsidian-compatible wikilinks, existing git repo

---

## Chunk 1: Create The Second Brain Skeleton

### Task 1: Create the directory structure

**Files:**
- Create: `second-brain/raw/inbox/.gitkeep`
- Create: `second-brain/raw/journal/.gitkeep`
- Create: `second-brain/raw/clips/.gitkeep`
- Create: `second-brain/raw/pdfs/.gitkeep`
- Create: `second-brain/raw/assets/.gitkeep`
- Create: `second-brain/wiki/entities/.gitkeep`
- Create: `second-brain/wiki/concepts/.gitkeep`
- Create: `second-brain/wiki/themes/.gitkeep`
- Create: `second-brain/wiki/sources/.gitkeep`
- Create: `second-brain/wiki/analyses/.gitkeep`
- Create: `second-brain/wiki/maps/.gitkeep`
- Create: `second-brain/schema/.gitkeep`

- [ ] Step 1: Create each empty directory marker file listed above.
- [ ] Step 2: Verify the tree exists and matches the approved design.

### Task 2: Create the top-level wiki files

**Files:**
- Create: `second-brain/wiki/index.md`
- Create: `second-brain/wiki/log.md`
- Create: `second-brain/wiki/overview.md`

- [ ] Step 1: Create `index.md` with section headings for overview, sources, entities, concepts, themes, analyses, and maps, plus starter entries for every active wiki page that exists at initialization time.
- [ ] Step 2: Create `log.md` with a short purpose statement and parseable entry format examples.
- [ ] Step 3: Create `overview.md` with current domains, most developed themes, major open questions, recent high-level changes, and a note that the wiki is newly initialized.
- [ ] Step 4: Read the three files to confirm cross-links and headings are consistent.

## Chunk 2: Write The Operating Schema

### Task 3: Create the detailed policy manual

**Files:**
- Create: `second-brain/schema/CLAUDE.md`

- [ ] Step 1: Write the mission and ownership model for `raw/`, `wiki/`, and `schema/`.
- [ ] Step 2: Write the required startup routine for future sessions, including which files to read first.
- [ ] Step 3: Write the page taxonomy and folder conventions for all raw and wiki subdirectories.
- [ ] Step 4: Write the ingest workflow, including inbox classification, source page creation, canonical page rules, contradiction handling, and `index.md`/`log.md`/`overview.md` update rules.
- [ ] Step 5: Write the query workflow, including wiki-first retrieval, inline citation rules, how uncertainty or missing information must be represented, and when valuable answers must be saved to `wiki/analyses/` and logged as `query` events.
- [ ] Step 6: Write the lint workflow, including orphan-page, stale-claim, contradiction, missing-page, missing cross-reference, weak index coverage, repeated-concept, and source-gap checks, plus rules for logging lint results and saving important lint outputs as analysis or map pages.
- [ ] Step 7: Write page conventions for frontmatter, wikilinks, naming, rename/merge behavior, deprecation behavior, and non-markdown source handling.

### Task 4: Create the concise agent bootstrap guide

**Files:**
- Create: `second-brain/schema/AGENTS.md`

- [ ] Step 1: Write a short mission statement for the second brain.
- [ ] Step 2: Write a startup checklist covering `overview.md`, `index.md`, recent `log.md` entries, and any directly relevant pages.
- [ ] Step 3: Write the default operation order for `ingest`, `query`, `lint`, and `schema` updates.
- [ ] Step 4: Explicitly state what the agent must never modify.
- [ ] Step 5: Add logging requirements after every operation.

## Chunk 3: Seed The Wiki With A First Ingest Example

### Task 5: Add one raw source for the demo ingest

**Files:**
- Create: `second-brain/raw/journal/2026-04-11-morning-focus-note.md`

- [ ] Step 1: Write a short but realistic personal journal entry about focus, energy, distraction, and time-of-day patterns.
- [ ] Step 2: Ensure the note contains enough material to drive at least one concept page and one theme or entity update.

### Task 6: Materialize the ingest outputs

**Files:**
- Create: `second-brain/wiki/sources/2026-04-11-morning-focus-note.md`
- Create: `second-brain/wiki/concepts/deep-work.md`
- Create: `second-brain/wiki/themes/energy-and-consistency.md`
- Modify: `second-brain/wiki/index.md`
- Modify: `second-brain/wiki/overview.md`
- Modify: `second-brain/wiki/log.md`

- [ ] Step 1: Create the source page with metadata, abstract, key claims, notable entities, notable concepts, open questions, tensions or contradictions, and impacted pages.
- [ ] Step 2: Create `deep-work.md` as the first concept page and cite the source page with wikilinks.
- [ ] Step 3: Create `energy-and-consistency.md` as the first theme page and cite the source page with wikilinks.
- [ ] Step 4: Update `index.md` so the new source, concept, and theme appear in their sections with one-line descriptions.
- [ ] Step 5: Update `overview.md` to reflect the newly seeded domains, most developed themes, active questions, and recent high-level changes.
- [ ] Step 6: Append schema initialization and ingest entries to `log.md` using the approved header format.

## Chunk 4: Verification

### Task 7: Verify file completeness and link coherence

**Files:**
- Verify: `second-brain/`
- Verify: `second-brain/schema/CLAUDE.md`
- Verify: `second-brain/schema/AGENTS.md`
- Verify: `second-brain/wiki/index.md`
- Verify: `second-brain/wiki/log.md`
- Verify: `second-brain/wiki/overview.md`
- Verify: `second-brain/wiki/sources/2026-04-11-morning-focus-note.md`
- Verify: `second-brain/wiki/concepts/deep-work.md`
- Verify: `second-brain/wiki/themes/energy-and-consistency.md`

- [ ] Step 1: Read the created files and verify the ownership model is consistent everywhere.
- [ ] Step 2: Verify every new wiki page is reachable from `index.md` or `overview.md`.
- [ ] Step 3: Verify `log.md` contains at least one `schema` entry and one `ingest` entry.
- [ ] Step 4: Verify the first ingest demonstrates a source page plus cross-page updates, not a one-file summary.
