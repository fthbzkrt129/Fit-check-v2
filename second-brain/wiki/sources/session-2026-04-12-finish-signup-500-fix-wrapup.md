---
title: "Session Wrap-Up: finish-signup 500 Fix"
type: source
status: complete
created: 2026-04-12
updated: 2026-04-12
tags:
  - auth
  - supabase
  - nextjs
  - multi-tenant
  - fix
  - session
---

# Session: finish-signup 500 Fix (2026-04-12)

## Özet

`/auth/finish-signup` Vercel'de 500 hatası veriyordu. Kök neden: `admin.ts` içindeki `getServerEnv()` çağrısı `GEMINI_API_KEY` ve `FAL_KEY`'i de zorunlu kılıyordu, oysa admin client yalnızca `SUPABASE_SERVICE_ROLE_KEY`'e ihtiyaç duyuyor. Ayrıca Supabase production'da tenant tabloları hiç oluşturulmamıştı. Ham kayıt: [[wrap-up-2026-04-12-finish-signup-500-fix]]

## Kök Nedenler

1. `getServerEnv()` AI key'leri de gerektirdi → admin client init'te 500
2. Supabase'de `organizations`, `workspaces`, `workspace_memberships` tabloları yoktu
3. `NEXT_PUBLIC_ROOT_DOMAIN` local `.env.local`'da eksikti → local login kırık

## Uygulanan Düzeltmeler

- `env.ts`: `getSupabaseAdminEnv()` fonksiyonu eklendi — sadece service role key ister
- `admin.ts`: yeni fonksiyonu kullanacak şekilde güncellendi
- `finish-signup/route.ts`: try/catch + yapılandırılmış error logging
- `callback/route.ts`: session exchange hata kontrolü
- `bootstrapWorkspace.ts`: slug'a userId suffix, 23505 duplicate recovery
- 2 Supabase migration production'a uygulandı ([[Supabase MCP]] ile)
- `.env.local`: `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` eklendi

## Kalite

> [!success] Tüm kalite kapıları geçildi
> 7 test dosyası, 28 test — tümü yeşil | TypeScript: 0 hata

## Sonraki Adımlar

- [ ] Local subdomain routing — hosts config veya `finish-signup` local fallback
- [ ] Vercel `NEXT_PUBLIC_ROOT_DOMAIN` doğrulaması
- [ ] Workspace dashboard sayfası (`[workspaceSlug]/page.tsx`) henüz yok
