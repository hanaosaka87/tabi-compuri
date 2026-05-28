'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
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

// チェーン制覇お祝いモーダル
function ChainCompleteModal({
  chainName,
  branchCount,
  onClose,
}: {
  chainName: string
  branchCount: number
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 70}%`,
        delay: `${Math.random() * 1.2}s`,
        duration: `${0.6 + Math.random() * 0.8}s`,
        emoji: ['🏆', '✨', '🌟', '🎊', '💫', '🛁', '⭐', '🥇'][Math.floor(Math.random() * 8)],
        size: Math.random() > 0.7 ? 'text-3xl' : 'text-xl',
        key: i,
      })),
    []
  )

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 px-6 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={handleClose}
    >
      {/* パーティクル */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <span
            key={p.key}
            className={`absolute ${p.size} animate-bounce`}
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      <div
        className={`relative max-w-sm w-full text-center transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 外枠グロー */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-yellow-400 via-yellow-500 to-amber-600 opacity-60 blur-lg" />

        <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-yellow-400/60 rounded-3xl p-8 shadow-2xl">
          {/* トロフィー */}
          <div
            className="text-8xl mb-3"
            style={{ filter: 'drop-shadow(0 0 16px #facc15)' }}
          >
            🏆
          </div>

          <p className="text-yellow-400 text-sm font-bold tracking-widest uppercase mb-1">
            チェーン全店制覇
          </p>

          <h2 className="text-2xl font-black text-white mb-1 leading-tight">
            {chainName}
          </h2>

          <p className="text-yellow-300 text-lg font-bold mb-1">
            全{branchCount}店舗 コンプリート！
          </p>

          <p className="text-slate-400 text-sm mb-6">
            すべての支店を制覇しました🎊
          </p>

          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-2xl font-black text-base text-slate-900 transition active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #facc15, #f59e0b)',
              boxShadow: '0 4px 20px rgba(250,204,21,0.5)',
            }}
          >
            最高！！🎉
          </button>
        </div>
      </div>
    </div>
  )
}

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
  const [chainComplete, setChainComplete] = useState<{ name: string; count: number } | null>(null)

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

  const handleToggle = useCallback(async (spot: SuperSento) => {
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
        // 全国制覇チェック
        if (next.size === spots.length) setShowComplete(true)
        // チェーン制覇チェック
        if (spot.chain) {
          const chainBranches = spots.filter(s => s.chain === spot.chain)
          const allDone = chainBranches.every(b => next.has(b.id))
          if (allDone) setChainComplete({ name: spot.chain, count: chainBranches.length })
        }
        return next
      })
    }
  }, [userId, visitedIds])

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
          title="全国スーパー銭湯制覇！"
          message={`全${spots.length}か所をコンプリートしました！🎊`}
          onClose={() => setShowComplete(false)}
        />
      )}

      {chainComplete && (
        <ChainCompleteModal
          chainName={chainComplete.name}
          branchCount={chainComplete.count}
          onClose={() => setChainComplete(null)}
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
            <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-0 mb-5 border-b border-white/10">
          <button
            onClick={() => setTab('national')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              tab === 'national' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            🗺️ 全国制覇
          </button>
          <button
            onClick={() => setTab('chain')}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              tab === 'chain' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
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
            <p className="text-slate-500 text-xs mb-4">チェーンを選んで全支店の制覇を目指そう</p>
            <div className="flex flex-col gap-3">
              {chains.map(({ name, branches, visited }) => {
                const chainPercent = branches.length > 0 ? Math.round(visited / branches.length * 100) : 0
                const isComplete = visited === branches.length
                const isExpanded = expandedChain === name

                return (
                  <div
                    key={name}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isComplete
                        ? 'border-yellow-400/50'
                        : 'bg-white/5 border-white/10'
                    }`}
                    style={isComplete ? {
                      background: 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(30,41,59,0.95))',
                      boxShadow: '0 0 20px rgba(234,179,8,0.15)',
                    } : undefined}
                  >
                    <button
                      onClick={() => setExpandedChain(isExpanded ? null : name)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {isComplete && <span className="text-xl">🏆</span>}
                          <p className={`font-bold ${isComplete ? 'text-yellow-300' : 'text-white'}`}>{name}</p>
                          {isComplete ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047' }}
                            >
                              全店制覇達成！
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">{branches.length}店舗</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${chainPercent}%`,
                                background: isComplete
                                  ? 'linear-gradient(90deg, #facc15, #f59e0b)'
                                  : '#22d3ee',
                                boxShadow: isComplete ? '0 0 8px rgba(250,204,21,0.6)' : undefined,
                              }}
                            />
                          </div>
                          <span className={`text-xs flex-shrink-0 tabular-nums font-medium ${isComplete ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {visited}/{branches.length}
                          </span>
                          <span className={`text-xs flex-shrink-0 tabular-nums ${isComplete ? 'text-yellow-500' : 'text-slate-500'}`}>
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
                            const done = visitedIds.has(branch.id)
                            return (
                              <div key={branch.id} className="flex items-center gap-0.5">
                                <button
                                  onClick={() => handleToggle(branch)}
                                  className={`px-3 py-1.5 rounded-l-xl text-sm font-medium transition border-y border-l ${
                                    done
                                      ? 'bg-cyan-500 border-cyan-500 text-white'
                                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-cyan-500/50 hover:text-white'
                                  }`}
                                >
                                  {done ? '✓ ' : ''}{displayName}
                                </button>
                                <Link
                                  href={`/spots/super-sento/${branch.id}`}
                                  className={`px-2 py-1.5 rounded-r-xl text-xs transition border-y border-r ${
                                    done
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
