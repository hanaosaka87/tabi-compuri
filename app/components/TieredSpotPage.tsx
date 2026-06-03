'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import Header from '@/app/components/Header'
import CompleteModal from '@/app/components/CompleteModal'

export type Tier = 'S' | 'A' | 'B' | 'C'
export type TierCfg = {
  label: string
  badge: string
  color: string
  border: string
  bg: string
  barColor: string
  desc: string
}
export type TieredSpot = { id: string; name: string; prefecture_code: number; tier: Tier }

type Props = {
  categoryId: string
  label: string
  icon: string
  spots: TieredSpot[]
  tierConfig: Record<Tier, TierCfg>
  tiers: Tier[]
  searchPlaceholder?: string
}

const TIER_ORDER: Record<Tier, number> = { S: 0, A: 1, B: 2, C: 3 }

function SpotButton({
  spot, visited, categoryId, onToggle, cfg,
}: { spot: TieredSpot; visited: boolean; categoryId: string; onToggle: (s: TieredSpot) => void; cfg: TierCfg }) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => onToggle(spot)}
        className={`px-3 py-2 rounded-l-xl text-sm font-medium transition border-y border-l ${
          visited
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-white'
        }`}
      >
        {spot.tier !== 'C' && (
          <span className={`text-xs mr-1 ${visited ? 'text-white/80' : cfg.color}`}>
            {spot.tier === 'S' ? '⭐' : spot.tier === 'A' ? '🏆' : '🥈'}
          </span>
        )}
        {visited ? '✓ ' : ''}{spot.name}
      </button>
      <Link
        href={`/spots/${categoryId}/${spot.id}`}
        className={`px-2 py-2 rounded-r-xl text-xs transition border-y border-r ${
          visited
            ? 'bg-emerald-600 border-emerald-500 text-emerald-100 hover:bg-emerald-700'
            : 'bg-white/5 border-white/10 text-slate-600 hover:text-slate-300 hover:border-white/30'
        }`}
        title="詳細を見る"
      >
        ›
      </Link>
    </div>
  )
}

export default function TieredSpotPage({ categoryId, label, icon, spots, tierConfig, tiers, searchPlaceholder }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState<'all' | Tier>('all')
  const [selectedPref, setSelectedPref] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')
  const [unvisitedOnly, setUnvisitedOnly] = useState(false)
  const [completeModal, setCompleteModal] = useState<{ tier: Tier } | null>(null)

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

  const handleToggle = async (spot: TieredSpot) => {
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
      setVisitedIds(prev => {
        const next = new Set(prev).add(spot.id)
        const tierSpots = spots.filter(s => s.tier === spot.tier)
        if (tierSpots.every(s => next.has(s.id))) setCompleteModal({ tier: spot.tier })
        return next
      })
    }
  }

  const tierStats = tiers.map(tier => {
    const group = spots.filter(s => s.tier === tier)
    const visited = group.filter(s => visitedIds.has(s.id)).length
    return { tier, total: group.length, visited, pct: group.length ? Math.round(visited / group.length * 100) : 0 }
  })

  const totalVisited = visitedIds.size
  const totalPct = spots.length ? Math.round(totalVisited / spots.length * 100) : 0

  const filtered = spots
    .filter(s => {
      const matchTier = tierFilter === 'all' || s.tier === tierFilter
      const matchPref = selectedPref === 'all' || s.prefecture_code === Number(selectedPref)
      const matchSearch = search === '' || s.name.includes(search)
      const matchUnvisited = !unvisitedOnly || !visitedIds.has(s.id)
      return matchTier && matchPref && matchSearch && matchUnvisited
    })
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  const completeConfig = completeModal ? tierConfig[completeModal.tier] : null

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      {completeModal && completeConfig && (
        <CompleteModal
          emoji={icon}
          title={`${completeConfig.label}制覇達成！`}
          message={`${completeConfig.badge} ${completeConfig.label}をコンプリートしました！🎊`}
          onClose={() => setCompleteModal(null)}
        />
      )}

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
        {/* パンくず */}
        <div className="flex items-center gap-2 mb-1 text-sm">
          <Link href="/spots" className="text-slate-500 hover:text-slate-300">スポット</Link>
          <span className="text-slate-600">›</span>
          <span className="text-white">{label}</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">{icon} {label}制覇</h1>

        {/* 全体進捗 */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border border-white/10 rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-slate-400 text-xs">全体 制覇済み</p>
              <p className="text-2xl font-bold">{totalVisited.toLocaleString()}<span className="text-slate-400 text-sm font-normal"> / {spots.length.toLocaleString()}</span></p>
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
            const cfg = tierConfig[tier]
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(prev => prev === tier ? 'all' : tier)}
                className={`rounded-xl p-3 border text-left transition ${
                  tierFilter === tier ? `${cfg.bg} ${cfg.border}` : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${cfg.color}`}>{cfg.badge}</span>
                  <span className={`text-xs font-bold ${cfg.color}`}>{pct}%</span>
                </div>
                <p className="text-sm font-semibold mb-0.5">{cfg.label}</p>
                <p className="text-xs text-slate-500">{visited} / {total}</p>
                <div className="w-full bg-slate-700 rounded-full h-1 mt-1.5">
                  <div className={`h-1 rounded-full transition-all ${cfg.barColor}`} style={{ width: `${pct}%` }} />
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
              tierFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/30'
            }`}
          >
            全て ({spots.length.toLocaleString()})
          </button>
          {tiers.map(tier => {
            const cfg = tierConfig[tier]
            const count = spots.filter(s => s.tier === tier).length
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(prev => prev === tier ? 'all' : tier)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  tierFilter === tier ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                }`}
              >
                {cfg.badge} {cfg.label} ({count})
              </button>
            )
          })}
        </div>

        {tierFilter !== 'all' && (
          <p className="text-slate-500 text-xs mb-3">{tierConfig[tierFilter].desc}</p>
        )}

        {/* フィルター */}
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
            placeholder={searchPlaceholder ?? `${label}名を検索...`}
            className="flex-1 min-w-32 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => setUnvisitedOnly(v => !v)}
            className={`px-3 py-2 rounded-xl text-sm font-medium border flex-shrink-0 transition ${
              unvisitedOnly ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
            }`}
          >
            未制覇のみ
          </button>
        </div>

        <p className="text-slate-500 text-xs mb-3">{filtered.length.toLocaleString()}件表示</p>

        {/* スポットリスト */}
        {tierFilter === 'all' ? (
          <div>
            {tiers.map(tier => {
              const group = filtered.filter(s => s.tier === tier)
              if (group.length === 0) return null
              const cfg = tierConfig[tier]
              return (
                <div key={tier} className="mb-6">
                  <div className={`flex items-center gap-2 mb-3 pb-1.5 border-b ${cfg.border}`}>
                    <span className={`text-sm font-bold ${cfg.color}`}>{cfg.badge} {cfg.label}</span>
                    <span className="text-xs text-slate-500">{group.length}件</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.map(s => (
                      <SpotButton key={s.id} spot={s} visited={visitedIds.has(s.id)} categoryId={categoryId} onToggle={handleToggle} cfg={cfg} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map(s => (
              <SpotButton key={s.id} spot={s} visited={visitedIds.has(s.id)} categoryId={categoryId} onToggle={handleToggle} cfg={tierConfig[s.tier]} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p>条件に一致するスポットがありません</p>
          </div>
        )}
      </div>
    </main>
  )
}
