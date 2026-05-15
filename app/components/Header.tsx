'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'マップ' },
  { href: '/city', label: '市区町村' },
  { href: '/diary', label: '日記' },
  { href: '/ranking', label: 'ランキング' },
  { href: '/badges', label: 'バッジ' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl">🗾</span>
        <span className="text-lg font-bold text-white">旅コンプリ</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition ${
              pathname === item.href
                ? 'text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-white transition"
        >
          ログアウト
        </button>
      </nav>
    </header>
  )
}
