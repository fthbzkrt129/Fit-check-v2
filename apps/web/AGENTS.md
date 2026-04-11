# LLM Wiki Agent Guide

## Mission

Maintain the `apps/web` part of this repository as a persistent, compounding project memory workflow connected to the second brain.

## Read First

At the start of each session working in `apps/web`, read in this order:

1. `../../second-brain/wiki/overview.md`
2. `../../second-brain/wiki/index.md`
3. recent relevant entries in `../../second-brain/wiki/log.md`
4. directly relevant wiki pages
5. raw source files only when necessary
6. then the relevant files under `apps/web`

## Suggested Skill Usage

- Session baslangicinda once `using-superpowers` kullan.
- Is belirsizse, karar gerekiyorsa veya birden fazla dogru yol varsa erken asamada `sequential-thinking` kullan.
- Yeni feature, davranis degisikligi veya tasarim gerektiren islerde `brainstorming` ile basla.
- Onayli bir tasarim/spec varsa uygulama adimlarini netlestirmek icin `writing-plans` kullan.
- Plan hazirsa ve uygulama cok adimliysa `subagent-driven-development` iyi varsayilandir.
- Bug, test failure veya beklenmeyen davranista `systematic-debugging` kullan.
- Feature veya bugfix implementasyonundan hemen once `test-driven-development` dusun.
- Session kapanisinda `wrap-up` kullan.
- Guncel framework, Next.js, React, Supabase veya SDK dokumani gerekiyorsa `context7` kullan.
- UI akisi, browser davranisi veya form/sayfa dogrulamasi gerekiyorsa `playwright-mcp` kullan.
- SQL, migration, auth, storage, edge function veya schema islerinde `supabase` MCP kullan.
- Buyuk cikti, cok dosyali analiz veya uzun komut sonucu gerekiyorsa `context-mode` kullan.

## Default Operation Order

### Ingest

1. Classify the raw source if needed
2. Create or update the source page
3. Update affected concept, entity, theme, map, and overview pages
4. Update the index
5. Log the ingest

### Query

1. Search the wiki first
2. Read source pages second
3. Read raw files only if evidence is missing
4. Cite wiki pages inline
5. Save durable answers to `../../second-brain/wiki/analyses/` when useful
6. Log durable query outputs

### Lint

1. Check navigation, contradictions, stale claims, missing pages, and source gaps
2. Save durable lint outputs as analysis or map pages when useful
3. Log the lint pass

### Wrap-Up

1. Trigger on session-close intent such as `wrap up`, `done for now`, or `bugunluk kapat`
2. Audit git state with `git status --short` and `git diff --stat`
3. Run quality checks separately for root `package.json` and `apps/web/package.json`
4. Record missing scripts as `not available`
5. Write raw wrap-up under `../../second-brain/raw/wrap-ups/`
6. Write companion wrap-up source page under `../../second-brain/wiki/sources/`
7. Update affected `project`, `runbooks`, `overview`, `index`, and `log`
8. Upload the raw wrap-up file to NotebookLM notebook `Virtualize` (`ae930df0-0cc0-4899-8843-963bee33fcf3`)
9. If upload fails, log the blocker explicitly

### Schema

Update schema files only when the user explicitly changes the operating model.

## Never Modify

- durable source content in `../../second-brain/raw/`
- log history except by appending new entries
- canonical pages destructively when a merge, redirect, or deprecation note is more appropriate

## Logging Rule

After every meaningful `ingest`, `query`, `lint`, `schema`, or `wrap-up`, append a matching entry to `../../second-brain/wiki/log.md`.

## Working Style

- prefer durable synthesis over one-off summaries
- preserve uncertainty honestly
- record contradictions explicitly
- keep the wiki interlinked and navigable
- use skills as a practical operating guide, not as decorative labels
