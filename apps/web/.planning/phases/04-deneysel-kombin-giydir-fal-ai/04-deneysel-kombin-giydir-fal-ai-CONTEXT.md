# Phase 4: Deneysel Kombin Giydir (fal.ai) - Context

**Phase:** 04-deneysel-kombin-giydir-fal-ai
**Requirements:** EXP-01, EXP-02, EXP-03, EXP-04, EXP-05
**Date:** 2026-04-02

## User Vision

Kullanıcı, model görseli üretildikten sonra standart styling akışına ek olarak daha ucuz bir deneysel akış başlatabilmeli. Bu akışta parçalar tek tek render edilmek yerine tüm kombin referansları tek seferde fal.ai'ye gönderilecek.

## Locked Decisions

- **D-01:** Görsel upload edildikten ve model üretildikten sonra giriş noktası `Manken Değiştir` / mevcut `Proceed to Styling` alanındaki ek buton olacak.
- **D-02:** Yeni buton adı tam olarak `Deneysel kombin giydir` olacak.
- **D-03:** İlk aşama mevcut `Proceed to Styling` akışını baz alacak; standart akış korunacak.
- **D-04:** Sağlayıcı olarak `fal.ai` kullanılacak.
- **D-05:** Temel fark tek tek parça işlemek yerine tüm kombini tek request ile göndermek olacak.
- **D-06:** Ana amaç maliyet/bütçe tasarrufu.
- **D-07:** Prompt mantığı çoklu input görselden öğe alıp ana sahnede tek yeni görsel üretme yaklaşımını izleyecek.

## Deferred Ideas

- Sunucu/proxy ekleyerek güvenli fal token dağıtımı
- Çoklu varyasyon batch üretimi
- Ayrı analytics / maliyet dashboard'u

## Agent Discretion

- Deneysel akış içindeki final CTA adı ve yerleşimi
- fal.ai model endpoint'inin env üzerinden override edilebilir tasarlanması
- Tek request öncesi staged selection UX detayları

## Planning Notes

- Standart Gemini tabanlı tek-parça akışı kırılmamalı.
- Mevcut browser-only SPA constraint korunmalı.
- fal.ai anahtarının istemci tarafında kullanımı güvenlik riski yaratır; mevcut proje deseni ile uyumlu şekilde `user_setup` içinde açıkça belirtilmeli.
