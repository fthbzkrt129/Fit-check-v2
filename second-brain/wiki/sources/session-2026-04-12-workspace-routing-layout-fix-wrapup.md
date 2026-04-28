---
title: "Session: Workspace Routing & Layout Fix"
type: source
tags:
  - session
  - routing
  - next-js
  - tenant
  - kombin
created: 2026-04-12
updated: 2026-04-12
status: complete
---

# Session: Workspace Routing & Layout Fix (2026-04-12)

Kaynak: [[wrap-up-2026-04-12-workspace-routing-layout-fix]]

## Özet

Bu oturum, login sonrası KombinEditor uygulamasına erişimin sağlanması üzerine yapılan çalışmayı kapsar.

## Temel Bulgular

- Next.js `_` prefix klasörler middleware rewrite ile dahi erişilemez (404)
- `_tenant/` → `workspace/[workspaceSlug]/` route migration
- `lvh.me` HSTS preload listesinde — localhost subdomain testi için kullanılamaz
- Playwright browser Windows hosts dosyasını okumaz → path-based `/dev/[slug]` shortcut
- Gemini API client lazy initialization pattern (`getAi()`)

## Etkilenen Bileşenler

- [[middleware]] — `/dev/[slug]` kısa yolu
- [[entryContract]] — workspace rewrite path
- `workspace/[workspaceSlug]/page.tsx` — yeni tenant route
- `workspace/[workspaceSlug]/layout.tsx` — passthrough layout

## Açık Riskler

- `GEMINI_API_KEY` browser'a açık — API route proxy gerekli
- `sessionStorage.test.ts` — pre-existing localStorage hataları
