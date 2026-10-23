# PROJECT_CONTEXT.md — 404 Dijital Admin Sistemi

## İş bağlamı

404 Dijital, İzmir merkezli bir performans pazarlama ajansı (sahibi: Furkan Akyol). Bu repo, ajansın hem genel web sitesini (`404dijital.com`, StoryBrand yapısında, lead toplama odaklı) hem de iç CRM/admin panelini (`admin.404dijital.com`) barındırır. Ekip büyüyor (Furkan + Umut Barış Cura yönetim, ileride sosyal medya/reklam/video/muhasebe/tasarım departmanları) — panel buna göre departman bazlı erişim kontrolüne geçirildi.

Not: `panel.404strateji.com` **ayrı bir iş/ürün** ("404 Strateji — Kiralık Pazarlama Müdürü", B2B kiralık CMO hizmeti), Hostinger'da barınıyor, bu repo ile ilgisi yok — karıştırılmamalı.

## Mimari (yüksek seviye)

```
404dijital.com (genel site)
  └─ form submit → /api/iletisim → lib/leads.ts createLead() → Lead tablosu
                                                               → leadGeldiBildir() → WhatsApp (yönetim+satış)

admin.404dijital.com (panel, NextAuth korumalı)
  ├─ Leadler / Mesajlar / Müşteriler / Teklifler / Muhasebe  → departman: yonetim + satis (+ muhasebe)
  ├─ Panolar (Kanban, görev yönetimi)                        → tüm departmanlar, kendi panosu
  ├─ Ekip (kullanıcı yönetimi)                                → sadece yonetim
  └─ Otomasyonlar (IF-tetikleyici WA bildirim kuralları)      → sadece yonetim

Meta (Facebook/Instagram) Lead Ads
  └─ webhook → /api/webhooks/meta-leads → Lead tablosu (GÜVENİLİRLİĞİ DOĞRULANMADI, bkz CURRENT_STATUS.md)
  └─ (paralel) ayrı bir otomasyon → Google Sheet "Meta Reklam CRM" → /api/cron/sheet-lead-sync (periyodik) → Lead tablosu

WhatsApp Cloud API (+90 551 537 04 04)
  └─ inbound webhook → /api/whatsapp/inbound → WPSohbet/WPSohbetMesaj (panel "Mesajlar" sayfası)
  └─ ilk mesajsa → otomatik Lead kaydı + hoşgeldin mesajı
```

## Veritabanı modelleri (önemli olanlar)

- `Admin` — panel kullanıcıları. `departman`, `role` (admin/üye), `telefon` (WA bildirimleri için zorunlu).
- `Musteri`, `Teklif`, `KanbanKart`, `Timeline`, `Todo` — müşteri bazlı CRM (eski, satış ekibi kullanır).
- `Pano`, `Gorev` — YENİ (bu oturumda eklendi), departman bazlı, müşterisiz de olabilir iç görev takibi. `Gorev.musteriId` opsiyonel.
- `Lead`, `LeadNot` — gelen talepler. `kaynak` alanı serbest metin, kaynağı ayırt etmek için kullanılır (`"Web Sitesi - ..."`, `"WhatsApp"`, `"Meta Reklam (form:..., leadgen:...)"`, `"Meta Reklam (sheet:<sekme>, id:<sheet_id>)"`).
- `Otomasyon`, `OtomasyonLog` — YENİ, "EĞER [tetikleyici] olursa [departman]'da WhatsApp'tan [mesaj] gönder" kuralları + log.
- `WPSohbet`, `WPSohbetMesaj` — WhatsApp gelen kutusu.
- `WASablon` — Meta onaylı WhatsApp şablonları (panelden oluşturulup Meta'ya onaya gönderilir).
- `Randevu`, `RandevuAyar` — görüşme/randevu sistemi (`/gorusme` public sayfası).

## Bu oturumda tamamlanan büyük işler (kronolojik)

1. Zero Meta Pixel lead-tracking hatası teşhis edildi (env var eksikliğiydi, kod sorunu değildi).
2. 404dijital.com ana sayfa + 13 landing page StoryBrand yapısına geçirildi (gerçek müşteri hikayeleri, "Bir Problemim Var" CTA'sı).
3. Landing page CTA mikro-metni ve garanti vurgusu iyileştirildi (çağrı-kaygısını azaltmak için).
4. **Departman bazlı admin sistemi** kuruldu: `Admin.departman`/`role`, sidebar departmana göre filtreleniyor, `/admin/ekip` (kullanıcı yönetimi), `/admin/panolar` (Kanban).
5. **Otomasyonlar** sistemi: görev atandığında/tamamlandığında WhatsApp bildirimi, 2 onaylı Meta şablonu (`gorev_atama_bildirimi`, `gorev_tamamlandi_bildirimi`).
6. **Lead bildirim sistemi**: her yeni lead (form/Meta/WhatsApp) yönetim+satış departmanına otomatik WhatsApp bildirimi (`lib/leadBildirim.ts`), 1 onaylı şablon (`yeni_lead_bildirimi`).
7. İki yeni Meta reklam kampanyası kuruldu (geçmişte en çok lead getiren 2 video kreatifi yeniden kullanılarak): İzmir bölgesi, 22-55 yaş, yalnızca Instagram, 500₺/gün bütçe, ayrı kampanyalar — **şu an PAUSED, kullanıcı tarafından canlıya alındı (bu sohbet dışında teyit edildi).**
8. Google Sheet ("Meta Reklam CRM") → Lead tablosu senkron route'u (`/api/cron/sheet-lead-sync`) eklendi, mevcut `teklif-hatirlatici-cron` Railway cron komutuna eklendi (yeni servis açılmadan).

## Bilinmesi gereken iş kararları

- WhatsApp Business API UTILITY şablonları **asla şifre/kimlik bilgisi içeremez** (Meta `INCORRECT_CATEGORY` ile reddeder) — bu yüzden yeni ekip üyesi giriş bilgisi gönderimi kasıtlı olarak elle (kişisel WhatsApp üzerinden, wa.me linkiyle) bırakıldı, otomatikleştirilemedi.
- Google Workspace (kurumsal e-posta) şu an **borç nedeniyle kullanılamıyor** — alternatif olarak Hostinger üzerindeki (panel.404strateji.com'un barındığı hesap) kurumsal mail seçenekleri araştırılıyor, henüz çözülmedi.
