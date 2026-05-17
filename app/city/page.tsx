'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import Header from '@/app/components/Header'

type City = { id: string; name: string }

export default function CityPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [selectedPref, setSelectedPref] = useState(27)
  const [cities, setCities] = useState<City[]>([])
  const [visitedCodes, setVisitedCodes] = useState<Set<string>>(new Set())
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [totalVisited, setTotalVisited] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsGuest(true)
        setLoadingPage(false)
        return
      }
      setUserId(user.id)
      const { count } = await supabase
        .from('city_visits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setTotalVisited(count ?? 0)
      setLoadingPage(false)
    }
    init()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingCities(true)
      if (isGuest) {
        const citiesRes = await fetch(`/api/cities?pref=${selectedPref}`).then((r) => r.json())
        setCities(citiesRes)
        setVisitedCodes(new Set())
        setLoadingCities(false)
        return
      }
      if (!userId) return
      const [citiesRes, visitsRes] = await Promise.all([
        fetch(`/api/cities?pref=${selectedPref}`).then((r) => r.json()),
        supabase.from('city_visits').select('city_code').eq('user_id', userId).eq('prefecture_code', selectedPref),
      ])
      setCities(citiesRes)
      setVisitedCodes(new Set((visitsRes.data ?? []).map((v: { city_code: string }) => v.city_code)))
      setLoadingCities(false)
    }
    load()
  }, [selectedPref, userId, isGuest])

  const handleToggle = async (city: City) => {
    if (!userId) { setShowLoginPrompt(true); return }
    if (visitedCodes.has(city.id)) {
      await supabase.from('city_visits').delete().eq('user_id', userId).eq('city_code', city.id)
      setVisitedCodes((prev) => { const s = new Set(prev); s.delete(city.id); return s })
      setTotalVisited((n) => n - 1)
    } else {
      await supabase.from('city_visits').insert({
        user_id: userId,
        city_code: city.id,
        city_name: city.name,
        prefecture_code: selectedPref,
        visited_at: new Date().toISOString().split('T')[0],
      })
      setVisitedCodes((prev) => new Set(prev).add(city.id))
      setTotalVisited((n) => n + 1)
    }
  }

  const prefName = PREFECTURES.find((p) => p.code === selectedPref)?.name ?? ''
  const visitedInPref = visitedCodes.size
  const filteredCities = cities.filter(c => search === '' || c.name.includes(search))

  if (loadingPage) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      {/* ゲストバナー */}
      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">🏘 ゲストモードで閲覧中 — 市区町村を記録するにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ml-4">
            ログインして始める
          </Link>
        </div>
      )}

      {/* ログイン促進モーダル */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4">🏘</div>
            <h2 className="text-xl font-bold mb-2">記録するにはログインが必要です</h2>
            <p className="text-slate-400 text-sm mb-6">無料登録して市区町村制覇を始めましょう！</p>
            <Link href="/login" className="block bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition mb-3">
              ログイン / 新規登録
            </Link>
            <button onClick={() => setShowLoginPrompt(false)} className="text-slate-500 text-sm hover:text-slate-300 transition">
              引き続き見る
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🏘 市区町村制覇</h1>
            {isGuest ? (
              <p className="text-slate-400 text-sm mt-1">全国1,741市区町村を制覇しよう</p>
            ) : (
              <p className="text-slate-400 text-sm mt-1">累計 <span className="text-emerald-400 font-bold">{totalVisited}</span> 市区町村を制覇中</p>
            )}
          </div>
        </div>

        {/* 都道府県セレクター + 検索 */}
        <div className="flex gap-2 mb-6">
          <select
            value={selectedPref}
            onChange={(e) => { setSelectedPref(Number(e.target.value)); setSearch('') }}
            className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition"
          >
            {PREFECTURES.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="市区町村を検索..."
            className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
          />
        </div>

        {/* 制覇ステータス */}
        {!loadingCities && cities.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800/50 border border-emerald-500/20 rounded-2xl px-5 py-4 mb-6">
            <p className="text-slate-400 text-sm">{prefName}の制覇状況</p>
            <p className="text-2xl font-bold mt-1">
              {visitedInPref}
              <span className="text-slate-400 text-base font-normal"> / {cities.length} 市区町村</span>
            </p>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((visitedInPref / cities.length) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 市区町村グリッド */}
        {loadingCities ? (
          <div className="text-center py-16 text-slate-500">読み込み中...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleToggle(city)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition border ${
                  visitedCodes.has(city.id)
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-white'
                }`}
              >
                {visitedCodes.has(city.id) ? '✓ ' : ''}{city.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
