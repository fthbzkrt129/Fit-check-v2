# Virtulize

**AI destekli sanal giysi görselleştirme platformu** — e-ticaret ve moda sektörü profesyonelleri için.

Virtulize, müşterilerinizin doğru ürünü görmesini sağlar. Daha az iade, daha fazla satış.

---

## Ne Yapar?

- Ürün fotoğraflarına AI ile sanal giysi yerleştirir
- E-ticaret dönüşüm oranını artırır
- Müşteri iade oranını düşürür
- Tekstil ve moda sektörüne özel katalog yönetimi sunar

## Başlarken

**Gereksinimler:** Node.js 18+

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local içine GEMINI_API_KEY değerini ekle

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

## Geliştirme

```bash
npm run dev        # Geliştirme sunucusu
npm run build      # Production build
npm run test       # Test suite
npm run typecheck  # TypeScript kontrolü
```

## Proje Yapısı

```
apps/
  web/             # Next.js 15 web uygulaması
    src/
      app/         # App Router sayfaları
      components/  # UI bileşenleri
    supabase/      # Veritabanı migration ve config
docs/
  brandvoice.md    # Marka ses rehberi
second-brain/      # Proje bilgi tabanı
```

## Teknoloji

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js 15, React 19 |
| Backend | Supabase (Auth, DB, Storage) |
| AI | Gemini API |
| Dil | TypeScript |
| Test | Vitest |

## Marka

Brand voice ve iletişim kuralları için [`docs/brandvoice.md`](docs/brandvoice.md) dosyasına bakın.

---

> Virtulize — *Daha az iade. Daha fazla satış. Daha akıllı iş.*
