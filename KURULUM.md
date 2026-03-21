# 404 Dijital Sistem - Kurulum Kılavuzu

## Gereksinimler
- Node.js 18+
- PostgreSQL veritabanı
- Supabase hesabı (muhasebe dosya yükleme için)

## Hızlı Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install --legacy-peer-deps
```

### 2. Ortam Değişkenlerini Ayarla
`.env.local` dosyasını düzenle:
```
DATABASE_URL="postgresql://USER:PASS@HOST:5432/404dijital"
NEXTAUTH_SECRET="güçlü-bir-secret"
SMTP_USER="info@404dijital.com"
SMTP_PASS="gmail-uygulama-sifresi"
ADMIN_MAIL_1="furkanakyoltr@gmail.com"
ADMIN_MAIL_2="info@404dijital.com"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
MAKE_WHATSAPP_WEBHOOK="https://hook.make.com/..."
```

### 3. Veritabanı Kur
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Geliştirme Sunucusu
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
npm start
```

## Domain Yapılandırması

### Hostinger Subdomainler
- `404dijital.com` → Ana site
- `admin.404dijital.com` → Admin paneli
- `teklif.404dijital.com` → Müşteri teklif portalı

### next.config.js Subdomain Ayarı
Production'da her subdomain aynı Next.js uygulamasına yönlenecek.
Middleware subdomain tespiti yaparak doğru sayfaları gösterir.

## Giriş Bilgileri (Seed sonrası)
- **Admin:** admin@404dijital.com / 404dijital2026
- **Demo Müşteri:** Kasa No: 404-001 / Şifre: demo1234

## Make.com Webhook Kurulumu
1. Make.com'da yeni senaryo oluştur
2. Webhook URL'yi `.env.local`'daki `MAKE_WEBHOOK_URL`'ye ekle
3. Teklif onaylandığında: WhatsApp bildirimi + Admin maili
4. WhatsApp gelen mesaj → `/api/whatsapp/webhook` endpoint'ine yönlendir

## Supabase Storage Kurulumu
1. Supabase'de "dekontlar" adlı bucket oluştur
2. RLS policy ekle: Sadece authenticated kullanıcılar okuyabilir/yazabilir
3. Klasör yapısı: `gelir/YYYY/MM/` ve `gider/YYYY/MM/`
