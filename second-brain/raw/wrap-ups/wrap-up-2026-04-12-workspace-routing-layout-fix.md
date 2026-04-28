---
title: "Wrap-Up: Workspace Routing & Layout Fix"
type: wrap-up
tags:
  - wrap-up
  - routing
  - next-js
  - tenant
  - layout
created: 2026-04-12
updated: 2026-04-12
status: complete
---

# Wrap-Up: Workspace Routing & Layout Fix

## Oturum Özeti

Bu oturumda, giriş yaptıktan sonra kullanıcının KombinEditor uygulamasına yönlendirilmesi sorunu çözüldü. Next.js `_tenant` özel klasörünün (private folder, `_` prefix) middleware rewrite ile erişilemez olduğu tespit edildi. Çözüm: `workspace/[workspaceSlug]/` route oluşturuldu ve middleware `getTenantRewritePath` fonksiyonu güncellendi. Localhost dev erişimi için `/dev/[slug]` middleware kısa yolu eklendi. Subdomain SSL sorunları (lvh.me HSTS preload listesinde) ve localhost Playwright çözümü de ele alındı. Son adımda workspace slug header'ı kaldırıldı.

## Changes Audit

### Bu Oturumda Değiştirilen Dosyalar

| Dosya | Durum | Açıklama |
|---|---|---|
| `apps/web/middleware.ts` | MODIFIED | `/dev/[slug]` kısa yolu eklendi |
| `apps/web/src/lib/tenant/entryContract.ts` | MODIFIED | `_tenant` → `workspace` rewrite path |
| `apps/web/src/app/workspace/[workspaceSlug]/page.tsx` | CREATED | KombinEditor'ı render eden tenant sayfası |
| `apps/web/src/app/workspace/[workspaceSlug]/layout.tsx` | CREATED | Temiz passthrough layout (header kaldırıldı) |
| `apps/web/src/lib/kombin/services/geminiService.ts` | MODIFIED | Lazy `getAi()` getter (browser init hatası düzeltildi) |
| `apps/web/.env.local` | MODIFIED | ROOT_DOMAIN değişikliği (lvh.me → app.test) |
| `apps/web/src/lib/tenant/entryContract.test.ts` | MODIFIED | `_tenant` → `workspace` test beklentileri güncellendi |

### Uncommitted Changes

- Yukarıdaki dosyalar commit edilmedi. `.planning/` silinen dosyalar da unstaged durumda (önceki oturumdan).

## Quality Check

| Kontrol | Sonuç |
|---|---|
| `tsc --noEmit` | ✅ Geçti |
| `vitest run` (entryContract testleri) | ✅ Geçti |
| `vitest run` (sessionStorage testleri) | ❌ Pre-existing: `localStorage is not defined` (jsdom ortam sorunu, bu oturumdan önce de vardı) |
| `lint` | Script mevcut değil `apps/web/package.json`'da |

## Skills ve Tool Kullanımı

- `wrap-up` — oturum kapanış ritüeli
- `obsidian-markdown` — wrap-up frontmatter ve Obsidian formatı
- `sequential-thinking` — routing sorun analizi ve çözüm sıralaması
- Playwright MCP — `localhost:3000/workspace/[slug]` sayfasını browser ile doğrulama
- Supabase MCP — önceki oturumdaki auth/DB işlemleri için kullanıldı

## Learning Capture

- `[LEARN] Architecture: Next.js `_` prefix klasörler private folder'dır — middleware rewrite ile bile erişilemez, 404 döner. Tenant routing için `_tenant` değil `workspace/[slug]` gibi gerçek bir route kullanılmalı.`
- `[LEARN] Architecture: lvh.me HSTS preload listesindedir — Chrome HTTP'yi HTTPS'e zorlar, localhost subdomain testi için lvh.me kullanılmamalı.`
- `[LEARN] Architecture: Playwright browser Windows hosts dosyasını okumaz — subdomain testleri için path-based shortcut (/dev/[slug]) daha güvenilir alternatif.`
- `[LEARN] Architecture: GoogleGenAI client modül seviyesinde initialize edilirse browser bundle'a dahil olur ve API key hatası verir. Lazy getter pattern (getAi()) bunu önler.`
- `[LEARN] Quality: Test beklentilerini path değişikliklerinden sonra güncellemeyi unutma — _tenant → workspace gibi path değişimleri test snapshot'larını kırar.`

## Next Session Context

### Sonraki Görevler (Öncelik Sırası)

1. **Gemini API güvenliği**: `geminiService.ts` çağrıları hâlâ client-side yapılıyor, `GEMINI_API_KEY` browser'a açık. API route proxy katmanı oluşturulmalı (`/api/kombin/generate`).
2. **Login redirect testi**: `/dev/[slug]`'a giriş yapılmamış kullanıcı gittiğinde login → geri yönlendirme akışı doğrulanmalı.
3. **sessionStorage testleri**: `localStorage is not defined` sorunu — vitest config'de `environment: 'jsdom'` ayarlanmalı.
4. **Uncommitted değişiklikler**: Bu oturumun dosyaları commit edilmeli.
5. **Production**: `NEXT_PUBLIC_ROOT_DOMAIN` production Vercel ortamı için doğru domain'e ayarlanmalı.

### Önemli Bağlam

- Dev erişim URL'si: `http://localhost:3000/dev/[workspaceSlug]`
- Workspace route: `src/app/workspace/[workspaceSlug]/`
- Middleware kısa yolu: `DEV_WORKSPACE_PREFIX = "/dev/"` → `workspace/[slug]/` rewrite

## Blocker / Risk

> [!warning] Kritik Risk
> `GEMINI_API_KEY` browser bundle'a sızıyor. Tüm Gemini çağrıları server-side API route üzerinden proxy edilmeli. Production'a geçmeden önce düzeltilmeli.

> [!note] Pre-existing Test Failures
> `sessionStorage.test.ts` — 10 test `localStorage is not defined` hatası veriyor. Bu session'dan önce de vardı, bu oturumun sorumluluğu değil. Ancak bir sonraki oturumda düzeltilmeli.
