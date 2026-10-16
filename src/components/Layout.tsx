import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../services/storage'

export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M12 40c8-2 14-8 18-16 2-4 6-8 12-8 4 0 7 2 8 5l6 1-6 3c0 8-6 15-15 17l4 8h-4l-4-7-4 1 2 6h-4l-2-6c-4 0-8-1-11-4z" fill="currentColor" />
      <circle cx="43" cy="21" r="2" fill="#b3261e" />
    </svg>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const { status } = useStore()
  // Sayfa değişince en üste dön (mobilde özellikle önemli)
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-bone">
          <Logo />
          <span className="heading text-lg font-extrabold sm:text-xl">Crows Tracker</span>
        </Link>
        <span className="flex items-center gap-2 text-xs text-dust" role="status" title="Senkron durumu">
          <span className={`h-2 w-2 rounded-full ${status === 'live' ? 'bg-moss shadow-[0_0_8px] shadow-moss' : status === 'error' ? 'bg-blood' : 'animate-pulse bg-gold'}`} />
          {status === 'live' ? 'Canlı' : status === 'error' ? 'Bağlantı yok' : 'Bağlanıyor'}
        </span>
      </header>
      <main className="flex-1 pb-10">
        <Outlet />
      </main>
      <footer className="border-t border-smoke/50 pt-4 pb-20 text-center text-xs text-dust/70 sm:pb-16">
        MCDM Crows Playtest 3 için hayran yapımı takip aracı · Veriler tüm cihazlarda canlı senkronlanır
      </footer>
    </div>
  )
}
