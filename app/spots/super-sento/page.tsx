'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import Header from '@/app/components/Header'
import CompleteModal from '@/app/components/CompleteModal'
import rawData from '@/lib/spots/super-sento.json'

type SuperSento = {
  id: string
  name: string
  prefecture_code: number
  chain: string | null
}

const spots = rawData as SuperSento[]

type Tab = 'national' | 'chain'

export default function SuperSentoPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('national')

  const [selectedPref, setSelectedPref] = useState<number | 'all'>('all')
  const [search, setSearch] = useState('')
  const [unvisitedOnly, setUnvisitedOnly] = useState(false)
  const [showComplete, setShowComplete] = useState(false)

  const [expandedChain, setExpandedChain] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsGuest(true); setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('spot_visits')
        .select('spot_id')
        .eq('user_id', user.id)
        .eq('category', 'super-sento')
      if (data) setVisitedIds(new Set(data.map((v: { spot_id: string }) => v.spot_id)))
      setLoading(false)
    }
    init()
  }, [])

  const handleToggle = async (spot: SuperSento) => {
    if (!userId) { setShowLoginPrompt(true); return }
    if (visitedIds.has(spot.id)) {
      await supabase.from('spot_visits').delete()
        .eq('user_id', userId).eq('spot_id', spot.id)
      setVisitedIds(prev => { const s = new Set(prev); s.delete(spot.id); return s })
    } else {
      await supabase.from('spot_visits').insert({
        user_id: userId,
        spot_id: spot.id,
        category: 'super-sento',
        spot_name: spot.name,
        prefecture_code: spot.prefecture_code,
        visited_at: new Date().toISOString().split('T')[0],
      })
      setVisitedIds(prev => {
        const next = new Set(prev).add(spot.id)
        if (next.size === spots.length) setShowComplete(true)
        return next
      })
    }
  }

  const filtered = useMemo(() => spots.filter(s => {
    const matchPref = selectedPref === 'all' || s.prefecture_code === Number(selectedPref)
    const matchSearch = search === '' || s.name.includes(search)
    const matchUnvisited = !unvisitedOnly || !visitedIds.has(s.id)
    return matchPref && matchSearch && matchUnvisited
  }), [selectedPref, search, unvisitedOnly, visitedIds])

  const chains = useMemo(() => {
    const map = new Map<string, SuperSento[]>()
    spots.forEach(s => {
      if (!s.chain) return
      if (!map.has(s.chain)) map.set(s.chain, [])
      map.get(s.chain)!.push(s)
    })
    return Array.from(map.entries())
      .map(([name, branches]) => ({
        name,
        branches,
        visited: branches.filter(b => visitedIds.has(b.id)).length,
      }))
      .sort((a, b) => b.branches.length - a.branches.length)
  }, [visitedIds])

  const totalVisited = visitedIds.size
  const percent = spots.length > 0 ? Math.round(totalVisited / spots.length * 100) : 0

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">
      読み込み中...
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      {showComplete && (
        <CompleteModal
          emoji="🛁"
          title="スーパー銭湯制覇達成！"
          message={`全${spots.length}か所をコンプリートしました！🎊`}
          onClose={() => setShowComplete(false)}
        />
      )}

      {isGuest && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/30 px-4 py-3 flex items-center justify-between">
          <p className="text-cyan-400 text-sm">🛁 ゲストで閲覧中 — 記録するにはログインが必要です</p>
          <Link href="/login" className="bg-cyan-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ml-4">ログイン</Link>
        </div>
      )}

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🛁</div>
            <h2 className="text-xl font-bold mb-2">記録するにはログインが必要です</h2>
            <Link href="/login" className="block bg-cyan-500 text-white font-bold py-3 rounded-xl mb-3">ログイン / 新規登録</Link>
            <button onClick={() => setShowLoginPrompt(false)} className="text-slate-500 text-sm">引き続き見る</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1 text-sm">
            <Link href="/spots" className="text-slate-500 hover:text-slate-300">スポット</Link>
            <span className="text-slate-600">›</span>
            <span className="text-white">スーパー銭湯</span>
          </div>
          <h1 className="text-2xl font-bold">🛁 スーパー銭湯制覇</h1>
        </div>

        {/* 制覇状況バー */}
        <div className="bg-gradient-to-r from-cyan-900/50 to-slate-800/50 border border-cyan-500/20 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-slate-400 text-xs">全国制覇済み</p>
              <p className="text-3xl font-bold">
                {totalVisited}
                <span className="text-slate-400 text-base font-normal"> / {spots.length.toLocaleString()}</span>
              </p>
            </div>
            <p className="text-cyan-400 text-2xl font-bold">{percent}%</p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-0 mb-5 border-b border-white/10">
          <button
            onClick={() => setTab('national')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              tab === 'national'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🗺️ 全国制覇
          </button>
          <button
            onClick={() => setTab('chain')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              tab === 'chain'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🏢 チェーン支店制覇
          </button>
        </div>

        {/* 全国制覇タブ */}
        {tab === 'national' && (
          <>
            <div className="flex gap-2 mb-2 flex-wrap">
              <select
                value={selectedPref}
                onChange={e => setSelectedPref(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 flex-shrink-0"
              >
                <option value="all">全都道府県</option>
                {PREFECTURES.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="施設名・チェーン名を検索..."
                className="flex-1 min-w-32 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => setUnvisitedOnly(v => !v)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border flex-shrink-0 transition ${
                  unvisitedOnly
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'
                }`}
              >
                未制覇のみ
              </button>
            </div>

            <p className="text-slate-500 text-xs mb-3">{filtered.length.toLocaleString()}件表示</p>

            <div className="flex flex-wrap gap-2">
              {filtered.map(spot => (
                <div key={spot.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleToggle(spot)}
                    className={`px-3 py-2 rounded-l-xl text-sm font-medium transition border-y border-l ${
                      visitedIds.has(spot.id)
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    {visitedIds.has(spot.id) ? '✓ ' : ''}{spot.name}
                    {spot.chain && (
                      <span className="ml-1.5 text-xs opacity-50 font-normal">{spot.chain}</span>
                    )}
                  </button>
                  <Link
                    href={`/spots/super-sento/${spot.id}`}
                    className={`px-2 py-2 rounded-r-xl text-xs transition border-y border-r ${
                      visitedIds.has(spot.id)
                        ? 'bg-cyan-600 border-cyan-500 text-cyan-100 hover:bg-cyan-700'
                        : 'bg-white/5 border-white/10 text-slate-600 hover:text-slate-300 hover:border-white/30'
                    }`}
                    title="詳細"
                  >
                    ›
                  </Link>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <p>条件に一致するスポットがありません</p>
              </div>
            )}
          </>
        )}

        {/* チェーン支店制覇タブ */}
        {tab === 'chain' && (
          <>
            <p className="text-slate-500 text-xs mb-4">
              チェーンを選んで全支店の制覇を目指そう
            </p>
            <div className="flex flex-col gap-3">
              {chains.map(({ name, branches, visited }) => {
                const chainPercent = branches.length > 0
                  ? Math.round(visited / branches.length * 100)
                  : 0
                const isComplete = visited === branches.length
                const isExpanded = expandedChain === name

                return (
                  <div key={name} className={`border rounded-2xl overflow-hidden transition ${
                    isComplete
                      ? 'bg-yellow-500/5 border-yellow-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <button
                      onClick={() => setExpandedChain(isExpanded ? null : name)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <p className="font-bold">{name}</p>
                          {isComplete && (
                            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-medium">
                              🏆 全店制覇！
                            </span>
                          )}
                          <span className="text-slate-500 text-xs">
                            {branches.length}店舗
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                isComplete ? 'bg-yellow-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${chainPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums">
                            {visited}/{branches.length}
                          </span>
                          <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums">
                            {chainPercent}%
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-slate-500 text-xl flex-shrink-0 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        ›
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-white/10 pt-4">
                        <div className="flex flex-wrap gap-2">
                          {branches.map(branch => {
                            const displayName = branch.name.replace(name, '').trim() || branch.name
                            return (
                              <div key={branch.id} className="flex items-center gap-0.5">
                                <button
                                  onClick={() => handleToggle(branch)}
                                  className={`px-3 py-1.5 rounded-l-xl text-sm font-medium transition border-y border-l ${
                                    visitedIds.has(branch.id)
                                      ? 'bg-cyan-500 border-cyan-500 text-white'
                                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-cyan-500/50 hover:text-white'
                                  }`}
                                >
                                  {visitedIds.has(branch.id) ? '✓ ' : ''}{displayName}
                                </button>
                                <Link
                                  href={`/spots/super-sento/${branch.id}`}
                                  className={`px-2 py-1.5 rounded-r-xl text-xs transition border-y border-r ${
                                    visitedIds.has(branch.id)
                                      ? 'bg-cyan-600 border-cyan-500 text-cyan-100 hover:bg-cyan-700'
                                      : 'bg-white/5 border-white/10 text-slate-600 hover:text-slate-300 hover:border-white/30'
                                  }`}
                                  title="詳細"
                                >
                                  ›
                                </Link>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
