# CLAUDE.md — 404 Dijital Admin Sistemi

Bu depo (`404dijital-sistem`) 404 Dijital ajansının kurumsal web sitesi + admin panelidir. Bu dosya, bu projede çalışan herhangi bir Claude Code oturumunun ilk okuması gereken giriş noktasıdır.

## Proje nedir

- **Next.js (App Router) + Prisma + PostgreSQL**, Railway üzerinde deploy edilir.
- Üç alan adı tek Railway servisine bağlı (Worker/middleware ile path yönlendirmesi yapılır):
  - `404dijital.com` — genel site + `/admin/*` (admin panel)
  - `admin.404dijital.com` → `/admin/*`'e yönlenir
  - `teklif.404dijital.com` → `/kasa/*`'ye yönlenir (müşteri teklif görüntüleme, public)
- **Yerel checkout yok** — bu repo bu oturumlarda GitHub Contents API (base64 PUT) ile düzenlenir, push sonrası Railway otomatik build/deploy tetiklenir. `git clone` yapılmadan çalışılır.
- Deploy: `Dockerfile` → runtime `CMD`: `prisma migrate deploy --schema=./prisma/schema.prisma ... && node server.js`. **Önemli:** `package.json`'daki `start` script'i (`prisma db push`) Railway'de KULLANILMIYOR — gerçek migration `prisma/migrations/` klasöründeki SQL dosyaları üzerinden uygulanır. Şema değişikliği yaparken hem `schema.prisma` hem de elle yazılmış `prisma/migrations/<timestamp>_ad/migration.sql` dosyası eklenmeli, yoksa migration deploy'da uygulanmaz.

## Çalışma kuralları (bu proje için kalıcı)

1. **Şema (Prisma) değişikliği yapmadan önce kullanıcıdan onay al** — nullable/geriye dönük uyumlu olduğunu belirterek kısa bir AskUserQuestion ile.
2. **Migration dosyasını unutma** — yukarıda açıklanan Dockerfile deseni yüzünden, sadece `schema.prisma`'yı güncellemek yetmez.
3. **Sırrı asla markdown/commit/log'a yazma** — `INTEGRATIONS.md`'de yalnızca env var isimleri ve nerede kullanıldıkları belgelenir, değerler hiçbir zaman.
4. **Her görev sonrası `CURRENT_STATUS.md`'yi güncelle** — tamamlanan/bekleyen/bilinen sorunlar bölümlerini güncel tut.
5. GitHub Contents API path encoding: parantez içeren path segmentleri (`app/(admin)/...`) URL-encode edilmeli (`%28admin%29`), yoksa sessizce 404 döner.
6. Railway deploy, build/test döngüsü olmadan GitHub push + bekleme ile doğrulanır — `curl -o /dev/null -w "%{http_code}"` ile route'un canlı olup olmadığı (401/307/405 bekleniyorsa bunlar "route var" demektir, 404/500 değil) kontrol edilir.

Detaylar için: [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md), [INTEGRATIONS.md](./INTEGRATIONS.md), [CURRENT_STATUS.md](./CURRENT_STATUS.md).
