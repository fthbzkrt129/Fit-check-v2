# Plan: /auth/finish-signup 500 Error Fix

**Faz:** 07  
**Tarih:** 2026-04-12  
**Öncelik:** Kritik — Production 500 blocker

---

## Problem Özeti

Vercel deploy'da `GET /auth/finish-signup` %100 500 döndürüyor.

Zincir:
```
finish-signup/route.ts
  → bootstrapWorkspaceForUser()
    → createSupabaseAdminClient()
      → getServerEnv()   ← BURADA PATLAMA
```

`getServerEnv()` tek bir schema ile hem `SUPABASE_SERVICE_ROLE_KEY` hem `GEMINI_API_KEY` hem `FAL_KEY` doğruluyor. Bu route'un AI anahtarlarına hiçbir ihtiyacı yok. Vercel ortamında bu anahtarlar set edilmemişse veya sonradan eklenecek şekilde ertelenmiş olsa dahi route patlar.

---

## Sıralı Hipotezler (Kod Kanıtlı)

| # | Hipotez | Durum | Kaynak |
|---|---------|-------|--------|
| H1 | `getServerEnv()` AI anahtarlarını zorunlu kılıyor; admin client bu fonksiyonu çağırıyor | **DOĞRULANDI** | `admin.ts:7`, `env.ts:12-16` |
| H2 | `finish-signup/route.ts` try/catch yok; her hata ham 500 | **DOĞRULANDI** | `route.ts:8-27` |
| H3 | `callback/route.ts` `exchangeCodeForSession` hatasını görmezden geliyor | **DOĞRULANDI** | `callback/route.ts:17` |
| H4 | Bootstrap non-transactional, duplicate slug üretebilir | **DOĞRULANDI** | `bootstrapWorkspace.ts:73-118` |
| H5 | Migration/DB eksikliği | Bağımsız risk; bu PR kapsamında checklist |

---

## Etkilenen Dosyalar

| Dosya | Değişiklik Tipi |
|-------|----------------|
| `src/lib/env.ts` | `getSupabaseAdminEnv()` fonksiyonu eklenir |
| `src/lib/supabase/admin.ts` | `getServerEnv()` yerine `getSupabaseAdminEnv()` kullanır |
| `src/app/auth/finish-signup/route.ts` | try/catch + structured logging + güvenli redirect |
| `src/app/auth/callback/route.ts` | Exchange hatası kontrol edilir |
| `src/lib/tenant/bootstrapWorkspace.ts` | Duplicate slug recovery + idempotency iyileştirmesi |
| `src/lib/tenant/bootstrapWorkspace.test.ts` | Yeni test case'ler |
| `src/lib/env.test.ts` *(yeni)* | Env split testi |

---

## Environment Validation Stratejisi

### Minimal Fix
`getSupabaseAdminEnv()` adlı ayrı bir fonksiyon ekle:
```ts
const supabaseAdminEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1)
});
```
`admin.ts` yalnızca bu fonksiyonu çağırır.

`getServerEnv()` korunur — AI feature'ları için kullanılmaya devam eder.

### Güçlü Fix (Sonraki faz)
Tüm env okuma katmanlarını domain'e göre ayır:
- `getSupabaseAdminEnv()` → sadece service role
- `getAiProviderEnv()` → Gemini + Fal
- `getServerEnv()` → ikisini birleştiren wrapper (geriye dönük uyum için)

---

## Runtime Logging Stratejisi

`finish-signup/route.ts` içinde:
```ts
try {
  const workspace = await bootstrapWorkspaceForUser(...)
  ...
} catch (err) {
  console.error("[finish-signup] bootstrap error", err)
  return NextResponse.redirect(new URL("/login?error=setup_failed", request.url))
}
```

---

## Minimal Fix Yolu

1. `env.ts` → `getSupabaseAdminEnv()` ekle
2. `admin.ts` → yeni fonksiyonu kullan
3. `finish-signup/route.ts` → try/catch
4. `callback/route.ts` → exchange error guard

---

## Güçlü Fix Yolu

1. Yukarıdakilere ek olarak
2. `bootstrapWorkspace.ts` → duplicate slug recovery (slug+suffix on conflict)
3. `bootstrapWorkspace.ts` → org oluşturulduktan sonra workspace insert başarısız olursa cleanup veya retry
4. DB transaction / RPC katmanı (uzun vadeli)

---

## Test Planı

- [ ] `getSupabaseAdminEnv()` çağrıldığında `GEMINI_API_KEY` ve `FAL_KEY` olmasa da hata atmaz
- [ ] `finish-signup` route bootstrap hatası → redirect with `?error=setup_failed`
- [ ] Bootstrap idempotent: kullanıcı zaten membership sahibi ise insert çağrılmaz
- [ ] Duplicate slug: org insert unique violation → error catch + refetch mevcut org
- [ ] callback: exchange hatası → `/login` redirect

---

## DB/Migration Validation Checklist

Production'da doğrulanması gereken:
- [ ] `organizations` tablosu var ve `slug` unique constraint mevcut
- [ ] `workspaces` tablosu var ve `slug` unique constraint mevcut  
- [ ] `workspace_memberships` tablosu var
- [ ] Service role key tüm tablolarda write/read yetkisi var
- [ ] RLS politikaları service role'u bypass ediyor
- [ ] Gerekli migration'lar (org/workspace foundation) uygulandı

---

## Rollout Notları

- `GEMINI_API_KEY` ve `FAL_KEY` Vercel'de set edilmemiş olabilir — bu fix sonrası `/auth/finish-signup` bu değerlere bağımlı olmayacak
- `SUPABASE_SERVICE_ROLE_KEY` hâlâ zorunlu — Vercel'de set edildiği doğrulanmalı
- Migration'lar production'da apply edilmiş olmalı
- Bu değişiklik geriye dönük uyumlu

---

## Kapsam Dışı

- AI feature env yapılandırması (başka route'lar bu PR'dan etkilenmez)
- Supabase RPC/transaction katmanı (sonraki faz)
- Workspace slug uniqueness için tam global dedupe (sonraki faz)
