# AGENTS.md — 404 Dijital Admin Sistemi

Bkz. [CLAUDE.md](./CLAUDE.md) — bu dosya onun kısa bir aynasıdır, bazı araçlar `AGENTS.md`'yi okur.

## Hızlı özet

- Next.js + Prisma + Postgres, Railway, GitHub Contents API ile düzenleniyor (yerel clone yok).
- Admin panel: `admin.404dijital.com` — NextAuth (credentials), rol tabanlı: `Admin.departman` (`yonetim`, `satis`, `sosyal_medya`, `reklam`, `creative`, `video_produksiyon`, `muhasebe`, `tasarim`) + `Admin.role` (`admin` = tam yetki, `uye` = sadece kendi departmanı).
- WhatsApp Business Cloud API entegre (bildirimler, müşteri mesajlaşma, lead uyarıları).
- Meta Ads (Facebook/Instagram) — reklam hesabı act_921213562821366, native lead-form reklamları var.

## Şema değişikliği prosedürü

1. `schema.prisma`'yı güncelle.
2. `prisma/migrations/<YYYYMMDDHHMMSS>_aciklama/migration.sql` dosyasını ELLE yaz (Prisma CLI yerel çalışmıyor, otomatik üretilmiyor).
3. İkisini de GitHub Contents API ile push et.
4. Railway deploy'u bekle, `prisma migrate deploy` migration'ı uygular.
5. Deploy sonrası ilgili route'u `curl` ile kontrol et (401/307 = canlı ve auth koruması çalışıyor; 500/404 = sorun var).

## Bilinen kısıtlar

- Bu ortamın auto-mode classifier'ı şunları engeller: üretim DB'sine doğrudan credential ile bağlanmak (okuma dahil), Railway env var okuma/yazma, kimlik doğrulaması olmayan "bootstrap" endpoint'leri oluşturmak. Bu durumlarda kullanıcıdan SQL'i kendi Railway Console'undan (Postgres servisi → Console sekmesi, `psql -U postgres -d <dbname> -c "..."`) çalıştırması istenir.
- WhatsApp Business API: aynı gün içinde kullanıcı bize yazmadıysa serbest metin gönderilemez (24 saat penceresi). Çözüm: Meta onaylı UTILITY şablonu + kod önce serbest metni dener, başarısız olursa şablona düşer (bkz. `lib/otomasyon.ts`, `lib/leadBildirim.ts`).
