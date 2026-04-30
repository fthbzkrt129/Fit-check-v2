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

## Skill Orchestration Flow

### Local Skill Priority

- Once proje-yerel skill'leri tercih et: `apps/web/.agents/skills/`.
- Proje-yerel skill yoksa global skill'lere dus.
- Skill isimleri dekorasyon degildir; uygun tetikleyici varsa once skill'i yukle, sonra aksiyon al.
- Birden fazla skill uyuyorsa once surec skill'i, sonra domain skill'i kullan.
- Surec skill'leri: `brainstorming`, `writing-plans`, `systematic-debugging`, `test-driven-development`, `wrap-up`.
- Domain skill'leri: `next-best-practices`, `nextjs-app-router-patterns`, `nextjs-best-practices`, `nextjs-react-typescript`, `nextjs-supabase-auth`, `react-testing-patterns`, `supabase`, `code-review-and-quality`.

### Intent Router

- `ne yaptik`, `ozetle`, `durum ne`: once mevcut chat/proje durumunu ozetle; kod degistirme.
- `feature ekle`, `davranisi degistir`, `akisi kur`: `brainstorming` -> `writing-plans` -> `test-driven-development` -> implementasyon -> dogrulama.
- `bug var`, `hata var`, `calismiyor`, `neden`: `systematic-debugging` -> gerekirse `sequential-thinking` -> kok neden kaniti -> `test-driven-development` -> minimal fix -> dogrulama.
- `UI`, `tasarim`, `sayfa`, `component`, `responsive`: `brainstorming` -> uygun frontend/design skill -> implementasyon -> `playwright-mcp` ile browser dogrulama.
- `Next.js`, `App Router`, `server action`, `routing`, `metadata`: yerel Next.js skill'i -> gerekirse `context7` -> implementasyon -> `typecheck/build`.
- `React`, `hook`, `state`, `component pattern`: `nextjs-react-typescript` veya ilgili React skill -> gerekirse `react-testing-patterns`.
- `test yaz`, `coverage`, `unit test`, `regression`: `test-driven-development` -> `react-testing-patterns` -> hedefli test komutu.
- `Supabase`, `auth`, `RLS`, `migration`, `storage`, `edge function`: `supabase` skill -> Supabase MCP -> gerekirse `nextjs-supabase-auth` -> DB/app dogrulama.
- `review`, `kontrol et`, `kalite`: code review modunda bulgulari once yaz; gerekirse `code-review-and-quality` kullan.
- `wrap up`, `oturumu kapat`, `bugunluk kapat`: `wrap-up` akisini calistir ve durable memory guncelle.

### Canonical Pipelines

#### Startup Pipeline

1. `using-superpowers` kuralini uygula.
2. Bu dosyadaki `Read First` siralamasini izle.
3. Intent'i siniflandir ve `Intent Router` uzerinden skill zincirini sec.
4. Gereksiz tool cagirma; ama uygun skill varsa atlama.

#### Feature Pipeline

1. `brainstorming` ile amac, sinirlar ve kabul kriterlerini netlestir.
2. Kullanici onayindan sonra `writing-plans` ile kucuk uygulanabilir adimlara bol.
3. Implementasyondan hemen once `test-driven-development` kullan.
4. Next.js/React/Supabase dokunuluyorsa ilgili yerel domain skill'ini yukle.
5. Degisikligi minimal tut, mevcut pattern'leri koru.
6. Uygun komutlarla dogrula: `test`, `typecheck`, `build`.

#### Bugfix Pipeline

1. `systematic-debugging` ile semptomu yeniden uret veya kanitla.
2. Kok nedeni kanitlanmadan fix yazma.
3. Regression riski varsa once failing test ekle.
4. Minimal fix uygula.
5. Ilgili testleri ve gerekiyorsa `typecheck/build` calistir.

#### UI Verification Pipeline

1. UI degisikliginde once tasarim niyetini netlestir.
2. Mevcut tasarim sistemini bozma; sadece hedeflenen alani iyilestir.
3. Desktop ve mobile gorunumleri `playwright-mcp` ile dogrula.
4. Console error ve kritik network hatalarini kontrol et.

#### Supabase Pipeline

1. Supabase islerinde once `supabase` skill'i ve gerekiyorsa Supabase MCP kullan.
2. DDL icin migration tercih et; rastgele raw SQL ile kalici schema degisikligi yapma.
3. RLS, auth session, cookie ve server/client boundary etkilerini kontrol et.
4. DB degisikliginden sonra types veya ilgili app kodu gerekiyorsa guncelle.

#### Quality Gate

1. Kod degistiyse uygun scriptleri kontrol et; olmayan script uydurma.
2. Tercih sirasi: hedefli test -> `npm run test --prefix apps/web` -> `npm run typecheck --prefix apps/web` -> `npm run build --prefix apps/web`.
3. Buyuk cikti bekleniyorsa raw shell yerine `context-mode` kullan.
4. Tamamlandi demeden once dogrulama sonucunu raporla.

## Default Operation Order

### Debug Pipeline

1. Trigger on intents such as `debug et`, `hata var`, `bug var`, `neden bozuluyor`, `root cause bul`, or `incele ve çöz`
2. Start with the canonical process chain: `using-superpowers` -> `find-skills` -> `systematic-debugging`
3. If the issue is multi-layered, ambiguous, or requires tradeoff analysis, add `sequential-thinking`
4. Do not propose or apply a fix before the root cause is evidenced clearly
5. Once root cause is confirmed, move to `writing-plans` or a minimal explicit fix plan
6. If behavior will change or regression risk exists, use `test-driven-development` before implementation
7. If the outcome is reusable operational knowledge, convert it into a runbook entry
8. If the result changes durable project memory, update the relevant wiki pages plus `overview`, `index`, and `log`

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
2. Run the canonical chain: `wrap-up` -> `obsidian-markdown` -> raw wrap-up -> NotebookLM -> `erp-wiki-orchestrator` -> durable wiki updates
3. Audit git state with `git status --short` and `git diff --stat`
4. Run quality checks separately for root `package.json` and `apps/web/package.json`
5. Record missing scripts as `not available`
6. Write raw wrap-up under `../../second-brain/raw/wrap-ups/` using `obsidian-markdown`
7. Write companion wrap-up source page under `../../second-brain/wiki/sources/`
8. Upload the raw wrap-up file to NotebookLM notebook `Virtualize` (`ae930df0-0cc0-4899-8843-963bee33fcf3`)
9. If upload fails, log the blocker explicitly in both the raw wrap-up and `../../second-brain/wiki/log.md`
10. First choice for durable memory updates is `erp-wiki-orchestrator`
11. When needed, trigger `erp-wiki-ingestor`, `erp-decision-capturer`, `erp-runbook-extractor`, and `erp-wiki-normalizer`
12. Apply `obsidian-markdown` to durable wiki page writes and refresh the vault index with `obsidian-cli` when available
13. Update affected `project`, `runbooks`, `overview`, `index`, and `log`
14. If wrap-up needs a quick memory scan before writing durable pages, use `obsidian-bases`
15. `json-canvas` is not currently available in this repo, so visualization is optional and should only be added if that skill/tool is introduced later

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
