'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import Header from '@/app/components/Header'
import CompleteModal from '@/app/components/CompleteModal'
import castleData from '@/lib/spots/castle.json'

type Tier = 'S' | 'A' | 'B' | 'C'
type Castle = { id: string; name: string; prefecture_code: number; tier: Tier }
type TierFilter = 'all' | Tier

const TIER_CONFIG: Record<Tier, { label: string; badge: string; color: string; border: string; bg: string; desc: string }> = {
  S: {
    label: '現存天守',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    desc: '現存する江戸時代以前の天守閣 全12城',
  },
  A: {
    label: '日本100名城',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    desc: '日本城郭協会が選定した100名城',
  },
  B: {
    label: '続100名城',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    desc: '2017年追加選定の続日本100名城',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    desc: 'その他の城・城跡・城館跡',
  },
}

const TIERS: Tier[] = ['S', 'A', 'B', 'C']
const castles = castleData as Castle[]

export default function CastlePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [selectedPref, setSelectedPref] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')
  const [unvisitedOnly, setUnvisitedOnly] = useState(false)
  const [completeModal, setCompleteModal] = useState<{ tier: Tier } | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsGuest(true); setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('spot_visits').select('spot_id').eq('user_id', user.id).eq('category', 'castle')
      if (data) setVisitedIds(new Set(data.map((v: { spot_id: string }) => v.spot_id)))
      setLoading(false)
    }
    init()
  }, [])

  const handleToggle = async (castle: Castle) => {
    if (!userId) { setShowLoginPrompt(true); return }
    if (visitedIds.has(castle.id)) {
      await supabase.from('spot_visits').delete().eq('user_id', userId).eq('spot_id', castle.id)
      setVisitedIds(prev => { const s = new Set(prev); s.delete(castle.id); return s })
    } else {
      await supabase.from('spot_visits').insert({
        user_id: userId, spot_id: castle.id, category: 'castle',
        spot_name: castle.name, prefecture_code: castle.prefecture_code,
        visited_at: new Date().toISOString().split('T')[0],
      })
      setVisitedIds(prev => {
        const next = new Set(prev).add(castle.id)
        // tierコンプリート判定
        const tierCastles = castles.filter(c => c.tier === castle.tier)
        if (tierCastles.every(c => next.has(c.id))) {
          setCompleteModal({ tier: castle.tier })
        }
        return next
      })
    }
  }

  const tierStats = TIERS.map(tier => {
    const group = castles.filter(c => c.tier === tier)
    const visited = group.filter(c => visitedIds.has(c.id)).length
    return { tier, total: group.length, visited, pct: group.length ? Math.round(visited / group.length * 100) : 0 }
  })

  const totalVisited = visitedIds.size
  const totalPct = castles.length ? Math.round(totalVisited / castles.length * 100) : 0

  const filtered = castles.filter(c => {
    const matchTier = tierFilter === 'all' || c.tier === tierFilter
    const matchPref = selectedPref === 'all' || c.prefecture_code === Number(selectedPref)
    const matchSearch = search === '' || c.name.includes(search)
    const matchUnvisited = !unvisitedOnly || !visitedIds.has(c.id)
    return matchTier && matchPref && matchSearch && matchUnvisited
  })

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  const completeConfig = completeModal ? TIER_CONFIG[completeModal.tier] : null

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      {completeModal && completeConfig && (
        <CompleteModal
          emoji="🏯"
          title={`${completeConfig.label}制覇達成！`}
          message={`${completeConfig.badge} ${completeConfig.label}をコンプリートしました！🎊`}
          onClose={() => setCompleteModal(null)}
        />
      )}

      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">🏯 ゲストで閲覧中 — 記録するにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ml-4">ログイン</Link>
        </div>
      )}

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🏯</div>
            <h2 className="text-xl font-bold mb-2">記録するにはログインが必要です</h2>
            <Link href="/login" className="block bg-emerald-500 text-white font-bold py-3 rounded-xl mb-3">ログイン / 新規登録</Link>
            <button onClick={() => setShowLoginPrompt(false)} className="text-slate-500 text-sm">引き続き見る</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* パンくず */}
        <div className="flex items-center gap-2 mb-1 text-sm">
          <Link href="/spots" className="text-slate-500 hover:text-slate-300">スポット</Link>
          <span className="text-slate-600">›</span>
          <span className="text-white">お城</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">🏯 お城制覇</h1>

        {/* 全体進捗 */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border border-white/10 rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-slate-400 text-xs">全城 制覇済み</p>
              <p className="text-2xl font-bold">{totalVisited.toLocaleString()}<span className="text-slate-400 text-sm font-normal"> / {castles.length.toLocaleString()}</span></p>
            </div>
            <p className="text-slate-300 text-xl font-bold">{totalPct}%</p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div className="bg-slate-400 h-1.5 rounded-full transition-all" style={{ width: `${totalPct}%` }} />
          </div>
        </div>

        {/* tier別進捗カード */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {tierStats.map(({ tier, total, visited, pct }) => {
            const cfg = TIER_CONFIG[tier]
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(prev => prev === tier ? 'all' : tier)}
                className={`rounded-xl p-3 border text-left transition ${
                  tierFilter === tier
                    ? `${cfg.bg} ${cfg.border}`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${cfg.color}`}>{cfg.badge}</span>
                  <span className={`text-xs font-bold ${cfg.color}`}>{pct}%</span>
                </div>
                <p className="text-sm font-semibold mb-0.5">{cfg.label}</p>
                <p className="text-xs text-slate-500">{visited} / {total}</p>
                <div className="w-full bg-slate-700 rounded-full h-1 mt-1.5">
                  <div className={`h-1 rounded-full transition-all ${
                    tier === 'S' ? 'bg-yellow-500' : tier === 'A' ? 'bg-orange-500' : tier === 'B' ? 'bg-sky-500' : 'bg-slate-500'
                  }`} style={{ width: `${pct}%` }} />
                </div>
              </button>
            )
          })}
        </div>

        {/* tierフィルタータブ */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              tierFilter === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/30'
            }`}
          >
            全て ({castles.length.toLocaleString()})
          </button>
          {TIERS.map(tier => {
            const cfg = TIER_CONFIG[tier]
            const count = castles.filter(c => c.tier === tier).length
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(prev => prev === tier ? 'all' : tier)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  tierFilter === tier
                    ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                }`}
              >
                {cfg.badge} {cfg.label} ({count})
              </button>
            )
          })}
        </div>

        {/* tier説明文 */}
        {tierFilter !== 'all' && (
          <p className="text-slate-500 text-xs mb-3">{TIER_CONFIG[tierFilter].desc}</p>
        )}

        {/* 絞り込みフィルター */}
        <div className="flex gap-2 mb-2 flex-wrap">
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
            placeholder="城名を検索..."
            className="flex-1 min-w-32 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => setUnvisitedOnly(v => !v)}
            className={`px-3 py-2 rounded-xl text-sm font-medium border flex-shrink-0 transition ${
              unvisitedOnly
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
            }`}
          >
            未制覇のみ
          </button>
        </div>

        <p className="text-slate-500 text-xs mb-3">{filtered.length.toLocaleString()}件表示</p>

        {/* 城リスト */}
        <div className="flex flex-wrap gap-2">
          {filtered.map(castle => {
            const cfg = TIER_CONFIG[castle.tier]
            const visited = visitedIds.has(castle.id)
            return (
              <div key={castle.id} className="flex items-center gap-0.5">
                <button
                  onClick={() => handleToggle(castle)}
                  className={`px-3 py-2 rounded-l-xl text-sm font-medium transition border-y border-l ${
                    visited
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-white'
                  }`}
                >
                  {castle.tier !== 'C' && (
                    <span className={`text-xs mr-1 ${visited ? 'text-white/80' : cfg.color}`}>
                      {castle.tier === 'S' ? '⭐' : castle.tier === 'A' ? '🏆' : '🥈'}
                    </span>
                  )}
                  {visited ? '✓ ' : ''}{castle.name}
                </button>
                <Link
                  href={`/spots/castle/${castle.id}`}
                  className={`px-2 py-2 rounded-r-xl text-xs transition border-y border-r ${
                    visited
                      ? 'bg-emerald-600 border-emerald-500 text-emerald-100 hover:bg-emerald-700'
                      : 'bg-white/5 border-white/10 text-slate-600 hover:text-slate-300 hover:border-white/30'
                  }`}
                  title="詳細・宿を探す"
                >
                  ›
                </Link>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p>条件に一致するお城がありません</p>
          </div>
        )}
      </div>
    </main>
  )
}
