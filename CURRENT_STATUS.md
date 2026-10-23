# CURRENT_STATUS.md — 404 Dijital Admin Sistemi

**Kural: bu dosya her görev tamamlandığında güncellenir.** (bkz. CLAUDE.md kural #4). Son güncelleme: 2026-10-23.

## ✅ Çalışan / tamamlanan

- Admin panel girişi, departman bazlı yetkilendirme (Yönetim: Furkan + Umut Barış Cura).
- `/admin/panolar` (Kanban görev yönetimi, departman bazlı).
- `/admin/ekip` (kullanıcı ekleme/düzenleme, WhatsApp'tan elle giriş bilgisi gönderme).
- `/admin/otomasyonlar` — görev atandı/tamamlandı tetikleyicili WA bildirimleri, onaylı şablonlarla (fallback).
- Web sitesi iletişim formu → Lead kaydı → yönetim+satışa otomatik WA bildirimi (test edildi, çalışıyor).
- WhatsApp'tan gelen ilk mesaj → otomatik Lead kaydı + bildirim.
- İki yeni Meta reklam kampanyası (İzmir, 22-55, sadece Instagram, kanıtlanmış kazanan kreatifler) — kullanıcı tarafından canlıya alındı.
- Google Sheet → Lead senkronu (`/api/cron/sheet-lead-sync`), mevcut cron'a eklendi, backlog bir kerelik işlendi.

## ⚠️ Bilinen sorunlar / eksikler

1. **Meta native lead-form webhook'u (`/api/webhooks/meta-leads`) güvenilirliği doğrulanamadı.** Simüle edilmiş test webhook POST'u sunucudan `{"received":true}` döndü ama WhatsApp bildirimi gelmedi — kök neden bulunamadı (muhtemelen `lib/leadBildirim.ts` içinde sessiz bir hata, ya da test payload'ı gerçek şemayla tam uyuşmuyor). **Sıradaki oturumda öncelik: bu route'u uçtan uca debug et** (Railway loglarına bak, ya da route içine geçici console.log ekleyip gerçek bir Meta test-lead ile dene).
2. **Google Sheet senkronu ilk çalıştırmada 310 geçmiş kaydı "yeni" sayıp hepsi için bildirim gönderdi** (tasarım hatası — backfill ile canlı senkron ayrılmamıştı). Düzeltildi denebilir mi: HAYIR, kod hâlâ aynı mantıkta — ileride bu route'a yeni bir sekme/kaynak eklenirse AYNI HATA TEKRARLANABİLİR. Düzeltme fikri: ileride yeni bir kaynak bağlanırken önce `eklendi` sayısını sıfır olarak doğrulayıp SONRA bildirimleri aç, ya da ilk senkronu `sessiz: true` parametresiyle (bildirimsiz) çalıştırıp öyle devreye al.
3. **Ekip üyesi giriş bilgisi (email+şifre) WhatsApp Business API ile otomatik gönderilemiyor** — Meta bunu `INCORRECT_CATEGORY` ile reddediyor (credential içeren UTILITY şablonu kabul etmiyor, Authentication kategorisi sadece OTP formatında çalışıyor). Kasıtlı olarak elle bırakıldı, "düzeltilmesi gereken bug" değil.
4. **Kurumsal e-posta (Google Workspace) borç yüzünden çalışmıyor.** Hostinger'da alternatif aranıyor — erişim bilgisi bekleniyor, araştırma başlamadı.
5. **panel.404strateji.com entegrasyonu yok ve olmayacak** (ayrı iş) — ama kullanıcı bunu başlangıçta bu projeyle karıştırmıştı, gelecekte tekrar karışıklık olabilir, dikkat.

## 🔜 Sıradaki mantıklı adımlar (öneriler, onay bekliyor)

- Meta leadgen webhook'unu gerçek bir Meta test-lead ile debug etmek.
- Reklam hesabındaki yeni 2 kampanyanın performansını birkaç gün sonra tekrar çekip StoryBrand+yeni hedefleme etkisini ölçmek.
- Hostinger kurumsal mail seçeneklerini (erişim sağlanınca) değerlendirmek.
