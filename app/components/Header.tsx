'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'マップ', icon: '🗾' },
  { href: '/city', label: '市区町村', icon: '🏘' },
  { href: '/spots', label: 'スポット', icon: '🚗' },
  { href: '/diary', label: '日記', icon: '📔' },
  { href: '/ranking', label: 'ランキング', icon: '🏆' },
  { href: '/group', label: 'グループ', icon: '👨‍👩‍👧' },
  { href: '/badges', label: 'バッジ', icon: '🏅' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* トップヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl">🗾</span>
          <span className="text-lg font-bold text-white">旅コンプリ</span>
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden sm:flex items-center gap-4 text-sm">
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
          {loggedIn ? (
            <>
              <Link href="/profile" className={`transition text-sm ${isActive('/profile') ? 'text-white font-medium' : 'text-slate-400 hover:text-white'}`}>
                👤 プロフィール
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white transition text-sm">
                ログアウト
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-sm font-medium transition"
            >
              ログインして始める
            </Link>
          )}
        </nav>

        {/* スマホ用ログインボタン */}
        <div className="sm:hidden">
          {loggedIn ? (
            <button onClick={handleLogout} className="text-slate-400 text-sm">
              ログアウト
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-medium"
            >
              ログイン
            </Link>
          )}
        </div>
      </header>

      {/* スマホ用下部タブバー */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur border-t border-white/10 flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition ${
              pathname === item.href
                ? 'text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] leading-none">{item.label}</span>
          </Link>
        ))}
      </nav>

    </>
  )
}
