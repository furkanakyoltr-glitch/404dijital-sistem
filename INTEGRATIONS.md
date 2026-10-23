# INTEGRATIONS.md — 404 Dijital Admin Sistemi

**Hiçbir gizli değer bu dosyada yok — sadece değişken adı, amacı ve kullanıldığı yer.** Gerçek değerler Railway → ilgili servis → Variables sekmesinde tutulur.

## Ortam değişkenleri (Railway env vars)

| Değişken | Amaç | Kullanıldığı yer |
|---|---|---|
| `DATABASE_URL` | Postgres bağlantısı | Prisma (tüm uygulama) |
| `NEXTAUTH_SECRET` | NextAuth JWT imzalama | `lib/auth.ts`, middleware |
| `WA_TOKEN` | WhatsApp Cloud API (Meta System User token, whatsapp_business_management + messaging kapsamlı) | `lib/whatsapp.ts` (tüm WA gönderimleri) |
| `WA_PHONE_NUMBER_ID` | WhatsApp gönderen numara ID'si (+90 551 537 04 04) | `lib/whatsapp.ts` |
| `WA_WEBHOOK_VERIFY_TOKEN` | Meta webhook doğrulama (GET handshake) | `app/api/whatsapp/inbound/route.ts` |
| `WP_WEBHOOK_SECRET` | Cron/webhook endpoint'lerini korumak için query-param secret (`?secret=...`) | `app/api/cron/teklif-hatirlatici/route.ts`, `app/api/cron/sheet-lead-sync/route.ts` |
| `INTERNAL_API_KEY` | Header tabanlı (`x-internal-key`) server-to-server auth bypass — oturumsuz çağrılar için | `app/api/sablonlar/*`, `app/api/randevu` (GET) |
| `ANTHROPIC_API_KEY` | AI İçgörü özelliği (WhatsApp mesaj analizi) | `app/api/whatsapp/ai-analiz/route.ts` — **varlığı teyit edilmedi, eksikse özellik nazikçe hata veriyor** |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel (reklam dönüşüm takibi) | Build-time, `Dockerfile` ARG |

## Harici servisler / API'ler

### Meta (Facebook/Instagram/WhatsApp)
- **Meta App**: "404 Dijital Otomasyon" (app_id `651349564728319`) — WhatsApp webhook sahibi.
- **Meta App**: "claude" (app_id `1322999099669869`) — Facebook Lead Ads webhook sahibi, Page "404 Dijital" (page_id `273624172495607`) buna abone.
- **WABA**: id `1381364330434940`, numara `+90 551 537 04 04`. Aynı WABA'ya "Make for Business Messaging" (Make.com entegrasyonu, eski `404strateji-erp` projesi için) da abone — dokunulmamalı.
- **Reklam hesabı**: `act_921213562821366` (gerçek harcayan), `act_1350071682648164` (eski/durgun, kullanılmıyor).
- Erişim: Meta Business Suite → İş Ayarları → Sistem Kullanıcıları üzerinden token üretilir (whatsapp_business_management + whatsapp_business_messaging + ads_management izinleriyle). Token'lar bu projede hiçbir zaman dosyaya yazılmaz, her oturumda kullanıcıdan istenir.

### Google Sheets ("Meta Reklam CRM")
- Sheet ID: `1wFkntLQMFwXsGAGu3LJgSCugV5FvYmiro4c3-DCfNng`
- Bazı Meta native lead-form gönderimleri (hangi otomasyon tarafından yazıldığı tam teyit edilmedi — muhtemelen Make.com veya Meta'nın kendi Sheets entegrasyonu) doğrudan bu sheet'e düşüyor, bizim `/api/webhooks/meta-leads` webhook'umuzu bypass ediyor.
- `/api/cron/sheet-lead-sync` route'u bu sheet'i **CSV export linki** (`https://docs.google.com/spreadsheets/d/<id>/export?format=csv&gid=<gid>`) üzerinden, API key/OAuth OLMADAN okur — bunun çalışması için sheet'in paylaşım ayarının "Bağlantıya sahip olan herkes → Görüntüleyici" olması GEREKİR.
- Taranan sekmeler (gid'leri route içinde sabit): `404_Ana_Hizmet_Secimi_v1`, `Detaylı form`, `Standart form`. `404 Strateji Formu` sekmesi KASITLI OLARAK dışarıda bırakıldı (ayrı iş, 404 Strateji'ye ait).

### Railway
- Proje id `61f50cfd-6ac9-4d66-a3a7-ed019f762e80`, servis `web` id `cb9bcbe8-58d4-4563-bbe2-25b0698f6b90`, ortam `production` id `06d3356e-097c-4171-b5ca-93e8adaf26c2`, Postgres servis id `82609d7e-68a0-4018-9cde-510e69d3bbaf`.
- Cron servisi: `teklif-hatirlatici-cron` — start command'ı **iki işi birden** yapacak şekilde genişletildi: önce `teklif-hatirlatici`, `&&` ile ardından `sheet-lead-sync` çağrılıyor. Ayrı bir cron servisi AÇILMADI, mevcut olan genişletildi.

### Hostinger
- `panel.404strateji.com` burada barınıyor (ayrı iş/ürün). Bu projeyle (404 Dijital) ilgisi yok. Kurumsal e-posta ihtiyacı için (Google Workspace borç nedeniyle kullanılamadığından) Hostinger hesabındaki mail seçenekleri araştırılıyor — **erişim/giriş bilgisi henüz sağlanmadı, tamamlanmadı.**
