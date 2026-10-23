"use client"
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Pencil, Users, Loader2, MessageCircle, Trello, Copy, Check } from 'lucide-react'

type EkipUyesi = {
  id: string
  name: string
  email: string
  departman: string
  role: string
  telefon?: string | null
  createdAt: string
}

const DEPARTMANLAR = [
  { deger: 'yonetim', etiket: 'Yönetim' },
  { deger: 'satis', etiket: 'Satış' },
  { deger: 'sosyal_medya', etiket: 'Sosyal Medya' },
  { deger: 'reklam', etiket: 'Reklam (Paid Ads)' },
  { deger: 'creative', etiket: 'Creative (Viral İçerik)' },
  { deger: 'video_produksiyon', etiket: 'Video Prodüksiyon' },
  { deger: 'muhasebe', etiket: 'Muhasebe' },
  { deger: 'tasarim', etiket: 'Tasarım / Kreatif' },
]

const departmanEtiket = (deger: string) => DEPARTMANLAR.find(d => d.deger === deger)?.etiket || deger

function waLinkOlustur(telefon: string, mesaj: string) {
  const temizTel = telefon.replace(/\s+/g, '').replace(/^\+/, '').replace(/^0/, '90')
  return `https://wa.me/${temizTel}?text=${encodeURIComponent(mesaj)}`
}

