"use client"
import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, FileText, User, AlertTriangle } from 'lucide-react'

const DEMO_NOTIFICATIONS = [
  { id: '1', type: 'teklif', title: 'ABC Şirketi teklifi onayladı', desc: 'Kasa #404-001 - Gold Paket', time: '5 dakika önce', read: false, icon: FileText, color: '#22c55e' },
  { id: '2', type: 'gorev', title: 'Yeni görev atandı', desc: 'Meta reklam seti oluştur - ABC Şirketi', time: '1 saat önce', read: false, icon: User, color: '#3b82f6' },
  { id: '3', type: 'deadline', title: 'Son tarih yaklaşıyor', desc: 'XYZ Ltd. - Aylık rapor - 2 gün kaldı', time: '3 saat önce', read: false, icon: AlertTriangle, color: '#f59e0b' },
  { id: '4', type: 'teklif', title: 'DEF A.Ş. teklifi görüntüledi', desc: 'Kasa #404-003 görüntülendi', time: '5 saat önce', read: true, icon: FileText, color: '#6b7280' },
  { id: '5', type: 'gorev', title: 'Görev tamamlandı', desc: 'Strateji sunumu - GHI Şirketi', time: '1 gün önce', read: true, icon: Check, color: '#22c55e' },
]

export default function BildirimlerPage() {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bebas text-3xl text-[#1a1a1a] tracking-wider">BİLDİRİMLER</h2>
          {unreadCount > 0 && <p className="text-[#555] font-montserrat text-sm mt-1">{unreadCount} okunmamış bildirim</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm font-montserrat font-semibold text-[#555] hover:text-[#1a1a1a] transition-colors">
            <CheckCheck size={16} /> Tümünü Okut
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(notif => {
          const Icon = notif.icon
          return (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:border-[#1a1a1a]/20 ${notif.read ? 'bg-white border-[#eaeaea]' : 'bg-blue-50/50 border-blue-100'}`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: notif.color + '20' }}>
                <Icon size={18} style={{ color: notif.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-montserrat ${notif.read ? 'font-medium text-[#555]' : 'font-bold text-[#1a1a1a]'}`}>{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>}
                </div>
                <p className="text-xs text-[#999] font-montserrat mt-0.5">{notif.desc}</p>
                <p className="text-xs text-[#ccc] font-montserrat mt-1">{notif.time}</p>
              </div>
            </div>
          )
        })}
      </div>

      {notifications.every(n => n.read) && (
        <div className="text-center py-12">
          <Bell size={40} className="mx-auto text-[#ccc] mb-3" />
          <p className="font-bebas text-xl text-[#999] tracking-wider">TÜM BİLDİRİMLER OKUNDU</p>
        </div>
      )}
    </div>
  )
}
