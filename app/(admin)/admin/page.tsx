"use client"
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, FileText, BarChart3, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const WEEKLY_DATA = [
  { gun: 'Paz', deger: 4500 },
  { gun: 'Pzt', deger: 5200 },
  { gun: 'Sal', deger: 6800 },
  { gun: 'Çar', deger: 7500 },
  { gun: 'Per', deger: 6200 },
  { gun: 'Cum', deger: 7800 },
  { gun: 'Cmt', deger: 9200 },
]

const MONTHLY_DATA = [
  { ay: 'Eki', gelir: 120000, gider: 75000 },
  { ay: 'Kas', gelir: 145000, gider: 88000 },
  { ay: 'Ara', gelir: 132000, gider: 92000 },
  { ay: 'Oca', gelir: 168000, gider: 95000 },
  { ay: 'Şub', gelir: 155000, gider: 87000 },
  { ay: 'Mar', gelir: 192000, gider: 102000 },
]

interface OzetData {
  toplamMusteri: number
  aktifMusteri: number
  bekleyenTeklif: number
  buAyGelir: number
  ortalamaROI: number
  tamamlanmaOrani: number
}

export default function AdminDashboard() {
  const [ozet, setOzet] = useState<OzetData>({
    toplamMusteri: 47,
    aktifMusteri: 32,
    bekleyenTeklif: 5,
    buAyGelir: 192000,
    ortalamaROI: 850,
    tamamlanmaOrani: 78,
  })

  useEffect(() => {
    fetch('/api/admin/ozet').then(r => r.json()).then(setOzet).catch(() => {})
  }, [])

  const STAT_CARDS = [
    { label: 'Aktif Müşteri', value: ozet.aktifMusteri, total: ozet.toplamMusteri, icon: Users, color: '#3b82f6', change: '+3', up: true },
    { label: 'Bu Ayki Gelir', value: `₺${(ozet.buAyGelir/1000).toFixed(0)}K`, icon: TrendingUp, color: '#22c55e', change: '+12%', up: true },
    { label: 'Ortalama ROI', value: `%${ozet.ortalamaROI}`, icon: BarChart3, color: '#f59e0b', change: '+50%', up: true },
    { label: 'Bekleyen Teklif', value: ozet.bekleyenTeklif, icon: FileText, color: '#f97316', change: '-2', up: false },
    { label: 'Tamamlanma', value: `%${ozet.tamamlanmaOrani}`, icon: CheckCircle, color: '#8b5cf6', change: '+5%', up: true },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">HOŞ GELDİNİZ</h2>
          <p className="text-[#555] font-montserrat text-sm mt-1">İşte günlük özetiniz</p>
        </div>
        <Link href="/admin/teklif-olustur" className="btn-primary text-sm">
          + YENİ TEKLİF
        </Link>
      </div>

      {/* Budget Card + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Budget Card */}
        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm font-montserrat">Haftalık Gelir Trendi</p>
              <div className="font-bebas text-4xl tracking-wider mt-1">
                ₺{WEEKLY_DATA.reduce((s, d) => s + d.deger, 0).toLocaleString('tr-TR')}
              </div>
              <p className="text-green-400 text-sm font-montserrat mt-1">+₺317 bu hafta</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={WEEKLY_DATA}>
              <defs>
                <linearGradient id="colorDeger" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc107" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffc107" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="gun" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#333', border: 'none', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="deger" stroke="#ffc107" strokeWidth={2} fill="url(#colorDeger)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          {STAT_CARDS.slice(0, 3).map(({ label, value, icon: Icon, color, change, up }, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#eaeaea] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#999] text-xs font-montserrat">{label}</p>
                <p className="font-bebas text-xl text-[#1a1a1a] tracking-wider">{value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold font-montserrat ${up ? 'text-green-500' : 'text-red-500'}`}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, change, up }, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#eaeaea] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className={`text-xs font-montserrat font-bold ${up ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
            </div>
            <div className="font-bebas text-2xl text-[#1a1a1a] tracking-wider">{value}</div>
            <p className="text-[#999] text-xs font-montserrat mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Gelir-Gider Grafiği */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">AYLIK GELİR - GİDER</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => `₺${v.toLocaleString('tr-TR')}`} />
            <Line type="monotone" dataKey="gelir" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Gelir" />
            <Line type="monotone" dataKey="gider" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Gider" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Son Müşteriler */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a]">SON MÜŞTERİLER</h3>
          <Link href="/admin/musteriler" className="text-sm font-montserrat font-semibold text-[#1a1a1a] hover:underline">
            Tümünü Gör →
          </Link>
        </div>
        <RecentCustomers />
      </div>
    </div>
  )
}

function RecentCustomers() {
  const [musteriler, setMusteriler] = useState<any[]>([])
  
  useEffect(() => {
    fetch('/api/musteriler?limit=5').then(r => r.json()).then(d => setMusteriler(d.data || [])).catch(() => {
      setMusteriler([
        { id: '1', firmaAdi: 'ABC Şirketi', durum: 'aktif', kasaNo: '404-001', updatedAt: new Date() },
        { id: '2', firmaAdi: 'XYZ Ltd.', durum: 'bekliyor', kasaNo: '404-002', updatedAt: new Date() },
      ])
    })
  }, [])

  const durumRenk: Record<string, string> = { aktif: 'text-green-600 bg-green-50', bekliyor: 'text-yellow-600 bg-yellow-50', arsiv: 'text-blue-600 bg-blue-50' }

  return (
    <div className="space-y-2">
      {musteriler.map(m => (
        <div key={m.id} className="flex items-center justify-between p-3 hover:bg-[#f8f9fa] rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {m.firmaAdi?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-montserrat font-semibold text-[#1a1a1a]">{m.firmaAdi}</p>
              <p className="text-xs font-mono text-[#999]">#{m.kasaNo}</p>
            </div>
          </div>
          <span className={`text-xs font-montserrat font-bold px-2 py-1 rounded-full ${durumRenk[m.durum] || 'text-gray-600 bg-gray-50'}`}>
            {m.durum?.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  )
}
