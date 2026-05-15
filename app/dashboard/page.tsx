'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import { calcBadges } from '@/lib/badges'
import Header from '@/app/components/Header'

const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州']

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [visitedCodes, setVisitedCodes] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsGuest(true)
        setLoading(false)
        return
      }
      setUserId(user.id)
      const { data } = await supabase.from('visits').select('prefecture_code').eq('user_id', user.id)
      if (data) setVisitedCodes(new Set(data.map((v) => v.prefecture_code)))
      setLoading(false)
    }
    init()
  }, [])

  const handleToggleVisit = async (code: number) => {
    if (!userId) { setShowLoginPrompt(true); return }
    if (visitedCodes.has(code)) {
      await supabase.from('visits').delete().eq('user_id', userId).eq('prefecture_code', code)
      setVisitedCodes((prev) => { const s = new Set(prev); s.delete(code); return s })
    } else {
      await supabase.from('visits').insert({ user_id: userId, prefecture_code: code, visited_at: new Date().toISOString().split('T')[0] })
      setVisitedCodes((prev) => new Set(prev).add(code))
    }
  }

  const visitCount = visitedCodes.size
  const percent = Math.round((visitCount / 47) * 100)

  const getRank = (count: number) => {
    if (count === 47) return { label: '🏆 全国制覇', color: 'text-yellow-400' }
    if (count >= 40) return { label: '🥇 新幹線ゴールド', color: 'text-yellow-400' }
    if (count >= 30) return { label: '🥈 特急シルバー', color: 'text-slate-300' }
    if (count >= 20) return { label: '🥉 急行ブロンズ', color: 'text-orange-400' }
    if (count >= 10) return { label: '🚃 普通列車', color: 'text-emerald-400' }
    return { label: '🎒 旅のはじまり', color: 'text-slate-400' }
  }

  const rank = getRank(visitCount)

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      {/* ゲストバナー */}
      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">👀 ゲストモードで体験中 — 都道府県をタップして記録するにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ml-4">
            ログインして始める
          </Link>
        </div>
      )}

      {/* ログイン促進モーダル */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4">🗾</div>
            <h2 className="text-xl font-bold mb-2">記録するにはログインが必要です</h2>
            <p className="text-slate-400 text-sm mb-6">無料登録して旅の記録を始めましょう！</p>
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
        {/* 制覇ステータス */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800/50 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">制覇率</p>
              <p className="text-4xl font-bold text-white">{visitCount}<span className="text-slate-400 text-xl font-normal"> / 47都道府県</span></p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">ランク</p>
              <p className={`text-lg font-bold ${rank.color}`}>{rank.label}</p>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-right text-emerald-400 text-sm mt-1">{percent}%</p>
          <button
            onClick={() => {
              const text = visitCount === 47
                ? `🏆 日本全国47都道府県を制覇しました！ #旅コンプリ`
                : `🗾 旅コンプリで${visitCount}/47都道府県を制覇中！${rank.label} #旅コンプリ`
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white py-2.5 rounded-xl text-sm font-medium transition border border-white/10"
          >
            <span className="text-base">𝕏</span> シェアする
          </button>
        </div>

        {/* 都道府県グリッド */}
        <h2 className="text-lg font-bold mb-4">都道府県マップ</h2>
        <p className="text-slate-400 text-sm mb-4">訪れた都道府県をタップして記録しよう</p>

        {REGIONS.map((region) => (
          <div key={region} className="mb-6">
            <h3 className="text-slate-400 text-sm font-medium mb-2">{region}</h3>
            <div className="flex flex-wrap gap-2">
              {PREFECTURES.filter((p) => p.region === region).map((p) => (
                <button
                  key={p.code}
                  onClick={() => handleToggleVisit(p.code)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition border ${
                    visitedCodes.has(p.code)
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-white'
                  }`}
                >
                  {visitedCodes.has(p.code) ? '✓ ' : ''}{p.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* バッジ */}
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-4">🏅 バッジ</h2>
          <div className="grid grid-cols-2 gap-3">
            {calcBadges(visitedCodes).map((badge) => (
              <div
                key={badge.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition ${
                  badge.earned
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-white/5 border-white/10 opacity-40'
                }`}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${badge.earned ? 'text-white' : 'text-slate-500'}`}>
                    {badge.label}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{badge.description}</p>
                </div>
                {badge.earned && (
                  <button
                    onClick={() => {
                      const text = `${badge.emoji} 旅コンプリで「${badge.label}」バッジを獲得しました！ #旅コンプリ\nhttps://tabi-compuri.hana.trickster.biz`
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                    }}
                    className="ml-auto text-slate-500 hover:text-sky-400 transition flex-shrink-0 text-base"
                    title="Xでシェア"
                  >
                    𝕏
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
