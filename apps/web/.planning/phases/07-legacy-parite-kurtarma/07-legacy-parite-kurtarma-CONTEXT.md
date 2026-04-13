# Phase 07: Legacy Parite Kurtarma - Context

**Phase:** 07-legacy-parite-kurtarma
**Requirements:** PARITY-01, PARITY-02, PARITY-03, PARITY-04, PARITY-05
**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Bu faz, eski root-level Vite/React uygulamasinda calisan styling davranislarini `apps/web` altindaki SaaS mimarisine geri kazandirir.

Kapsam:
- Eski styling davranisinin `StartScreen` ve `KombinEditor` icinde parity bazli geri kurulmasi
- Tum AI UI cagrilarinin tenant-protected `/api/ai/*` rotalari uzerinden calismasi
- Pose, scene, model swap ve deneysel bundle akislarinin yeniden baglanmasi
- Persistence/history/download davranisinin parity'yi destekleyecek kadar duzeltilmesi

Kapsam disi:
- Yeni urun feature'i eklemek
- Landing page polish veya marketing expansion
- Legacy root app'i hemen silmek
- Buyuk kapsamli architecture rewrite
</domain>

<decisions>
## Decisions

### Locked Decisions
- **D-01:** Bu faz inventory yerine dogrudan working behavior recovery odaklidir.
- **D-02:** UI tarafinda AI icin browser-side provider path'leri nihai yol olmayacak.
- **D-03:** Tum yeni runtime AI cagrilari yalnizca `/api/ai/model`, `/api/ai/try-on`, `/api/ai/pose`, `/api/ai/scene`, `/api/ai/experimental` rotalari uzerinden gidecek.
- **D-04:** Recovery sirasi: StartScreen/model generation -> core try-on orchestration -> pose/scene/model swap -> experimental bundle -> parity cleanup.
- **D-05:** Landing/login polish isleri en az `07-01` ve `07-02` tamamlanana kadar ikincil oncelik olacak.

### Agent's Discretion
- Wrapper/facade isimlendirmesi
- Testlerin unit/component dagilimi
- Legacy service dosyalarinin kaldirilma zamani
- `/_tenant` yolunun redirect mi yoksa delete ile mi sonlandirilacagi
</decisions>

<specifics>
## Specific Ideas

- Referans implementation eski root app davranisidir; birebir dosya tasimasi zorunlu degildir.
- SaaS foundation korunur; davranis parity'si server-side guvenli yol uzerinden elde edilir.
- `KombinEditor` parity'nin ana orkestra noktasi olarak ele alinmali.
</specifics>

<deferred>
## Deferred Ideas

- Legacy root app artifact temizligi
- Deep E2E suite genisletmesi
- Homepage/login visual iteration'lari
</deferred>

---

*Phase: 07-legacy-parite-kurtarma*
*Context gathered: 2026-04-12 via recovery planning*
