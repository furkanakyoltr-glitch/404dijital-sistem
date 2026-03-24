"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, ArrowLeft, Send } from 'lucide-react'
import { generateKasaNo, generatePassword } from '@/lib/utils'

const STEPS = ['Firma Bilgileri', 'Paket Seçimi', 'İş Listesi', 'Ek Giderler', 'Fiyatlandırma', 'Kasa & Şifre']

const PAKET_DATA: Record<string, { fiyat: number; isler: string[] }> = {
  'ciro-giris': { fiyat: 35000, isler: ['6 Reels Videosu', '12 Grafik Tasarım', 'Reklam Hesabı Kontrolü', 'Özel Satış Stratejisi', 'Aylık Performans Raporu'] },
  'ciro-gold': { fiyat: 50000, isler: ['8 Reels Videosu', '16 Grafik Tasarım', 'Gelişmiş Reklam Yönetimi', '6-12 Aylık Yol Haritası', 'Rakip Analizi', 'A/B Test Optimizasyonu'] },
  'ciro-platinum': { fiyat: 75000, isler: ['12 Reels Videosu', '24 Grafik Tasarım', 'Tam Reklam Yönetimi', 'Influencer Koordinasyonu', 'Öncelikli Destek Hattı'] },
  'sosyal-giris': { fiyat: 30000, isler: ['4 Reels / Kısa Video', '12 Feed Görseli', 'Instagram & Facebook Yönetimi', 'Etiket & Hashtag Stratejisi', 'Aylık İçerik Takvimi'] },
  'sosyal-gold': { fiyat: 45000, isler: ['8 Reels / Kısa Video', '20 Feed Görseli', 'TikTok + Instagram + Facebook', 'Topluluk Yönetimi', 'Rakip İzleme Raporu', 'Story & Highlights Tasarımı'] },
  'sosyal-platinum': { fiyat: 65000, isler: ['14 Reels + 2 Uzun Form Video', '30 Feed Görseli', '5 Platform', '7/24 Topluluk Yönetimi', 'Aylık Büyüme Strateji Sunumu', 'Influencer İşbirlikleri'] },
  '360-gold': { fiyat: 50000, isler: ['Sosyal Medya Yönetimi', 'Google & Meta Reklam Yönetimi', 'E-posta Pazarlama Otomasyonu', 'SEO Temel Optimizasyon', 'Marka Tutarlılığı Denetimi'] },
  '360-pro': { fiyat: 75000, isler: ['Gold özellikleri', 'Satış Hunisi Tasarımı', 'CRM Entegrasyonu', 'SMS & WhatsApp Kampanyaları', 'Conversion Rate Optimizasyonu', 'Haftalık Performans Toplantısı'] },
  '360-platinum': { fiyat: 110000, isler: ['Pro özellikleri', 'Özel Marka Stratejisti', 'PR & Medya İlişkileri', 'Lansmanlar & Etkinlik Pazarlaması', 'Yıllık Büyüme Planı', 'Öncelikli Yönetici Destek Hattı'] },
  'eticaret': { fiyat: 20000, isler: ['Ürün Odaklı Performans Reklamları', 'Satış Başına Prim Modeli', 'ROAS Garantili Strateji', 'Dinamik Ürün Reklamları'] },
}

interface FormData {
  // Step 1
  firmaAdi: string; yetkiliKisi: string; yetkiliUnvan: string; telefon: string
  email: string; adres: string; vergiDairesi: string; vergiNo: string; notlar: string
  // Step 2
  paketKategori: string; paketKey: string; paketAdi: string
  // Step 3
  islerListesi: { is: string; tamamlandi: boolean }[]
  // Step 4
  ekGiderler: { aciklama: string; tutar: number }[]
  // Step 5
  fiyat: number; indirim: number; indirimTipi: 'yuzde' | 'sabit'; kdvOrani: number; gecerlilikTarihi: string; odemeKosullari: string; stratejiNotu: string
  // Step 6
  kasaNo: string; sifre: string; sendEmail: boolean
}

