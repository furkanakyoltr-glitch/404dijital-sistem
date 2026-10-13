"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MapPin, Hash, Copy, Check, KeyRound } from 'lucide-react'
import { KanbanBoard } from '@/components/ui/kanban-board'
import { TimelineGantt } from '@/components/ui/timeline-gantt'
import { TodoList } from '@/components/ui/todo-list'

export default function MusteriDetayPage() {
  const { id } = useParams()
  const [musteri, setMusteri] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<'link' | 'sifre' | null>(null)
  const [sifirlaniyor, setSifirlaniyor] = useState(false)
  const [yeniSifre, setYeniSifre] = useState<string | null>(null)

  const kasaLinki = musteri ? `https://teklif.404dijital.com/kasa/${musteri.kasaNo}?token=${musteri.magicToken}` : ''

  const kopyala = (text: string, tip: 'link' | 'sifre') => {
    navigator.clipboard.writeText(text)
    setCopied(tip)
    setTimeout(() => setCopied(null), 2000)
  }

  const sifreSifirla = async () => {
    if (!confirm('Mevcut şifre geçersiz olacak ve yeni bir şifre oluşturulacak. Devam edilsin mi?')) return
    setSifirlaniyor(true)
    try {
      const res = await fetch(`/api/musteriler/${id}/sifre-sifirla`, { method: 'POST' })
      const data = await res.json()
      if (data.success) setYeniSifre(data.sifre)
      else alert(data.error || 'Şifre sıfırlanamadı')
    } finally {
      setSifirlaniyor(false)
    }
  }

  useEffect(() => {
    fetch(`/api/musteriler/${id}`)
      .then(r => r.json())
      .then(setMusteri)
      .catch(() => setMusteri({
        id, firmaAdi: 'Demo Firma A.Ş.', yetkiliKisi: 'Ahmet Yılmaz',
        telefon: '+90 555 111 22 33', email: 'demo@firma.com',
        adres: 'İstanbul', kasaNo: '404-001', durum: 'aktif',
        teklifler: [{ paketAdi: 'Gold Paket', toplam: 60000, durum: 'onaylandi' }]
      }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-[#1a1a1a] border-t-transparent rounded-full"></div></div>
  if (!musteri) return <div className="text-center py-12 text-[#999]">Müşteri bulunamadı</div>

  const DURUM_BADGE: Record<string, any> = {
    aktif: 'success', bekliyor: 'warning', arsiv: 'info'
  }

  return (
    <div className="space-y-6">
      {/* Özet Kart */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <div className="flex flex-wrap gap-6 items-start">
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-white text-2xl font-bebas tracking-wider flex-shrink-0">
            {musteri.firmaAdi?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="font-bebas text-2xl tracking-wider text-[#1a1a1a]">{musteri.firmaAdi}</h2>
              <Badge variant={DURUM_BADGE[musteri.durum] || 'outline'}>{musteri.durum?.toUpperCase()}</Badge>
            </div>
            <p className="text-[#555] font-montserrat text-sm mb-3">{musteri.yetkiliKisi}</p>
            <div className="flex flex-wrap gap-4 text-sm font-montserrat text-[#555]">
              <span className="flex items-center gap-1"><Phone size={14} />{musteri.telefon}</span>
              <span className="flex items-center gap-1"><Mail size={14} />{musteri.email}</span>
              {musteri.adres && <span className="flex items-center gap-1"><MapPin size={14} />{musteri.adres}</span>}
              <span className="flex items-center gap-1"><Hash size={14} />Kasa: {musteri.kasaNo}</span>
            </div>
          </div>
          {musteri.teklifler?.[0] && (
            <div className="text-right">
              <p className="text-[#999] text-xs font-montserrat">Sözleşme Tutarı</p>
              <p className="font-bebas text-2xl text-[#1a1a1a] tracking-wider">₺{musteri.teklifler[0].toplam?.toLocaleString('tr-TR')}</p>
              <p className="text-[#555] text-xs font-montserrat">{musteri.teklifler[0].paketAdi}</p>
            </div>
          )}
        </div>
      </div>

      {/* Kasa Girişi */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4 flex items-center gap-2">
          <KeyRound size={18} /> KASA GİRİŞİ
        </h3>
        <p className="text-[#999] text-xs font-montserrat mb-4">
          Şifreler güvenlik nedeniyle tersine okunamayacak şekilde saklanır — tekrar gösterilemez, sadece sıfırlanabilir.
          Şifreye hiç gerek kalmadan aşağıdaki şifresiz giriş linkini müşteriye gönderebilirsiniz.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#999] mb-1.5 font-montserrat uppercase tracking-wider">Şifresiz Giriş Linki</label>
            <div className="flex gap-2">
              <input readOnly value={kasaLinki} className="flex-1 border border-[#eaeaea] rounded-lg px-3 py-2 text-xs font-mono text-[#555] bg-[#f8f9fa]" />
              <button onClick={() => kopyala(kasaLinki, 'link')} className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-xs font-montserrat font-bold px-3 rounded-lg hover:bg-black transition-colors">
                {copied === 'link' ? <Check size={14} /> : <Copy size={14} />} {copied === 'link' ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={sifreSifirla}
              disabled={sifirlaniyor}
              className="flex items-center gap-1.5 border-2 border-[#1a1a1a] text-[#1a1a1a] text-xs font-montserrat font-bold px-4 py-2 rounded-lg hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-50"
            >
              <KeyRound size={14} /> {sifirlaniyor ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </button>
            {yeniSifre && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-xs font-montserrat text-green-700">Yeni şifre: <strong className="font-mono">{yeniSifre}</strong></span>
                <button onClick={() => kopyala(yeniSifre, 'sifre')} className="text-green-700">
                  {copied === 'sifre' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kanban">
        <TabsList className="bg-white border border-[#eaeaea] p-1">
          <TabsTrigger value="kanban" className="font-montserrat font-semibold text-sm">📋 Kanban</TabsTrigger>
          <TabsTrigger value="timeline" className="font-montserrat font-semibold text-sm">📅 Timeline</TabsTrigger>
          <TabsTrigger value="todo" className="font-montserrat font-semibold text-sm">✅ To-Do</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <KanbanBoard musteriId={id as string} />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineGantt musteriId={id as string} />
        </TabsContent>
        <TabsContent value="todo">
          <TodoList musteriId={id as string} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
