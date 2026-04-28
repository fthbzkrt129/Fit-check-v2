---
title: "Wrap-Up: finish-signup 500 Fix"
type: wrap-up
status: complete
created: 2026-04-12
updated: 2026-04-12
tags:
  - wrap-up
  - auth
  - supabase
  - nextjs
  - fix
---

# Wrap-Up: 2026-04-12 — finish-signup 500 fix

## Oturum Ozeti

Bu oturumda `/auth/finish-signup` endpoint'inin Vercel'de 500 hatası vermesi ve local'de login olunamaması sorunları araştırıldı, plan dosyası oluşturuldu, kök nedenler tespit edildi, tüm düzeltmeler uygulandı, Supabase production migration'ları çalıştırıldı ve `main` branch'e push edildi.

---

## Changes Audit

### Bu oturumda değiştirilen dosyalar (commit: bf4cc9e):

| Dosya | Değişiklik |
|---|---|
| `apps/web/src/lib/env.ts` | `getSupabaseAdminEnv()` eklendi; admin client artık sadece `SUPABASE_SERVICE_ROLE_KEY` ister |
| `apps/web/src/lib/supabase/admin.ts` | `getServerEnv` → `getSupabaseAdminEnv` import değişikliği |
| `apps/web/src/app/auth/finish-signup/route.ts` | try/catch + yapılandırılmış logging eklendi |
| `apps/web/src/app/auth/callback/route.ts` | `exchangeCodeForSession` hata kontrolü eklendi |
| `apps/web/src/lib/tenant/bootstrapWorkspace.ts` | Slug'a userId suffix eklendi; 23505 unique violation recovery eklendi |
| `apps/web/src/lib/tenant/bootstrapWorkspace.test.ts` | 3 test: idempotent, duplicate recovery, first login |
| `apps/web/src/lib/env.test.ts` | `getSupabaseAdminEnv` için 2 yeni test |
| `.planning/phases/07-finish-signup-500-fix/07-finish-signup-500-fix-PLAN.md` | Plan dosyası oluşturuldu |

### Local only (commit'e girmedi):
- `apps/web/.env.local` → `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` eklendi

### Uncommitted (ilgisiz):
- `.planning/` altındaki çok sayıda dosya silme — önceki oturumdan kalan, bu oturumla ilgisiz
- `.next/` build cache dosyaları — otomatik oluştu

---

## Quality Check

| Kontrol | Sonuç |
|---|---|
| `npm run typecheck` | ✅ PASS (0 hata) |
| `npm run test` | ✅ PASS — 7 test dosyası, 28 test, tümü yeşil |
| `npm run build` | Çalıştırılmadı (Vercel build'e güvenildi) |
| `npm run lint` | Tanımlı değil — `apps/web/package.json` içinde mevcut değil |

---

## Skills ve Tool Kullanimi

| Skill / Agent / MCP | Nerede / Neden |
|---|---|
| `sequential-thinking` skill | Çok adımlı, kök neden belirsiz sorunda adımları sıralamak için |
| `systematic-debugging` (implicit) | 500 hata kök neden analizi: `getServerEnv` → `getSupabaseAdminEnv` |
| `test-driven-development` | Her değişiklik için önce test yazıldı, sonra implementasyon |
| `writing-plans` | `.planning/phases/07-...PLAN.md` planı oluşturuldu |
| Supabase MCP (`mcp__plugin_supabase_supabase__*`) | Migration uygulama: `list_projects`, `list_migrations`, `apply_migration`, `execute_sql` |
| Supabase MCP `apply_migration` | `20260403_000001_tenant_foundation` ve `20260405_000001_repair_saas_auth_foundation` production'a uygulandı |

---

## Learning Capture

- `[LEARN] Architecture: getServerEnv() tüm server key'leri gerektiriyordu; admin client sadece service role key'e ihtiyaç duyar — bağımsız schema zorunlu`
- `[LEARN] Testing: bootstrapWorkspace'de slug çakışması (23505) için recovery path test edilmeden canlıya alınmıştı`
- `[LEARN] Environment: NEXT_PUBLIC_ROOT_DOMAIN local'de eksikti; buildWorkspaceUrl subdomain redirect üretiyor — local'de test için localhost hosts config veya fallback yönlendirme gerekli`
- `[LEARN] Git: Supabase CLI farklı hesaba login olmuştu; production migration için Supabase MCP plugin tercih edilmeli`

---

## Next Session Context

**Açık görevler:**
1. Local subdomain routing: `http://slug.localhost:3000` tarayıcıda çözümlenmiyor. Seçenekler:
   - `finish-signup/route.ts` içine `NODE_ENV === 'development'` kontrolü + `/dashboard` fallback
   - Windows hosts dosyası: `127.0.0.1 slug.localhost`
2. Vercel'de `NEXT_PUBLIC_ROOT_DOMAIN` env değişkeninin production domain'e set edildiğini doğrula
3. Login sonrası workspace dashboard sayfası henüz yok — `/dashboard` veya `[workspaceSlug]/page.tsx` oluşturulması gerekiyor

**Blokaj yok** — kod temiz, testler yeşil, production migration uygulandı.

---

## Blocker / Risk

- Local subdomain redirect çalışmıyor — fonksiyonel blocker değil, sadece local test UX'i kötü
- `NEXT_PUBLIC_ROOT_DOMAIN` Vercel'de yanlış set edilmişse production redirect de kırılır — kontrol edilmeli
