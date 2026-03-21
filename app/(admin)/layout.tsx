"use client"
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, FileText, Calendar, Bell, 
  LogOut, Menu, X, TrendingUp, BookOpen, ChevronRight
} from 'lucide-react'
import '../globals.css'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/musteriler', icon: Users, label: 'Müşteriler' },
  { href: '/admin/teklif-olustur', icon: FileText, label: 'Teklif Oluştur' },
  { href: '/admin/muhasebe', icon: BookOpen, label: 'Muhasebe' },
  { href: '/admin/takvim', icon: Calendar, label: 'Takvim' },
  { href: '/admin/bildirimler', icon: Bell, label: 'Bildirimler' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#1a1a1a] border-t-transparent rounded-full"></div></div>
  if (status === 'unauthenticated') { router.push('/admin/giris'); return null }
  if ((session?.user as any)?.type !== 'admin') { router.push('/admin/giris'); return null }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#1a1a1a] flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
          {sidebarOpen && <span className="font-bebas text-xl text-white tracking-[3px]">404 ADMİN</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-gray-400 hover:text-white p-1">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all mb-1 group ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-montserrat font-medium">{label}</span>}
                {sidebarOpen && active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-white text-sm font-montserrat font-semibold truncate">{session?.user?.name}</p>
              <p className="text-gray-400 text-xs font-montserrat truncate">{session?.user?.email}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/admin/giris' })}
            className={`flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={16} />
            {sidebarOpen && <span className="font-montserrat">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#eaeaea] flex items-center px-6 gap-4 sticky top-0 z-10">
          <div className="flex-1">
            <h1 className="font-bebas text-xl text-[#1a1a1a] tracking-wider">
              {NAV_ITEMS.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/bildirimler" className="relative p-2 hover:bg-[#f8f9fa] rounded-xl">
              <Bell size={18} className="text-[#555]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {session?.user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
