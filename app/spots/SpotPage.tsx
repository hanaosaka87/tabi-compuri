'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import Header from '@/app/components/Header'

type Spot = { id: string; name: string; prefecture_code: number }

type Props = {
  categoryId: string
  label: string
  icon: string
  spots: Spot[]
}

export default function SpotPage({ categoryId, label, icon, spots }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedPref, setSelectedPref] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsGuest(true); setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('spot_visits').select('spot_id').eq('user_id', user.id).eq('category', categoryId)
      if (data) setVisitedIds(new Set(data.map((v: { spot_id: string }) => v.spot_id)))
      setLoading(false)
    }
    init()
  }, [categoryId])

  const handleToggle = async (spot: Spot) => {
    if (!userId) { setShowLoginPrompt(true); return }
    if (visitedIds.has(spot.id)) {
      await supabase.from('spot_visits').delete().eq('user_id', userId).eq('spot_id', spot.id)
      setVisitedIds(prev => { const s = new Set(prev); s.delete(spot.id); return s })
    } else {
      await supabase.from('spot_visits').insert({
        user_id: userId, spot_id: spot.id, category: categoryId,
        spot_name: spot.name, prefecture_code: spot.prefecture_code,
        visited_at: new Date().toISOString().split('T')[0],
      })
      setVisitedIds(prev => new Set(prev).add(spot.id))
    }
  }

  const filtered = spots.filter(s => {
    const matchPref = selectedPref === 'all' || s.prefecture_code === Number(selectedPref) || s.prefecture_code === 0
    const matchSearch = search === '' || s.name.includes(search)
    return matchPref && matchSearch
  })

  const totalVisited = visitedIds.size
  const percent = spots.length > 0 ? Math.round(totalVisited / spots.length * 100) : 0

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">{icon} ゲストで閲覧中 — 記録するにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ml-4">ログイン</Link>
        </div>
      )}

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">{icon}</div>
            <h2 className="text-xl font-bold mb-2">記録するにはログインが必要です</h2>
            <Link href="/login" className="block bg-emerald-500 text-white font-bold py-3 rounded-xl mb-3">ログイン / 新規登録</Link>
            <button onClick={() => setShowLoginPrompt(false)} className="text-slate-500 text-sm">引き続き見る</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1 text-sm">
            <Link href="/spots" className="text-slate-500 hover:text-slate-300">スポット</Link>
            <span className="text-slate-600">›</span>
            <span className="text-white">{label}</span>
          </div>
          <h1 className="text-2xl font-bold">{icon} {label}制覇</h1>
        </div>

        {/* 制覇状況 */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800/50 border border-emerald-500/20 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-slate-400 text-xs">制覇済み</p>
              <p className="text-3xl font-bold">{totalVisited}<span className="text-slate-400 text-base font-normal"> / {spots.length.toLocaleString()}</span></p>
            </div>
            <p className="text-emerald-400 text-2xl font-bold">{percent}%</p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-3 mb-3">
          <select
            value={selectedPref}
            onChange={e => setSelectedPref(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 flex-shrink-0"
          >
            <option value="all">全都道府県</option>
            {PREFECTURES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${label}名を検索...`}
            className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <p className="text-slate-500 text-xs mb-3">{filtered.length.toLocaleString()}件表示</p>

        <div className="flex flex-wrap gap-2">
          {filtered.map(spot => (
            <button
              key={spot.id}
              onClick={() => handleToggle(spot)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition border ${
                visitedIds.has(spot.id)
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-white'
              }`}
            >
              {visitedIds.has(spot.id) ? '✓ ' : ''}{spot.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p>条件に一致するスポットがありません</p>
          </div>
        )}
      </div>
    </main>
  )
}
