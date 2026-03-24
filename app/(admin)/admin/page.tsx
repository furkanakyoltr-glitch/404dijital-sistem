"use client"
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Users, FileText, BarChart3, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Link from 'next/link'

interface OzetData {
  toplamMusteri: number
  aktifMusteri: number
  bekleyenTeklif: number
  buAyGelir: number
  ortalamaROI: number
  tamamlanmaOrani: number
  haftalikVeri: { gun: string; deger: number }[]
  aylikVeri: { ay: string; gelir: number; gider: number }[]
}

export default function AdminDashboard() {
  const [ozet, setOzet] = useState<OzetData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/ozet')
      .then(r => r.json())
      .then(setOzet)
      .catch(() => setOzet(null))
      .finally(() => setLoading(false))
  }, [])

  const haftalikVeri = ozet?.haftalikVeri || []
  const aylikVeri = ozet?.aylikVeri || []
  const haftalikToplam = haftalikVeri.reduce((s, d) => s + d.deger, 0)

  const STAT_CARDS = ozet ? [
    { label: 'Aktif Müşteri', value: ozet.aktifMusteri, icon: Users, color: '#3b82f6', change: `/${ozet.toplamMusteri}`, up: true, href: '/admin/musteriler?durum=aktif' },
    { label: 'Bu Ayki Gelir', value: ozet.buAyGelir >= 1000 ? `₺${(ozet.buAyGelir / 1000).toFixed(0)}K` : `₺${ozet.buAyGelir.toLocaleString('tr-TR')}`, icon: TrendingUp, color: '#22c55e', change: '', up: true, href: '/admin/muhasebe/gelir' },
    { label: 'Ortalama ROI', value: `%${ozet.ortalamaROI}`, icon: BarChart3, color: '#f59e0b', change: '', up: true, href: '/admin/musteriler' },
    { label: 'Bekleyen Teklif', value: ozet.bekleyenTeklif, icon: FileText, color: '#f97316', change: '', up: false, href: '/admin/teklifler' },
    { label: 'Tamamlanma', value: `%${ozet.tamamlanmaOrani}`, icon: CheckCircle, color: '#8b5cf6', change: '', up: true, href: '/admin/musteriler' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">HOŞ GELDİNİZ</h2>
          <p className="text-[#555] font-montserrat text-sm mt-1">İşte günlük özetiniz</p>
        </div>
        <Link href="/admin/teklif-olustur" className="btn-primary text-sm">+ YENİ TEKLİF</Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-[#1a1a1a] border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#1a1a1a] rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-montserrat">Haftalık Gelir Trendi</p>
                  <div className="font-bebas text-4xl tracking-wider mt-1">₺{haftalikToplam.toLocaleString('tr-TR')}</div>
                  {haftalikToplam === 0 && <p className="text-gray-500 text-xs font-montserrat mt-1">Bu hafta henüz onaylı gelir kaydı yok</p>}
                </div>
                <div className="text-4xl">💰</div>
              </div>
              {haftalikVeri.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={haftalikVeri}>
                    <defs>
                      <linearGradient id="colorDeger" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc107" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ffc107" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="gun" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#333', border: 'none', borderRadius: 8, color: '#fff' }} formatter={(v: number) => `₺${v.toLocaleString('tr-TR')}`} />
                    <Area type="monotone" dataKey="deger" stroke="#ffc107" strokeWidth={2} fill="url(#colorDeger)" name="Gelir" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-600 text-sm font-montserrat">Grafik için gelir kaydı oluşturun</div>
              )}
            </div>
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
                  {change && (
                    <div className={`flex items-center gap-1 text-xs font-semibold font-montserrat ${up ? 'text-green-500' : 'text-red-500'}`}>
                      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{change}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {STAT_CARDS.map(({ label, value, icon: Icon, color, change, up, href }, i) => (
              <Link key={i} href={href} className="bg-white rounded-xl border border-[#eaeaea] p-4 hover:border-[#1a1a1a] hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  {change && <span className={`text-xs font-montserrat font-bold ${up ? 'text-green-500' : 'text-red-500'}`}>{change}</span>}
                </div>
                <div className="font-bebas text-2xl text-[#1a1a1a] tracking-wider">{value}</div>
                <p className="text-[#999] text-xs font-montserrat mt-0.5">{label}</p>
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
            <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a] mb-4">AYLIK GELİR - GİDER</h3>
            {aylikVeri.some(d => d.gelir > 0 || d.gider > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={aylikVeri}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                  <Tooltip formatter={(v: number) => `₺${v.toLocaleString('tr-TR')}`} />
                  <Line type="monotone" dataKey="gelir" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Gelir" />
                  <Line type="monotone" dataKey="gider" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Gider" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-[#999] text-sm font-montserrat">Grafik için gelir/gider kaydı oluşturun</div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bebas text-xl tracking-wider text-[#1a1a1a]">SON MÜŞTERİLER</h3>
              <Link href="/admin/musteriler" className="text-sm font-montserrat font-semibold text-[#1a1a1a] hover:underline">Tümünü Gör →</Link>
            </div>
            <RecentCustomers />
          </div>
        </>
      )}
    </div>
  )
}

function RecentCustomers() {
  const [musteriler, setMusteriler] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/musteriler?limit=5').then(r => r.json()).then(d => setMusteriler(d.data || [])).catch(() => setMusteriler([]))
  }, [])

  const durumRenk: Record<string, string> = {
    aktif: 'text-green-600 bg-green-50',
    bekliyor: 'text-yellow-600 bg-yellow-50',
    odeme_alinacak: 'text-blue-600 bg-blue-50',
    arsiv: 'text-gray-600 bg-gray-50',
  }

  if (musteriler.length === 0) return <p className="text-[#999] font-montserrat text-sm text-center py-6">Henüz müşteri yok</p>

  return (
    <div className="space-y-2">
      {musteriler.map(m => (
        <Link key={m.id} href={`/admin/musteriler/${m.id}`} className="flex items-center justify-between p-3 hover:bg-[#f8f9fa] rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-xs font-bold">{m.firmaAdi?.charAt(0)}</div>
            <div>
              <p className="text-sm font-montserrat font-semibold text-[#1a1a1a]">{m.firmaAdi}</p>
              <p className="text-xs font-mono text-[#999]">#{m.kasaNo}</p>
            </div>
          </div>
          <span className={`text-xs font-montserrat font-bold px-2 py-1 rounded-full ${durumRenk[m.durum] || 'text-gray-600 bg-gray-50'}`}>
            {m.durum?.toUpperCase()}
          </span>
        </Link>
      ))}
    </div>
  )
}