export default function TeklifOlusturPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ kasaNo: string; sifre: string } | null>(null)

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 30)

  const [form, setForm] = useState<FormData>({
    firmaAdi: '', yetkiliKisi: '', yetkiliUnvan: '', telefon: '', email: '',
    adres: 'Çınarlı 1572/1. Sk. No:33 35170 Konak/İzmir', vergiDairesi: '', vergiNo: '', notlar: '',
    paketKategori: '', paketKey: '', paketAdi: '',
    islerListesi: [],
    ekGiderler: [],
    fiyat: 0, indirim: 0, indirimTipi: 'sabit', kdvOrani: 20,
    gecerlilikTarihi: defaultDate.toISOString().split('T')[0], odemeKosullari: 'Peşin', stratejiNotu: '',
    kasaNo: generateKasaNo(), sifre: generatePassword(), sendEmail: true,
  })

  const setField = (field: keyof FormData, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const selectPaket = (key: string, kategori: string, ad: string) => {
    const data = PAKET_DATA[key]
    if (!data) return
    setForm(prev => ({
      ...prev,
      paketKey: key, paketKategori: kategori, paketAdi: ad,
      fiyat: data.fiyat,
      islerListesi: data.isler.map(is => ({ is, tamamlandi: false })),
    }))
  }

  const araToplam = form.fiyat + form.ekGiderler.reduce((s, e) => s + (e.tutar || 0), 0)
  const indirimTutari = form.indirimTipi === 'yuzde' ? araToplam * form.indirim / 100 : form.indirim
  const kdvMatrahi = araToplam - indirimTutari
  const kdvTutari = kdvMatrahi * form.kdvOrani / 100
  const genelToplam = kdvMatrahi + kdvTutari

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/teklif/olustur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, toplam: genelToplam }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ kasaNo: data.kasaNo, sifre: data.sifre })
        setSubmitted(true)
      }
    } catch (err) {
      alert('Teklif oluşturulamadı. Konsolu kontrol et.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-10 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-bebas text-3xl tracking-wider text-[#1a1a1a] mb-2">TEKLİF OLUŞTURULDU!</h2>
          <p className="text-[#555] font-montserrat mb-6">{form.firmaAdi} için teklif başarıyla oluşturuldu.</p>
          <div className="bg-[#1a1a1a] text-white rounded-xl p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-3 font-mono text-sm">
              <span className="text-gray-400">Kasa No:</span><span className="text-[#ffc107] font-bold">{result.kasaNo}</span>
              <span className="text-gray-400">Şifre:</span><span className="text-white font-bold">{result.sifre}</span>
              <span className="text-gray-400">Müşteri:</span><span className="text-white">{form.firmaAdi}</span>
              <span className="text-gray-400">Toplam:</span><span className="text-white">₺{genelToplam.toLocaleString('tr-TR')}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/admin/musteriler')} className="btn-primary">MÜŞTERİLERE GİT</button>
            <button onClick={() => { setSubmitted(false); setStep(0); setForm(prev => ({ ...prev, kasaNo: generateKasaNo(), sifre: generatePassword() })) }} className="border-2 border-[#1a1a1a] text-[#1a1a1a] rounded-full px-6 py-2.5 font-montserrat font-bold text-sm hover:bg-[#1a1a1a] hover:text-white transition-all">
              YENİ TEKLİF
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-[#1a1a1a] text-white' : i === step ? 'bg-[#ffc107] text-black' : 'bg-[#f0f0f0] text-[#999]'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-montserrat font-semibold hidden sm:block ${i === step ? 'text-[#1a1a1a]' : 'text-[#999]'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-6 h-px mx-1 ${i < step ? 'bg-[#1a1a1a]' : 'bg-[#eaeaea]'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] p-8">
        <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-6">ADIM {step + 1}: {STEPS[step].toUpperCase()}</h2>

        {/* Step 1: Firma Bilgileri */}
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Firma Adı *', field: 'firmaAdi', required: true },
              { label: 'Yetkili Kişi *', field: 'yetkiliKisi', required: true },
              { label: 'Unvan', field: 'yetkiliUnvan' },
              { label: 'Telefon *', field: 'telefon', type: 'tel', required: true },
              { label: 'E-Posta *', field: 'email', type: 'email', required: true },
              { label: 'Vergi Dairesi', field: 'vergiDairesi' },
              { label: 'Vergi No', field: 'vergiNo' },
            ].map(({ label, field, type = 'text', required }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">{label}</label>
                <input
                  type={type}
                  value={(form as any)[field]}
                  onChange={e => setField(field as any, e.target.value)}
                  required={required}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Adres</label>
              <input type="text" value={form.adres} onChange={e => setField('adres', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Notlar</label>
              <textarea rows={3} value={form.notlar} onChange={e => setField('notlar', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none" />
            </div>
          </div>
        )}

        {/* Step 2: Paket Seçimi */}
        {step === 1 && (
          <div className="space-y-4">
            {[
              { kategori: 'Ciro Artırma', paketler: [{ key: 'ciro-giris', ad: 'Giriş Paketi', fiyat: 35000 }, { key: 'ciro-gold', ad: 'Gold Paket', fiyat: 50000 }, { key: 'ciro-platinum', ad: 'Platinum Paket', fiyat: 75000 }] },
              { kategori: 'Sosyal Medya', paketler: [{ key: 'sosyal-giris', ad: 'Giriş', fiyat: 30000 }, { key: 'sosyal-gold', ad: 'Gold', fiyat: 45000 }, { key: 'sosyal-platinum', ad: 'Platinum', fiyat: 65000 }] },
              { kategori: '360 Pazarlama', paketler: [{ key: '360-gold', ad: '360 Gold', fiyat: 50000 }, { key: '360-pro', ad: '360 Pro', fiyat: 75000 }, { key: '360-platinum', ad: '360 Platinum', fiyat: 110000 }] },
              { kategori: 'E-Ticaret', paketler: [{ key: 'eticaret', ad: 'E-Ticaret Paketi', fiyat: 20000 }] },
            ].map(({ kategori, paketler }) => (
              <div key={kategori}>
                <h3 className="font-bebas text-lg tracking-wider text-[#1a1a1a] mb-2">{kategori}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paketler.map(p => (
                    <button
                      key={p.key}
                      onClick={() => selectPaket(p.key, kategori, p.ad)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${form.paketKey === p.key ? 'border-[#1a1a1a] bg-[#f8f9fa]' : 'border-[#eaeaea] hover:border-[#1a1a1a]/30'}`}
                    >
                      <p className="font-montserrat font-bold text-sm text-[#1a1a1a]">{p.ad}</p>
                      <p className="font-bebas text-xl text-[#1a1a1a] mt-1">₺{p.fiyat.toLocaleString('tr-TR')}/ay</p>
                      {form.paketKey === p.key && <span className="text-xs text-[#1a1a1a] font-bold">✓ SEÇİLDİ</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: İş Listesi */}
        {step === 2 && (
          <div className="space-y-3">
            {form.islerListesi.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.is}
                  onChange={e => {
                    const updated = [...form.islerListesi]
                    updated[i] = { ...updated[i], is: e.target.value }
                    setField('islerListesi', updated)
                  }}
                  className="flex-1 border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                />
                <button
                  onClick={() => setField('islerListesi', form.islerListesi.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 p-2"
                >✕</button>
              </div>
            ))}
            <button
              onClick={() => setField('islerListesi', [...form.islerListesi, { is: '', tamamlandi: false }])}
              className="flex items-center gap-2 text-sm font-montserrat text-[#555] hover:text-[#1a1a1a] border border-dashed border-[#ccc] rounded-xl px-4 py-3 w-full transition-colors hover:border-[#1a1a1a]"
            >
              + Yeni İş Ekle
            </button>
          </div>
        )}

        {/* Step 4: Ek Giderler */}
        {step === 3 && (
          <div className="space-y-3">
            {form.ekGiderler.map((eg, i) => (
              <div key={i} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Açıklama (örn: Stok fotoğraf)"
                  value={eg.aciklama}
                  onChange={e => {
                    const updated = [...form.ekGiderler]
                    updated[i] = { ...updated[i], aciklama: e.target.value }
                    setField('ekGiderler', updated)
                  }}
                  className="flex-1 border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                />
                <input
                  type="number"
                  placeholder="Tutar (₺)"
                  value={eg.tutar || ''}
                  onChange={e => {
                    const updated = [...form.ekGiderler]
                    updated[i] = { ...updated[i], tutar: parseFloat(e.target.value) || 0 }
                    setField('ekGiderler', updated)
                  }}
                  className="w-32 border border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                />
                <button onClick={() => setField('ekGiderler', form.ekGiderler.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 p-2">✕</button>
              </div>
            ))}
            <button
              onClick={() => setField('ekGiderler', [...form.ekGiderler, { aciklama: '', tutar: 0 }])}
              className="flex items-center gap-2 text-sm font-montserrat text-[#555] hover:text-[#1a1a1a] border border-dashed border-[#ccc] rounded-xl px-4 py-3 w-full transition-colors hover:border-[#1a1a1a]"
            >
              + Ek Gider Ekle
            </button>
            {form.ekGiderler.length > 0 && (
              <div className="bg-[#f8f9fa] rounded-xl p-4 text-right">
                <p className="text-sm font-montserrat text-[#555]">Toplam Ek Gider: <strong className="text-[#1a1a1a]">₺{form.ekGiderler.reduce((s, e) => s + (e.tutar || 0), 0).toLocaleString('tr-TR')}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Fiyatlandırma */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Paket Fiyatı (₺)</label>
                <input type="number" value={form.fiyat} onChange={e => setField('fiyat', parseFloat(e.target.value) || 0)}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">KDV Oranı (%)</label>
                <select value={form.kdvOrani} onChange={e => setField('kdvOrani', parseFloat(e.target.value))}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                  <option value={1}>%1</option><option value={8}>%8</option><option value={18}>%18</option><option value={20}>%20</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">İndirim Tipi</label>
                <div className="flex gap-2">
                  <button onClick={() => setField('indirimTipi', 'sabit')} className={`flex-1 py-2.5 rounded-xl text-sm font-montserrat font-semibold border-2 transition-all ${form.indirimTipi === 'sabit' ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#eaeaea] text-[#555]'}`}>₺ Sabit</button>
                  <button onClick={() => setField('indirimTipi', 'yuzde')} className={`flex-1 py-2.5 rounded-xl text-sm font-montserrat font-semibold border-2 transition-all ${form.indirimTipi === 'yuzde' ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#eaeaea] text-[#555]'}`}>% Yüzde</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">İndirim {form.indirimTipi === 'yuzde' ? '(%)' : '(₺)'}</label>
                <input type="number" value={form.indirim} onChange={e => setField('indirim', parseFloat(e.target.value) || 0)}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Geçerlilik Tarihi</label>
                <input type="date" value={form.gecerlilikTarihi} onChange={e => setField('gecerlilikTarihi', e.target.value)}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Ödeme Koşulları</label>
                <select value={form.odemeKosullari} onChange={e => setField('odemeKosullari', e.target.value)}
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]">
                  <option>Peşin</option><option>Taksit (3 ay)</option><option>Taksit (6 ay)</option><option>Aylık</option>
                </select>
              </div>
            </div>
            {/* Strateji Notu */}
            <div className="md:col-span-2 mt-2">
              <label className="block text-xs font-semibold text-[#333] mb-1 font-montserrat uppercase tracking-wider">Strateji Notu / Müşteri Açıklaması</label>
              <textarea
                rows={5}
                placeholder="Müşteri hakkında detaylı strateji notları, hedefler, özel istekler, yapılacak işler hakkında açıklama..."
                value={form.stratejiNotu}
                onChange={e => setField('stratejiNotu', e.target.value)}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none"
              />
              <p className="text-xs text-[#999] mt-1 font-montserrat">Bu not teklif sayfasında görüntülenir ve PDF'e dahil edilir.</p>
            </div>

            {/* Özet */}
            <div className="bg-[#f8f9fa] rounded-xl p-5 space-y-2 text-sm font-montserrat">
              <div className="flex justify-between text-[#555]"><span>Paket Ücreti</span><span>₺{form.fiyat.toLocaleString('tr-TR')}</span></div>
              {form.ekGiderler.length > 0 && <div className="flex justify-between text-[#555]"><span>Ek Giderler</span><span>₺{form.ekGiderler.reduce((s, e) => s + (e.tutar || 0), 0).toLocaleString('tr-TR')}</span></div>}
              <div className="flex justify-between text-[#555]"><span>Ara Toplam</span><span>₺{araToplam.toLocaleString('tr-TR')}</span></div>
              {indirimTutari > 0 && <div className="flex justify-between text-green-600"><span>İndirim</span><span>-₺{indirimTutari.toLocaleString('tr-TR')}</span></div>}
              <div className="flex justify-between text-[#555]"><span>KDV (%{form.kdvOrani})</span><span>₺{kdvTutari.toLocaleString('tr-TR')}</span></div>
              <div className="flex justify-between text-[#1a1a1a] font-bold text-base border-t border-[#eaeaea] pt-2 mt-2"><span>GENEL TOPLAM</span><span>₺{genelToplam.toLocaleString('tr-TR')}</span></div>
            </div>
          </div>
        )}

        {/* Step 6: Kasa & Şifre */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] text-white rounded-xl p-6">
              <h3 className="font-bebas text-xl tracking-wider text-[#ffc107] mb-4">MÜŞTERİ GİRİŞ BİLGİLERİ</h3>
              <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Kasa No</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.kasaNo}
                      onChange={e => setField('kasaNo', e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffc107]"
                    />
                    <button onClick={() => setField('kasaNo', generateKasaNo())} className="text-xs px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300">
                      YENİ
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Şifre</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.sifre}
                      onChange={e => setField('sifre', e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ffc107]"
                    />
                    <button onClick={() => setField('sifre', generatePassword())} className="text-xs px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300">
                      YENİ
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="sendEmail" checked={form.sendEmail} onChange={e => setField('sendEmail', e.target.checked)} className="w-4 h-4 rounded" />
              <label htmlFor="sendEmail" className="text-sm font-montserrat text-[#555]">
                Müşteriye teklif e-postası gönder ({form.email})
              </label>
            </div>
            <div className="bg-[#f8f9fa] rounded-xl p-5 space-y-2 text-sm font-montserrat">
              <p className="font-semibold text-[#1a1a1a] mb-2">TEKLİF ÖZETİ:</p>
              <div className="flex justify-between text-[#555]"><span>Firma</span><span>{form.firmaAdi}</span></div>
              <div className="flex justify-between text-[#555]"><span>Paket</span><span>{form.paketAdi}</span></div>
              <div className="flex justify-between font-bold text-[#1a1a1a]"><span>Toplam</span><span>₺{genelToplam.toLocaleString('tr-TR')}</span></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 border-2 border-[#eaeaea] text-[#555] rounded-full px-6 py-2.5 font-montserrat font-bold text-sm hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-all disabled:opacity-30"
          >
            <ArrowLeft size={16} /> GERİ
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(prev => Math.min(STEPS.length - 1, prev + 1))}
              className="btn-primary flex items-center gap-2"
            >
              İLERİ <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
              style={{ background: '#22c55e' }}
            >
              <Send size={16} />
              {loading ? 'OLUŞTURULUYOR...' : 'TEKLİFİ OLUŞTUR'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
