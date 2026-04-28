# Apps Workspace Guide

## Scope

- This file defines common guidance for code work under `apps/`.
- If the task targets a specific app, read that app's local guide next.

## Read Order

For code work inside `apps/` use this order:

1. `../AGENTS.md`
2. `AGENTS.md`
3. app-local `AGENTS.md`
4. app-local `CLAUDE.md` if present

For `apps/web`, the effective order is:

1. `../AGENTS.md`
2. `apps/AGENTS.md`
3. `apps/web/AGENTS.md`
4. `apps/web/CLAUDE.md`

## Working Default

- The default code workspace in this repository is `apps/web`.
- If the user says `app`, assume `apps/web` unless they specify another app.

## Suggested Skill Usage

- Start with `using-superpowers`.
- If the task is ambiguous or involves tradeoffs, use `sequential-thinking` early.
- For feature and behavior design, prefer `brainstorming` before implementation.
- For approved multi-step work, prefer `writing-plans` and then `subagent-driven-development`.
- For bugs and regressions, prefer `systematic-debugging` before changing code.

## Tool Routing

- Use `context7` for current framework or SDK docs.
- Use `playwright-mcp` for browser-visible flows.
- Use `supabase` MCP for DB, auth, storage, migration, and edge-function work.
- Use `context-mode` for large output or broad analysis.
