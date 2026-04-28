# LLM Wiki Personal Second Brain Design

## Goal

Set up a persistent, LLM-maintained personal knowledge base inside this repository that follows the LLM Wiki pattern: immutable raw sources, an LLM-owned markdown wiki, and schema files that define how ingest, query, and lint workflows operate.

The system should optimize for long-term accumulation rather than query-time rediscovery. Each new source should be integrated into the wiki so the knowledge base compounds over time.

## Scope

This first version targets a general personal second brain and must support these source types from day one:

- Markdown notes
- Journal entries
- Web clips
- PDFs
- Images and downloaded attachments

The first version will be markdown-first. It will define clear storage conventions for non-markdown assets, but the wiki itself remains plain markdown so it works well with Obsidian and git.

## Recommended Architecture

Use a layered wiki architecture under a dedicated `second-brain/` directory.

There are three ownership boundaries:

1. `raw/`
   Contains immutable source material. The agent can read from this layer but must not modify, rewrite, or normalize source content after it has been added.

2. `wiki/`
   Contains all synthesized knowledge artifacts. This layer is fully LLM-owned. The agent creates and updates summaries, entity pages, concept pages, maps, analyses, and maintenance files here.

3. `schema/`
   Contains the operational contract for the agent. This defines structure, naming, ingest behavior, query behavior, logging rules, and lint rules.

This architecture preserves the source of truth while allowing the wiki layer to evolve aggressively and continuously.

## Folder Structure

```text
second-brain/
  raw/
    inbox/
    journal/
    clips/
    pdfs/
    assets/
  wiki/
    index.md
    log.md
    overview.md
    entities/
    concepts/
    themes/
    sources/
    analyses/
    maps/
  schema/
    CLAUDE.md
    AGENTS.md
```

### Directory Roles

- `raw/inbox/`: unsorted new source drops before or during ingest
- `raw/journal/`: personal journal entries and reflections
- `raw/clips/`: clipped web articles in markdown form
- `raw/pdfs/`: PDF source files
- `raw/assets/`: local image attachments and referenced media
- `wiki/index.md`: content-oriented catalog of the wiki
- `wiki/log.md`: chronological append-only operational log
- `wiki/overview.md`: top-level orientation page for the whole second brain
- `wiki/entities/`: pages about stable named things such as people, places, tools, projects, habits, symptoms, goals
- `wiki/concepts/`: pages about reusable ideas and abstractions
- `wiki/themes/`: pages that synthesize recurring threads across many sources
- `wiki/sources/`: one canonical summary page per ingested source
- `wiki/analyses/`: durable query outputs worth preserving
- `wiki/maps/`: navigation pages, hub pages, and cross-domain overview maps
- `schema/`: agent operating instructions for all future sessions

## Schema File Responsibilities

Both schema files must exist, but they serve different purposes.

### `schema/CLAUDE.md`

This is the full operating contract for any LLM session acting as the wiki maintainer. It should define:

- ownership model for `raw/`, `wiki/`, and `schema/`
- page taxonomy and folder conventions
- ingest workflow
- query workflow
- lint workflow
- update rules for `index.md`, `log.md`, and `overview.md`
- citation format
- rules for contradictions, uncertainty, and missing information
- page creation, rename, merge, and deprecation behavior

### `schema/AGENTS.md`

This is the shorter operator-facing entry file for agent bootstrapping. It should define:

- the mission of the second brain
- required startup checklist for each session
- the default order of operations
- which files to read first before acting
- what must never be modified
- how to log changes after each operation

Rule of thumb: `CLAUDE.md` is the detailed policy manual, `AGENTS.md` is the concise execution guide.

## Page Model

Wiki pages should be lightweight, link-dense markdown files with minimal YAML frontmatter.

Recommended frontmatter fields:

- `title`
- `type`
- `status`
- `created`
- `updated`
- `source_count`
- `tags`

Not every page needs every field, but the schema should standardize the common set so Dataview and future tools can use it.

## Core Wiki Page Types

### Source Page

Each ingested raw source gets one canonical summary page under `wiki/sources/`.

A source page should include:

- source metadata
- short abstract
- key claims
- notable entities
- notable concepts
- open questions
- tensions or contradictions with existing wiki content
- links to impacted wiki pages

For non-markdown sources:

- PDF sources should include file path, document type if known, extraction limitations if any, and a note describing whether the synthesis came from full text, partial text, or manual review.
- Image-heavy sources should include the text/image split used during ingest and note which images materially influenced the synthesis.
- Downloaded attachments should be referenced by stable relative path under `raw/assets/`.

### Entity Page

An entity page tracks a stable subject over time. It should consolidate mentions from multiple sources and distinguish between:

- established facts
- active interpretations
- unresolved tensions
- relationships to other pages

### Concept Page

A concept page captures reusable ideas that recur across sources. It should describe the concept, where it appears, how it relates to other concepts, and what evidence supports the current synthesis.

### Theme Page

A theme page is broader and longitudinal. It is useful when multiple entries point to a recurring life pattern such as motivation, energy, consistency, identity, avoidance, learning style, or health management.

### Analysis Page

An analysis page is created from a user query when the resulting answer is worth keeping. This turns exploration into durable knowledge.

## Ingest Workflow

Ingest operates source-by-source by default.

For each new source, the agent should:

