"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertCircle, BarChart2, Plus, MessageSquare } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'

const MONTHLY_DATA = [
  { ay: 'Eki', gelir: 120000, gider: 75000 },
  { ay: 'Kas', gelir: 145000, gider: 88000 },
  { ay: 'Ara', gelir: 132000, gider: 92000 },
  { ay: 'Oca', gelir: 168000, gider: 95000 },
  { ay: 'Şub', gelir: 155000, gider: 87000 },
  { ay: 'Mar', gelir: 192000, gider: 102000 },
]

const GIDER_KATEGORILERI = [
  { name: 'Reklam', value: 45000, color: '#3b82f6' },
  { name: 'Maaş', value: 30000, color: '#22c55e' },
  { name: 'Ofis', value: 12000, color: '#f59e0b' },
  { name: 'Lisans', value: 8000, color: '#8b5cf6' },
  { name: 'Vergi', value: 5000, color: '#ef4444' },
  { name: 'Diğer', value: 2000, color: '#6b7280' },
]

const NAKIT_AKISI = [
  { ay: 'Nis', gelir: 200000, gider: 110000, net: 90000 },
  { ay: 'May', gelir: 220000, gider: 115000, net: 105000 },
  { ay: 'Haz', gelir: 240000, gider: 120000, net: 120000 },
]

export default function MuhasebeDashboard() {
  const [ozet, setOzet] = useState({
    toplamGelir: 192000, toplamGider: 102000, netKar: 90000,
    kasaBakiye: 350000, bekleyenTahsilat: 45000, odenmesiGereken: 20000,
    gelirDegisim: 23.9, giderDegisim: 17.2,
  })

  useEffect(() => {
    fetch('/api/muhasebe/ozet').then(r => r.json()).then(setOzet).catch(() => {})
  }, [])

  const SUMMARY_CARDS = [
    { label: 'Toplam Gelir (Bu Ay)', value: `₺${(ozet.toplamGelir/1000).toFixed(0)}K`, change: ozet.gelirDegisim, up: true, icon: TrendingUp, color: '#22c55e' },
    { label: 'Toplam Gider (Bu Ay)', value: `₺${(ozet.toplamGider/1000).toFixed(0)}K`, change: ozet.giderDegisim, up: false, icon: TrendingDown, color: '#ef4444' },
    { label: 'Net Kar/Zarar', value: `₺${(ozet.netKar/1000).toFixed(0)}K`, change: 12.5, up: ozet.netKar > 0, icon: BarChart2, color: ozet.netKar > 0 ? '#22c55e' : '#ef4444' },
    { label: 'Kasa/Banka Bakiyesi', value: `₺${(ozet.kasaBakiye/1000).toFixed(0)}K`, change: 0, up: true, icon: DollarSign, color: '#3b82f6' },
    { label: 'Tahsilat Bekleyen', value: `₺${(ozet.bekleyenTahsilat/1000).toFixed(0)}K`, change: 0, up: false, icon: Clock, color: '#f59e0b' },
    { label: 'Ödenmesi Gereken', value: `₺${(ozet.odenmesiGereken/1000).toFixed(0)}K`, change: 0, up: false, icon: AlertCircle, color: '#f97316' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">MUHASEBE PANELİ</h2>
          <p className="text-[#555] font-montserrat text-sm">Mali durumunuzu anlık takip edin</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/muhasebe/gelir/ekle" className="btn-primary text-sm flex items-center gap-1.5"><Plus size={14} /> GELİR EKLE</Link>
          <Link href="/admin/muhasebe/gider/ekle" className="btn-primary text-sm flex items-center gap-1.5" style={{background:'#ef4444'}}><Plus size={14} /> GİDER EKLE</Link>
          <Link href="/admin/muhasebe/wp-onay" className="btn-primary text-sm flex items-center gap-1.5" style={{background:'#25D366'}}><MessageSquare size={14} /> WP ONAY</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {SUMMARY_CARDS.map(({ label, value, change, up, icon: Icon, color }, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#eaeaea] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
                <Icon size={16} style={{ color }} />
              </div>
              {change !== 0 && (
                <span className={`text-xs font-montserrat font-bold ${up ? 'text-green-500' : 'text-red-500'}`}>
                  {up ? '↑' : '↓'}{Math.abs(change)}%
                </span>
              )}
            </div>
            <div className="font-bebas text-xl text-[#1a1a1a] tracking-wider">{value}</div>
            <p className="text-[#999] text-xs font-montserrat mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gelir-Gider Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#eaeaea] p-6">
          <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">AYLIK GELİR - GİDER</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `₺${v.toLocaleString('tr-TR')}`} />
              <Line type="monotone" dataKey="gelir" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Gelir" />
              <Line type="monotone" dataKey="gider" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Gider" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
          <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">GİDER DAĞILIMI</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={GIDER_KATEGORILERI} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                {GIDER_KATEGORILERI.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `₺${v.toLocaleString('tr-TR')}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {GIDER_KATEGORILERI.map((k, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-montserrat text-[#555]">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: k.color }} />
                {k.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nakit Akışı Tahmini */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">NAKİT AKIŞI TAHMİNİ (Önümüzdeki 3 Ay)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={NAKIT_AKISI}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="ay" />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => `₺${v.toLocaleString('tr-TR')}`} />
            <Legend />
            <Bar dataKey="gelir" fill="#22c55e" name="Gelir Tahmini" radius={[4,4,0,0]} />
            <Bar dataKey="gider" fill="#ef4444" name="Gider Tahmini" radius={[4,4,0,0]} />
            <Bar dataKey="net" fill="#3b82f6" name="Net" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/admin/muhasebe/gelir', label: 'Gelir Listesi', emoji: '💰', color: '#22c55e' },
          { href: '/admin/muhasebe/gider', label: 'Gider Listesi', emoji: '📉', color: '#ef4444' },
          { href: '/admin/muhasebe/raporlar', label: 'Raporlar', emoji: '📊', color: '#3b82f6' },
          { href: '/admin/muhasebe/wp-onay', label: 'WP Onay', emoji: '📱', color: '#25D366' },
        ].map(({ href, label, emoji, color }, i) => (
          <Link key={i} href={href} className="bg-white rounded-xl border border-[#eaeaea] p-5 hover:border-[#1a1a1a] transition-colors group text-center">
            <div className="text-3xl mb-2">{emoji}</div>
            <p className="font-montserrat font-semibold text-sm text-[#1a1a1a] group-hover:text-[#1a1a1a]">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
