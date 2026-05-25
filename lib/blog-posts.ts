export type SectionType = 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'tip' | 'table' | 'cta_inline'

export interface Section {
  type: SectionType
  content?: string
  items?: string[]
  headers?: string[]
  rows?: string[][]
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  keywords: string[]
  date: string
  readTime: string
  category: string
  excerpt: string
  sections: Section[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'meta-ads-fiyatlari-2025',
    title: 'Meta Ads Fiyatları 2025: İşletmeniz Gerçekte Ne Kadar Harcamalı?',
    description: 'Meta Ads (Facebook ve Instagram) reklam maliyetleri 2025\'te nasıl hesaplanır? CPM, CPC, CPL değerleri ve Türkiye ortalamaları.',
    keywords: ['meta ads fiyatları', 'instagram reklam fiyatları', 'facebook reklam maliyeti', 'dijital reklam bütçesi 2025'],
    date: '2025-05-15',
    readTime: '7 dk',
    category: 'Meta Ads',
    excerpt: 'Instagram ve Facebook reklamlarına ne kadar bütçe ayırmalısınız? 2025 Türkiye verilerine göre gerçekçi maliyet hesabı ve strateji önerileri.',
    sections: [
      {
        type: 'p',
        content: 'Meta Ads\'a (Facebook ve Instagram reklamları) başlamadan önce en sık sorulan soru şu: "Ne kadar bütçe ayırmalıyım?" Bu sorunun tek bir doğru cevabı yok; sektörünüze, hedef kitlenize ve hedeflerinize göre değişiyor. Ama Türkiye pazarına özel 2025 verileriyle sizi doğru yönlendirebiliriz.',
      },
      {
        type: 'h2',
        content: 'Meta Ads\'da Temel Ücretlendirme Modelleri',
      },
      {
        type: 'p',
        content: 'Meta, reklam ücretlerini birkaç farklı modelle hesaplar. Kampanya amacınıza göre hangi metriğin öncelikli olduğunu anlamak, bütçenizi verimli kullanmanın ilk adımıdır.',
      },
      {
        type: 'ul',
        items: [
          'CPM (Cost Per Mille): Reklamınızın 1.000 kez gösterilmesi için ödenen tutar. Marka bilinirliği kampanyalarında kullanılır.',
          'CPC (Cost Per Click): Reklamınıza her tıklama için ödenen tutar. Trafik ve lead kampanyalarında kritik metriktir.',
          'CPL (Cost Per Lead): Bir potansiyel müşteri bilgisi elde etmek için ödenen toplam tutar.',
          'ROAS (Return on Ad Spend): Harcanan her liranın kaç lira gelir getirdiğini gösterir. E-ticaret için en kritik metrik.',
        ],
      },
      {
        type: 'h2',
        content: '2025 Türkiye Meta Ads Ortalama Maliyetleri',
      },
      {
        type: 'p',
        content: 'Türkiye, global ölçekte Meta reklam maliyetlerinin görece düşük olduğu pazarlardan biri. Ancak 2024-2025 arasında dijital reklamlara olan talep arttıkça maliyetler de yükseliyor.',
      },
      {
        type: 'table',
        headers: ['Metrik', 'Düşük Bütçe', 'Ortalama', 'Rekabetçi Sektörler'],
        rows: [
          ['CPM', '15₺ – 25₺', '30₺ – 50₺', '60₺ – 120₺'],
          ['CPC', '1₺ – 3₺', '3₺ – 8₺', '10₺ – 25₺'],
          ['CPL (Lead)', '30₺ – 80₺', '80₺ – 200₺', '200₺ – 600₺'],
          ['Aylık Min. Bütçe', '3.000₺', '8.000₺', '15.000₺+'],
        ],
      },
      {
        type: 'tip',
        content: 'Gayrimenkul, finans ve sigorta gibi yüksek rekabetçi sektörlerde CPL değerleri 500₺\'yi aşabilir. Bu sektörlerde düşük bütçeyle anlamlı sonuç almak çok zordur.',
      },
      {
        type: 'h2',
        content: 'Bütçenizi Etkileyen 4 Temel Faktör',
      },
      {
        type: 'ol',
        items: [
          'Sektör rekabeti: Finans, hukuk, gayrimenkul gibi alanlarda tıklama başına maliyet çok daha yüksek.',
          'Hedef kitle büyüklüğü: Çok dar hedefleme frekansı artırır, maliyetleri şişirir.',
          'Reklam kalite skoru: İyi tasarlanmış, yüksek etkileşimli reklamlar daha düşük CPM ile gösterilir.',
          'Sezon ve kampanya yoğunluğu: Yılbaşı, Ramazan, Sevgililer Günü gibi dönemlerde tüm maliyetler artar.',
        ],
      },
      {
        type: 'h2',
        content: 'Neden Düşük Bütçeyle Meta Ads Çalışmaz?',
      },
      {
        type: 'p',
        content: 'Meta\'nın algoritması, öğrenme aşamasını tamamlamak için genellikle aylık 50 dönüşüm hedefler. Aylık 2.000-3.000₺ bütçeyle bu sayıya ulaşmak neredeyse imkânsız. Yeterli veri birikmeyen kampanyalar öğrenme aşamasında takılı kalır, optimizasyon gerçekleşmez.',
      },
      {
        type: 'p',
        content: 'Düşük bütçe aynı zamanda A/B test yapmayı engeller. Hangi kreatifin, hangi başlığın, hangi kitleye daha iyi dönüştürdüğünü göremezsiniz. Sonuç: harcadığınız para veri üretmez, büyüme sağlamaz.',
      },
      {
        type: 'h2',
        content: 'Ajans mı, Kendi Kendinize mi Yönetim?',
      },
      {
        type: 'p',
        content: 'Meta Ads yönetimini kendiniz yapabilirsiniz — ama bu ciddi bir öğrenme eğrisi gerektiriyor. Meta\'nın reklam yöneticisi sürekli değişiyor, yeni kampanya türleri çıkıyor, Advantage+ gibi AI destekli sistemler eski stratejileri geçersiz kılıyor. Ajans çalışmanın maliyeti yüksek görünse de uzman yönetim genellikle bütçenin %30-50\'sini israf etmekten kurtarır.',
      },
      {
        type: 'cta_inline',
        content: 'Reklam bütçenizi nasıl optimize edeceğinizi öğrenmek ister misiniz? Ücretsiz analiz için bize ulaşın.',
      },
    ],
  },
  {
    slug: 'roas-nedir-nasil-hesaplanir',
    title: 'ROAS Nedir? Reklamınızın Gerçekten Kâr Ettirip Ettirmediğini Ölçün',
    description: 'ROAS (Return on Ad Spend) nedir, nasıl hesaplanır? Hedef ROAS değerleri ve Meta Ads optimizasyon taktikleri. 2025 güncel rehber.',
    keywords: ['roas nedir', 'roas hesaplama', 'meta ads roas', 'reklam getirisi ölçümü', 'return on ad spend'],
    date: '2025-05-10',
    readTime: '6 dk',
    category: 'Strateji',
    excerpt: 'ROAS, reklam harcamanızın kaç katı gelir getirdiğini gösteren en kritik metrik. Doğru okumayı öğrenmeden reklam yönetimi sadece para yakmaktır.',
    sections: [
      {
        type: 'p',
        content: 'Pek çok işletme Meta Ads\'a binlerce lira harcıyor ama tek soruyu yanıtlayamıyor: "Bu reklam bana kâr ettiriyor mu?" İşte bu sorunun cevabı ROAS\'ta saklı. ROAS\'ı doğru okumayı öğrenirseniz reklamlarınızı körü körüne değil, veriye dayalı yönetirsiniz.',
      },
      {
        type: 'h2',
        content: 'ROAS Nedir?',
      },
      {
        type: 'p',
        content: 'ROAS (Return on Ad Spend — Reklam Harcamasının Geri Dönüşü), harcadığınız her 1 liranın kaç lira gelir ürettiğini gösterir. Formülü son derece basit:',
      },
      {
        type: 'tip',
        content: 'ROAS = Reklam Gelirleri ÷ Reklam Harcaması. Örnek: 10.000₺ harcayıp 40.000₺ satış yaptıysanız ROAS = 4 (4x veya %400 ROAS).',
      },
      {
        type: 'h2',
        content: 'Hedef ROAS Değeri Ne Olmalı?',
      },
      {
        type: 'p',
        content: 'Bu soru sektöre ve kâr marjınıza göre değişir. %20 kâr marjıyla çalışan bir e-ticaret işletmesi için 5x ROAS kırılsa kârsa, %50 marjla çalışan bir hizmet firması için 2x ROAS bile yeterli olabilir.',
      },
      {
        type: 'table',
        headers: ['Sektör', 'Ortalama Kâr Marjı', 'Minimum Hedef ROAS'],
        rows: [
          ['E-ticaret (giyim)', '%15 – %25', '4x – 6x'],
          ['E-ticaret (elektronik)', '%8 – %15', '7x – 12x'],
          ['Hizmet (danışmanlık)', '%40 – %70', '2x – 3x'],
          ['Gayrimenkul', '%3 – %8', '10x – 20x'],
          ['Restoran / Kafe', '%10 – %20', '4x – 8x'],
        ],
      },
      {
        type: 'h2',
        content: 'ROAS ile ROI Arasındaki Fark',
      },
      {
        type: 'p',
        content: 'ROAS ve ROI (Return on Investment) sık karıştırılır. ROAS sadece reklam harcamasını hesaba katar. ROI ise tüm maliyetleri (ürün maliyeti, kargo, işgücü, ajans ücreti dahil) göz önüne alır. Yüksek ROAS, mutlaka kârlı olduğunuz anlamına gelmez — ürün maliyetleriniz yüksekse ROAS 5x olsa bile zarar edebilirsiniz.',
      },
      {
        type: 'h2',
        content: 'ROAS Neden Düşük Çıkıyor? 5 Ana Sebep',
      },
      {
        type: 'ol',
        items: [
          'Yanlış hedefleme: Reklamı satın alacak insanlara değil, herkese gösteriyorsunuz.',
          'Zayıf landing page: Reklam tıklanıyor ama web siteniz dönüştürmüyor.',
          'Fiyat rekabeti: Rakipler aynı ürünü daha ucuza satıyorsa reklam tek başına çözüm değil.',
          'Yeterli bütçe yok: Algoritma öğrenme aşamasını tamamlayamıyor.',
          'Yanlış kampanya hedefi: "Marka bilinirliği" hedefiyle e-ticaret satışı beklemek.',
        ],
      },
      {
        type: 'h2',
        content: 'ROAS\'ı Artırmanın 5 Kanıtlanmış Yolu',
      },
      {
        type: 'ul',
        items: [
          'Retargeting kampanyaları: Sitenizi ziyaret edip alışveriş yapmayanları yeniden hedefleyin — bu kitle 3-5x daha yüksek ROAS üretir.',
          'Lookalike audience: Mevcut müşterilerinize benzer profiller oluşturun.',
          'Kreatif testi: En az 3-4 farklı görsel/video test edin, düşük performanslıyı kapatın.',
          'Landing page optimizasyonu: Sayfa hızı, güven unsurları ve CTA\'lar dönüşümü doğrudan etkiler.',
          'Sepet ortalamasını artırın: Upsell ve cross-sell ile aynı reklam daha yüksek gelir üretir.',
        ],
      },
      {
        type: 'h2',
        content: 'Meta Advantage+ ile ROAS Artışı',
      },
      {
        type: 'p',
        content: 'Meta\'nın Advantage+ Shopping kampanyaları, makine öğrenmesiyle otomatik olarak en yüksek ROAS üretecek kombinasyonları test eder. 2024\'ten itibaren birçok e-ticaret markası manuel kampanyalara kıyasla Advantage+ ile %20-40 daha yüksek ROAS elde ettiğini raporluyor. Ancak bu sistemin doğru kurulması için de uzmanlık gerekiyor.',
      },
      {
        type: 'cta_inline',
        content: 'Kampanyalarınızın ROAS değerini ücretsiz analiz etmemizi ister misiniz?',
      },
    ],
  },
  {
    slug: 'dijital-pazarlama-ajansi-nasil-secilir',
    title: 'Dijital Pazarlama Ajansı Nasıl Seçilir? 7 Kritik Soru',
    description: 'Reklam ajansı seçerken nelere dikkat etmeli? Fiyat, referans, raporlama ve sözleşme detayları. Yanlış ajans seçiminden kaçınmanın 7 sorusu.',
    keywords: ['dijital pazarlama ajansı nasıl seçilir', 'reklam ajansı seçimi', 'sosyal medya ajansı', 'dijital ajans önerileri'],
    date: '2025-05-05',
    readTime: '8 dk',
    category: 'Rehber',
    excerpt: 'Her ajans "sonuç garantisi" vaat ediyor. Ama hangisi gerçekten işinizi büyütür? Doğru ajansı bulmak için sormanız gereken 7 kritik soru.',
    sections: [
      {
        type: 'p',
        content: 'Türkiye\'de binlerce dijital pazarlama ajansı var. Her biri "en iyi sonuçları" vaat ediyor, her biri "deneyimli ekip" diyor. Peki doğru ajansı nasıl ayırt edeceksiniz? Yanlış seçim hem bütçenizi yakar hem de aylar kaybettirir. İşte doğru kararı vermek için ajansa sormanız gereken 7 kritik soru.',
      },
      {
        type: 'h2',
        content: '1. "Bizim Sektörde Referansınız Var mı?"',
      },
      {
        type: 'p',
        content: 'Sektör deneyimi, genel dijital pazarlama bilgisinden çok daha değerlidir. Gayrimenkul sektörü için çalışmış bir ajans, bir restoran zincirinin lead maliyetlerini nasıl optimize edeceğini bilmeyebilir. Referans isterken sadece logo listesi yetmez — somut sonuçlar isteyin: "Bu müşterinin lead başına maliyetini kaçtan kaça indirdiniz?"',
      },
      {
        type: 'h2',
        content: '2. "Raporlamayı Nasıl Yapıyorsunuz?"',
      },
      {
        type: 'p',
        content: 'İyi bir ajans, sonuçları şeffaf raporlar. Aylık rapor yerine gerçek zamanlı dashboard sunan ajanslar tercih edilmeli. Raporda sadece "gösterim" ve "beğeni" değil; leads, cost per lead, ROAS, conversion rate gibi iş sonuçlarına bağlı metrikler olmalı. Raporu anlamlandıramıyorsanız ajans sizi göz boyuyor olabilir.',
      },
      {
        type: 'tip',
        content: 'Ajans görüşmesinde şunu sorun: "Bir önceki müşterinizin Nisan raporunu görebilir miyim?" (isim gizlenmiş şekilde). Bunu gösteremeyen ajanslar muhtemelen raporlama yapmıyordur.',
      },
      {
        type: 'h2',
        content: '3. "Ekibinizde Kaç Kişi Çalışıyor ve Hesabımı Kim Yönetecek?"',
      },
      {
        type: 'p',
        content: 'Küçük ajanslar tek kişilik operasyonlar olabilir. Bu, anlık kriz dönemlerinde veya hastalık/izin durumlarında kampanyalarınızın sahipsiz kalması anlamına gelir. Hesabınızı yönetecek kişinin kim olduğunu öğrenin, mümkünse o kişiyle de görüşün. Ajans sahibiyle değil, sizinle gerçekte çalışacak kişiyle görüşmek çok önemlidir.',
      },
      {
        type: 'h2',
        content: '4. "Sonuç Garantisi Veriyor musunuz?"',
      },
      {
        type: 'p',
        content: '"Sonuç garantisi" veren ajanslardan dikkatli olun. Meta ve Google algoritmaları sürekli değişiyor, rekabet dinamikleri dalgalanıyor. Hiçbir ajans belirli bir lead sayısını veya ROAS değerini garantileyemez. Bunu vaat edenler ya deneyimsiz ya da sözleşmeyi okuyunca çok farklı bir tablo çıkan tuzaklı anlaşmalar yapıyordur.',
      },
      {
        type: 'h2',
        content: '5. "Ücretlendirme Modeliniz Nedir?"',
      },
      {
        type: 'ul',
        items: [
          'Sabit aylık ücret: Öngörülebilir maliyet, ama ajansın bütçenizi artırma teşviki az.',
          'Yönetim ücreti + reklam bütçesi ayrı: En yaygın model. Reklam bütçesi ajans üzerinden geçmiyorsa daha şeffaf.',
          'Performans bazlı (lead başına ücret): Teoride ideal, pratikte lead kalitesini düşürme riski var.',
          'Reklam bütçesinin yüzdesi (%10-20): Bütçeniz büyüdükçe ajans kazancı artar — çıkar uyumu iyi.',
        ],
      },
      {
        type: 'h2',
        content: '6. "Reklam Hesabı Kimin Adına Açılıyor?"',
      },
      {
        type: 'p',
        content: 'Bu kritik bir soru. Reklam hesabı işletmenizin Business Manager\'ında olmalı — ajansın hesabında değil. Ajans değiştirdiğinizde tüm kampanya geçmişi, pixel verisi ve kitle verisi sizde kalır. Aksi durumda ajansla ayrılırken sıfırdan başlamak zorunda kalırsınız.',
      },
      {
        type: 'h2',
        content: '7. "Sözleşme Süresi ve Çıkış Koşulları Neler?"',
      },
      {
        type: 'p',
        content: 'Yeni başlayan işbirliklerinde 3 aylık deneme süresi mantıklı. 12 aylık sözleşmelere dikkat edin — ilk 2 ay sonuç vermiyorsa kilitlenmiş olursunuz. İyi ajanslar genellikle 1-3 ay önceden bildirme koşuluyla serbest çıkışa izin verir.',
      },
      {
        type: 'tip',
        content: '404 Dijital\'de reklam hesapları her zaman müşterinin Business Manager\'ında açılır. Raporlama gerçek zamanlıdır ve minimum 3 aylık sözleşme ile çalışılır.',
      },
      {
        type: 'cta_inline',
        content: 'Mevcut ajansınızın performansını değerlendirmemizi ister misiniz? Ücretsiz audit için bize ulaşın.',
      },
    ],
  },
  {
    slug: 'instagram-reklam-hedefleme',
    title: 'Instagram Reklam Hedefleme: Doğru Kitleye Ulaşmanın Tam Rehberi',
    description: 'Instagram ve Meta Ads\'da kitle hedefleme nasıl yapılır? Custom audience, lookalike audience ve retargeting stratejileriyle dönüşümlerinizi artırın.',
    keywords: ['instagram reklam hedefleme', 'meta ads kitle hedefleme', 'custom audience nedir', 'lookalike audience', 'retargeting instagram'],
    date: '2025-04-28',
    readTime: '9 dk',
    category: 'Meta Ads',
    excerpt: 'Instagram reklamlarında hedef kitle doğru kurgulanmazsa en iyi kreatif bile işe yaramaz. Üç aşamalı hedefleme stratejisiyle maliyetleri düşürün.',
    sections: [
      {
        type: 'p',
        content: 'Meta Ads\'ın en güçlü tarafı kitle hedefleme. Ama bu güç yanlış kullanıldığında bütçenizi çarçur eder. "25-54 yaş, Türkiye, ilgi alanı: alışveriş" gibi geniş bir hedeflemeyle başlayan çoğu kampanya yüksek maliyet, düşük dönüşümle sonuçlanır. Doğru hedefleme stratejisi üç aşamada kurgulanır.',
      },
      {
        type: 'h2',
        content: 'Aşama 1: Soğuk Kitle (Cold Audience)',
      },
      {
        type: 'p',
        content: 'Soğuk kitle, sizi henüz tanımayan ama potansiyel müşteri olabilecek kişilerdir. Bu aşamada iki yaklaşım kullanılır: ilgi alanı hedefleme ve lookalike audience.',
      },
      {
        type: 'h3',
        content: 'İlgi Alanı Hedefleme',
      },
      {
        type: 'p',
        content: 'Meta\'nın kullanıcı davranışlarından türettiği ilgi alanı kategorilerini kullanırsınız. Ancak ilgi alanı hedefleme giderek daha az güvenilir hale geliyor — Meta, privacy güncellemeleri sonrası bu veriyi giderek daha az paylaşıyor. Tek başına kullanmak yerine lookalike ile kombine etmek daha etkili.',
      },
      {
        type: 'h3',
        content: 'Lookalike Audience (Benzer Kitle)',
      },
      {
        type: 'p',
        content: 'Mevcut müşterilerinizin, web sitenizi ziyaret edenlerin veya Instagram\'ı etkileşim kuranların profillerine benzer yeni kullanıcılar bulur. Lookalike\'ın kalitesi, kaynak kitlenizin kalitesine bağlı. 1.000+ kişilik gerçek müşteri listesiyle oluşturulan lookalike, 200 kişilik listeden çok daha iyi performans verir.',
      },
      {
        type: 'tip',
        content: 'Lookalike kitleyi %1 benzerlik oranıyla başlatın. %1 en benzer profilleri içerir ve genellikle en yüksek dönüşümü sağlar. Kitleyi genişletmek için %2-5 aralığına çıkabilirsiniz.',
      },
      {
        type: 'h2',
        content: 'Aşama 2: Sıcak Kitle (Warm Audience)',
      },
      {
        type: 'p',
        content: 'Sıcak kitle, markanızla daha önce temas kurmuş kullanıcılardır. Bu kitle çok daha değerlidir çünkü güven aşamasını kısmen geçmişlerdir.',
      },
      {
        type: 'ul',
        items: [
          'Web sitesi ziyaretçileri (son 30-60-90 gün)',
          'Instagram profilinizi takip edenler',
          'Reklamlarınızla etkileşime girenler (beğeni, yorum, kaydet)',
          'Video reklamlarınızı %50-75 izleyenler',
          'İletişim formunuzu görüntüleyenler ama doldurmayanlara',
        ],
      },
      {
        type: 'h2',
        content: 'Aşama 3: Retargeting (Yeniden Hedefleme)',
      },
      {
        type: 'p',
        content: 'Retargeting, dijital reklamcılığın en yüksek ROAS üretebilen stratejisidir. Sitenize gelip ürünü sepete ekleyen ama satın almayan kullanıcılara özel reklamlar göstererek geri kazanma oranı ciddi şekilde artırılabilir.',
      },
      {
        type: 'ol',
        items: [
          'Ürün sayfası ziyaretçileri → Özel teklif veya "sınırlı stok" mesajlı reklam',
          'Sepet terkedenleri → "Sepetinizde ürün var" hatırlatıcısı',
          'Ödeme sayfasını terk edenler → En kritik kitle, maksimum bütçe burada',
          'Geçmiş müşteriler → Cross-sell ve upsell kampanyaları',
        ],
      },
      {
        type: 'h2',
        content: 'Custom Audience Nasıl Oluşturulur?',
      },
      {
        type: 'p',
        content: 'Meta Ads Yöneticisi\'nde "Kitleler" bölümünden "Custom Audience" oluşturabilirsiniz. Kaynak olarak web sitesi (Meta Pixel gerektirir), müşteri listesi (e-posta veya telefon), uygulama aktivitesi veya Meta üzeri aktivite seçenekleri mevcut. Pixel kurulmamışsa web sitesi kitleleri oluşturulamaz — bu yüzden Meta Pixel kurulumu reklam vermeden önce yapılacak ilk iş olmalı.',
      },
      {
        type: 'h2',
        content: '2025\'te Hedefleme Trendleri: Advantage+ Audiences',
      },
      {
        type: 'p',
        content: 'Meta, giderek manuel hedeflemeyi kısıtlayıp yapay zeka destekli Advantage+ Audiences\'a yönlendiriyor. Bu sistem, manuel hedeflerinizi "öneri" olarak alıp daha geniş bir kitleye test ediyor. 2025\'te iyi sonuç almak için bu sistemi anlamak ve doğru kurgulamak gerekiyor.',
      },
      {
        type: 'cta_inline',
        content: 'Instagram reklam hesabınızın hedefleme yapısını ücretsiz analiz edelim mi?',
      },
    ],
  },
  {
    slug: 'google-ads-mi-meta-ads-mi',
    title: 'Google Ads mı, Meta Ads mı? İşletmenize Uygun Platform Hangisi?',
    description: 'Google Ads ve Meta Ads (Facebook/Instagram) arasındaki fark nedir? Hangi sektör için hangi platform daha iyi çalışır? 2025 karşılaştırması.',
    keywords: ['google ads meta ads farkı', 'google ads mı meta ads mı', 'hangi reklam platformu seçilmeli', 'facebook ads google ads karşılaştırma'],
    date: '2025-04-20',
    readTime: '7 dk',
    category: 'Strateji',
    excerpt: 'Google\'da arayanlar var, Instagram\'da ilham alanlar. Hangisi işinizi büyütür? Sektörünüze göre doğru platformu seçme rehberi.',
    sections: [
      {
        type: 'p',
        content: '"Google Ads mı Meta Ads mı yapmalıyız?" sorusu dijital pazarlamada en sık duyduğumuz sorulardan biri. Kısa cevap: ikisi de farklı şeyler yapar, ve seçim sektörünüze, hedeflerinize ve müşteri yolculuğunuza bağlı. Uzun cevap için okumaya devam edin.',
      },
      {
        type: 'h2',
        content: 'Temel Fark: "Talep Yakalama" vs "Talep Oluşturma"',
      },
      {
        type: 'p',
        content: 'Google Ads, mevcut talebi karşılar. "Su arıtma cihazı fiyatları" arayan birisi zaten satın almak istiyor — siz sadece o kişinin karşısına çıkarsınız. Meta Ads ise talep oluşturur. Kullanıcı ürününüzü aramıyor ama scroll ederken reklamınızı görüp ihtiyaç duyduğunu fark ediyor.',
      },
      {
        type: 'table',
        headers: ['Özellik', 'Google Ads', 'Meta Ads'],
        rows: [
          ['Yaklaşım', 'Talep yakalama', 'Talep oluşturma'],
          ['Kullanıcı niyeti', 'Yüksek (aktif arama)', 'Düşük-orta (pasif keşif)'],
          ['En iyi olduğu yer', 'Doğrudan satış, lead', 'Marka bilinirliği, keşif'],
          ['Görsel önem', 'Düşük (metin ağırlıklı)', 'Çok yüksek'],
          ['Minimum bütçe', 'Sektöre göre değişir', 'Daha esnek'],
          ['Öğrenme eğrisi', 'Yüksek', 'Orta'],
        ],
      },
      {
        type: 'h2',
        content: 'Google Ads\'ın Güçlü Olduğu Alanlar',
      },
      {
        type: 'ul',
        items: [
          'Hizmet sektörü (tesisatçı, avukat, doktor, tamirci): Müşteriler acil ihtiyaçla arama yapıyor.',
          'B2B yazılım ve SaaS: Karar vericiler araştırma yaparak satın alıyor.',
          'Yerel işletmeler (Google My Business entegrasyonu çok güçlü)',
          'Yüksek bilinç seviyesi gerektiren ürünler: Müşteri ne istediğini biliyor.',
          'E-ticaret (Google Shopping): Ürün görseli + fiyat direkt arama sonuçlarında görünür.',
        ],
      },
      {
        type: 'h2',
        content: 'Meta Ads\'ın Güçlü Olduğu Alanlar',
      },
      {
        type: 'ul',
        items: [
          'Moda ve yaşam tarzı ürünleri: Görsel odaklı platformda mükemmel çalışır.',
          'Dürtüsel satın alınan ürünler: Fiyatı görünce "neden olmasın" dedirten ürünler.',
          'Yeni marka farkındalığı: Google\'da aranmayan markayı insanlara tanıtmak.',
          'Genç demografi (18-35 yaş): Instagram ve Facebook\'ta aktifler.',
          'Etkinlik ve organizasyon tanıtımı: Geniş kitleye hızlı duyuru.',
        ],
      },
      {
        type: 'h2',
        content: 'Sektöre Göre Öneri',
      },
      {
        type: 'table',
        headers: ['Sektör', 'Birincil Platform', 'İkincil Platform'],
        rows: [
          ['Restoran / Kafe', 'Meta Ads', 'Google (Maps)'],
          ['Hukuk / Muhasebe', 'Google Ads', 'Meta (retargeting)'],
          ['Moda / Giyim', 'Meta Ads', 'Google Shopping'],
          ['Gayrimenkul', 'Meta Ads (lead)', 'Google Ads'],
          ['Kozmetik / Güzellik', 'Meta Ads', 'Google Ads'],
          ['Yazılım / SaaS', 'Google Ads', 'LinkedIn'],
          ['E-ticaret (genel)', 'Her ikisi birlikte', '—'],
        ],
      },
      {
        type: 'h2',
        content: 'İkisini Birlikte Kullanmak: Full-Funnel Strateji',
      },
      {
        type: 'p',
        content: 'En güçlü yaklaşım, iki platformu birlikte kullanmaktır. Meta Ads\'ı farkındalık ve ilgi aşaması için kullanın — geniş kitleye ulaşın, marka bilinirliği oluşturun. Sonra bu kitleyi Google Ads\'la arama aşamasında yakalayın. Meta\'da reklamınızı gören biri birkaç gün sonra Google\'da sizi aratır — ve siz orada da karşısına çıkarsınız. Bu synergy hem maliyeti düşürür hem de dönüşüm oranını artırır.',
      },
      {
        type: 'h2',
        content: 'Hangisinden Başlamalı?',
      },
      {
        type: 'p',
        content: 'Bütçeniz kısıtlıysa önce bir platformda güçlenin. Hizmet sektörüyseniz Google Ads\'la başlayın — aktif arayan müşteriye ulaşmak daha hızlı sonuç verir. Ürün satıyorsanız ve görsellik güçlüyse Meta Ads daha verimli başlangıç noktası olacaktır.',
      },
      {
        type: 'cta_inline',
        content: 'İşletmeniz için hangi platformun daha verimli olacağını birlikte analiz edelim.',
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function getRelatedPosts(slug: string, count = 2): BlogPost[] {
  return BLOG_POSTS.filter(p => p.slug !== slug).slice(0, count)
}