export default function EkipPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const departman = (session?.user as any)?.departman

  const [ekip, setEkip] = useState<EkipUyesi[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yeniAcik, setYeniAcik] = useState(false)
  const [duzenlenen, setDuzenlenen] = useState<EkipUyesi | null>(null)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hata, setHata] = useState('')
  const [kopyalandi, setKopyalandi] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefon, setTelefon] = useState('')
  const [secilenDepartman, setSecilenDepartman] = useState('sosyal_medya')
  const [role, setRole] = useState('uye')

  // Yeni oluşturulan üye için WhatsApp onay ekranı
  const [olusturulan, setOlusturulan] = useState<{ name: string; departman: string; role: string; email: string; telefon: string; sifre: string } | null>(null)

  const veriGetir = () => {
    setYukleniyor(true)
    fetch('/api/ekip')
      .then(res => res.json())
      .then(data => setEkip(data.data || []))
      .finally(() => setYukleniyor(false))
  }
  useEffect(() => { veriGetir() }, [])

  const formuSifirla = () => {
    setName(''); setEmail(''); setPassword(''); setTelefon(''); setSecilenDepartman('sosyal_medya'); setRole('uye')
    setHata(''); setYeniAcik(false); setDuzenlenen(null)
  }

  const kaydet = async () => {
    setKaydediliyor(true)
    setHata('')
    try {
      if (duzenlenen) {
        const body: any = { name, departman: secilenDepartman, role, telefon }
        if (password.trim()) body.password = password
        const res = await fetch(`/api/ekip/${duzenlenen.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Hata oluştu') }
        formuSifirla()
        veriGetir()
      } else {
        const res = await fetch('/api/ekip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, departman: secilenDepartman, role, telefon }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Hata oluştu') }
        setOlusturulan({ name, departman: secilenDepartman, role, email, telefon, sifre: password })
        formuSifirla()
        veriGetir()
      }
    } catch (e: any) {
      setHata(e.message || 'Hata oluştu')
    } finally {
      setKaydediliyor(false)
    }
  }

  const duzenlemeyeBasla = (uye: EkipUyesi) => {
    setDuzenlenen(uye)
    setName(uye.name)
    setEmail(uye.email)
    setPassword('')
    setTelefon(uye.telefon || '')
    setSecilenDepartman(uye.departman)
    setRole(uye.role)
    setYeniAcik(true)
  }

  const sil = async (uye: EkipUyesi) => {
    if (!confirm(`${uye.name} ekipten çıkarılsın mı?`)) return
    const res = await fetch(`/api/ekip/${uye.id}`, { method: 'DELETE' })
    if (res.ok) veriGetir()
    else { const d = await res.json(); alert(d.error || 'Silinemedi') }
  }

  const gorevAta = (uye: EkipUyesi) => {
    router.push(`/admin/panolar?atananId=${uye.id}&atananAdi=${encodeURIComponent(uye.name)}&departman=${uye.departman}`)
  }

  const girisMesaji = (o: typeof olusturulan) => {
    if (!o) return ''
    return `Merhaba ${o.name}, 404 Dijital admin paneline hoş geldin!\n\nGiriş bilgilerin:\nSite: https://admin.404dijital.com\nE-posta: ${o.email}\nŞifre: ${o.sifre}\n\nDepartman: ${departmanEtiket(o.departman)}\n\nİlk girişte şifreni değiştirmeni öneririz.`
  }

  const kopyala = () => {
    navigator.clipboard.writeText(girisMesaji(olusturulan))
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  if (departman && departman !== 'yonetim') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <p className="text-[#999] font-montserrat">Bu sayfayı görme yetkin yok.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-[#1a1a1a]" />
          <h2 className="font-montserrat font-bold text-lg text-[#1a1a1a]">Ekip Yönetimi</h2>
        </div>
        <button
          onClick={() => { formuSifirla(); setYeniAcik(true) }}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl text-sm font-montserrat font-semibold"
        >
          <Plus size={16} /> Yeni Ekip Üyesi
        </button>
      </div>

      {yukleniyor ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#999]" /></div>
      ) : (
        <div className="bg-white border border-[#eaeaea] rounded-xl overflow-hidden">
          <table className="w-full text-sm font-montserrat">
            <thead>
              <tr className="bg-[#f8f9fa] text-[#777] text-xs uppercase">
                <th className="text-left px-4 py-3">İsim</th>
                <th className="text-left px-4 py-3">E-posta</th>
                <th className="text-left px-4 py-3">Departman</th>
                <th className="text-left px-4 py-3">Yetki</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ekip.map(uye => (
                <tr key={uye.id} className="border-t border-[#eaeaea]">
                  <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{uye.name}</td>
                  <td className="px-4 py-3 text-[#555]">{uye.email}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#f0f0f0] text-[#555] px-2 py-1 rounded-lg text-xs font-semibold">{departmanEtiket(uye.departman)}</span>
                  </td>
                  <td className="px-4 py-3 text-[#555]">{uye.role === 'admin' ? 'Tam Yetki' : 'Üye'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => gorevAta(uye)} title="Görev Ata" className="p-1.5 hover:bg-[#f0f0f0] rounded-lg text-[#555]"><Trello size={14} /></button>
                      <button onClick={() => duzenlemeyeBasla(uye)} title="Düzenle" className="p-1.5 hover:bg-[#f0f0f0] rounded-lg text-[#555]"><Pencil size={14} /></button>
                      <button onClick={() => sil(uye)} title="Sil" className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yeni/Düzenle modal */}
      {yeniAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-[#1a1a1a]">{duzenlenen ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi'}</h3>
              <button onClick={formuSifirla}><X size={18} className="text-[#999]" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="İsim Soyisim" value={name} onChange={e => setName(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]" />
              <input placeholder="E-posta" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!duzenlenen}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a] disabled:bg-[#f8f9fa] disabled:text-[#999]" />
              <input placeholder="Telefon (WhatsApp, örn: 0532 123 45 67)" value={telefon} onChange={e => setTelefon(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]" />
              <input placeholder={duzenlenen ? 'Yeni şifre (değiştirmek istemiyorsan boş bırak)' : 'Şifre'} type="text" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]" />
              <select value={secilenDepartman} onChange={e => setSecilenDepartman(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]">
                {DEPARTMANLAR.map(d => <option key={d.deger} value={d.deger}>{d.etiket}</option>)}
              </select>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full border-2 border-[#eaeaea] rounded-xl px-4 py-2.5 text-sm font-montserrat focus:outline-none focus:border-[#1a1a1a]">
                <option value="uye">Üye (sadece kendi departmanı)</option>
                <option value="admin">Tam Yetki (tüm departmanları görür)</option>
              </select>
              {hata && <p className="text-red-500 text-xs font-montserrat">{hata}</p>}
              <button onClick={kaydet} disabled={kaydediliyor || !name.trim() || !email.trim() || (!duzenlenen && !password.trim())}
                className="w-full bg-[#1a1a1a] text-white font-montserrat font-bold text-sm py-3 rounded-xl disabled:opacity-50">
                {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Oluşturma sonrası onay + WhatsApp gönderim */}
      {olusturulan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-montserrat font-bold text-[#1a1a1a]">✅ Eklendi</h3>
              <button onClick={() => setOlusturulan(null)}><X size={18} className="text-[#999]" /></button>
            </div>
            <p className="text-sm font-montserrat text-[#1a1a1a] mb-1">
              <span className="font-bold">{olusturulan.name}</span> — {departmanEtiket(olusturulan.departman)}
              <span className="text-[#999]"> ({olusturulan.role === 'admin' ? 'Tam Yetki' : 'Üye'})</span>
            </p>
            <div className="bg-[#f8f9fa] rounded-xl p-3 my-3 text-xs font-montserrat text-[#555] whitespace-pre-line">
              {girisMesaji(olusturulan)}
            </div>
            <div className="flex gap-2">
              {olusturulan.telefon ? (
                <a href={waLinkOlustur(olusturulan.telefon, girisMesaji(olusturulan))} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-montserrat font-bold text-sm py-3 rounded-xl">
                  <MessageCircle size={16} /> WhatsApp'tan Gönder
                </a>
              ) : (
                <p className="flex-1 text-xs text-amber-600 font-montserrat">Telefon girilmedi, WhatsApp linki yok — metni kopyala, elle gönder.</p>
              )}
              <button onClick={kopyala} className="flex items-center justify-center gap-2 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] font-montserrat font-bold text-sm py-3 px-4 rounded-xl">
                {kopyalandi ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
