'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { calcBadges, Badge } from '@/lib/badges'
import Header from '@/app/components/Header'

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [earnedCount, setEarnedCount] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsGuest(true)
        setBadges(calcBadges(new Set()))
        setLoading(false)
        return
      }
      const { data } = await supabase.from('visits').select('prefecture_code').eq('user_id', user.id)
      const codes = new Set<number>((data ?? []).map((v) => v.prefecture_code))
      const b = calcBadges(codes)
      setBadges(b)
      setEarnedCount(b.filter((x) => x.earned).length)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">🏅 ログインすると実際にバッジを獲得できます</p>
          <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ml-4">
            ログインして集める
          </Link>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🏅 バッジ一覧</h1>
            {!isGuest && (
              <p className="text-slate-400 text-sm mt-1">
                <span className="text-emerald-400 font-bold">{earnedCount}</span> / {badges.length} 獲得済み
              </p>
            )}
            {isGuest && (
              <p className="text-slate-400 text-sm mt-1">全 {badges.length} 種類のバッジを集めよう</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition ${
                badge.earned
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <span className="text-3xl">{badge.emoji}</span>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${badge.earned ? 'text-white' : 'text-slate-400'}`}>
                  {badge.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
              </div>
              {badge.earned && (
                <span className="ml-auto text-emerald-400 text-xs flex-shrink-0">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
