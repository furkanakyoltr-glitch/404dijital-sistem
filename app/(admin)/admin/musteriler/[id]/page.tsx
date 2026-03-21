"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MapPin, Hash } from 'lucide-react'
import { KanbanBoard } from '@/components/ui/kanban-board'
import { TimelineGantt } from '@/components/ui/timeline-gantt'
import { TodoList } from '@/components/ui/todo-list'

export default function MusteriDetayPage() {
  const { id } = useParams()
  const [musteri, setMusteri] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