1. Read the raw source from `raw/`
2. Identify the source type and key metadata
3. Classify the source into its durable raw folder if it arrived via `raw/inbox/`
4. Create or update the corresponding source summary page in `wiki/sources/`
5. Identify affected entities, concepts, and themes
6. Update those pages with new evidence, clarifications, and contradictions
7. Update `wiki/index.md`
8. Update `wiki/overview.md` if the source materially changes top-level understanding
9. Append an entry to `wiki/log.md`

### Inbox Classification Rule

`raw/inbox/` is a temporary landing zone for newly added materials. During ingest, the agent should classify the source into exactly one primary raw folder:

- journal-like reflections go to `raw/journal/`
- clipped web markdown goes to `raw/clips/`
- PDF files go to `raw/pdfs/`
- standalone images and attachments go to `raw/assets/`
- uncategorized markdown notes may remain in `raw/inbox/` until the user defines a better home

The source content itself must not be rewritten. Classification may move the file, but once placed in its durable location it becomes immutable.

### Canonical Page Decision Rules

When deciding whether to create or update an entity, concept, or theme page:

- update an existing page if the subject clearly matches an existing canonical page
- create a new page if the subject is referenced repeatedly, is central to the source, or is likely to recur
- do not create one-off stub pages for weak mentions
- if a subject has multiple names, keep one canonical filename and record aliases in frontmatter or an aliases section
- if two pages are discovered to represent the same subject, merge into the stronger canonical page and leave a short redirect note or alias reference where useful
- avoid renaming canonical pages unless the current name is clearly wrong or unstable

Important rule: contradictions are not silently flattened. If a new source conflicts with an older synthesis, the wiki should preserve the conflict explicitly and mark the tension.

## Query Workflow

The agent should answer questions against the wiki first, not the raw corpus first.

Default sequence:

1. Read `wiki/index.md`
2. Identify the most relevant pages
3. Read only those wiki pages and, when needed, drill into the linked source pages
4. Synthesize an answer with inline page citations
5. If the answer creates durable value, save it to `wiki/analyses/` and log it in `wiki/log.md`

This keeps the wiki as the primary working memory layer.

### Citation Format

Use Obsidian-friendly inline citations pointing to wiki pages.

Default format:

```md
... claim or synthesis ([[concept-page]], [[source-page]])
```

When a section-level pointer is useful, add a short textual locator in prose after the page link rather than inventing a fragile anchor scheme.

## Lint Workflow

The agent should support periodic health checks of the second brain.

Lint passes should look for:

- orphan pages with weak or no inbound links
- important concepts mentioned repeatedly without dedicated pages
- stale claims that newer sources appear to supersede
- contradictions that have not been summarized clearly
- missing cross-references
- weak index coverage
- gaps that suggest new sources should be collected

Lint results should be logged and, when useful, saved as analysis or map pages.

## Index And Log Conventions

### `wiki/index.md`

This is the navigation layer. It should be organized by page type and list every active wiki page with:

- page link
- one-line description
- optional metadata such as dates or source counts

The index is the first stop for future query sessions.

### `wiki/overview.md`

This is the high-level synthesis page for the whole second brain. It should answer:

- what domains this wiki currently covers
- what the most developed themes are
- what major open questions are still active
- what has changed recently at a high level

It is not a full catalog. It is the orientation page a future session reads to understand the current shape of the knowledge base before diving deeper.

### `wiki/log.md`

This is append-only and chronological.

Each entry should begin with a parseable header in this shape:

```md
## [YYYY-MM-DD] <operation> | <title>
```

Supported operations for v1:

- `ingest`
- `query`
- `lint`
- `schema`

## Naming Conventions

- Use lowercase kebab-case filenames
- Prefer durable nouns over clever titles
- Keep one canonical page per concept/entity when possible
- Use Obsidian wikilinks between wiki pages when stable naming is available

Examples:

- `wiki/sources/2026-04-11-atomic-habits-ch1.md`
- `wiki/entities/james-clear.md`
- `wiki/concepts/identity-based-habits.md`
- `wiki/themes/energy-and-consistency.md`
- `wiki/analyses/2026-04-11-why-mornings-work-better.md`

## Source Handling Rules

- Raw files are immutable after placement
- If metadata must be corrected, do so in the wiki page, not the source file
- Images may be referenced from `raw/assets/`
- Markdown with embedded images should be processed in two phases when needed: read text first, inspect images second

## First Ingest Example

For the first live ingest, use a single personal journal or clipped markdown article.

Expected outputs:

- one new source page under `wiki/sources/`
- updates to at least one entity or concept page if applicable
- `wiki/index.md` updated
- `wiki/log.md` appended

This example should demonstrate that a single ingest can update multiple wiki surfaces rather than producing a one-off summary.

## Testing And Verification

This setup is content-structure oriented rather than application-runtime oriented, so verification for the initial implementation is file-based.

The initial setup is successful if:

- all core directories exist
- both schema files exist and define the operating contract
- `index.md`, `log.md`, and `overview.md` exist
- the schema clearly distinguishes raw, wiki, and schema ownership
- one concrete ingest example can be executed against the structure

## Non-Goals For V1

- no mandatory search engine integration yet
- no embedding store or RAG infrastructure
- no automatic batch ingestion daemon
- no custom app UI beyond Obsidian-compatible markdown structure

These can be added later once the markdown-first workflow proves useful.

## Recommendation

Implement the layered markdown-first version now, keep the schema strict, and keep the tooling light. This matches the LLM Wiki idea file closely while staying easy to operate inside the current repo and Obsidian-style workflows.
