'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import { calcBadges } from '@/lib/badges'
import Header from '@/app/components/Header'
import ShareModal from '@/app/components/ShareModal'
import ShareIcons from '@/app/components/ShareIcons'
import AiRecommend from '@/app/components/AiRecommend'

const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州']

const SPOT_CATEGORIES = [
  { id: 'michi-no-eki', label: '道の駅', icon: '🚗', total: 1238, href: '/spots/michi-no-eki' },
  { id: 'onsen', label: '温泉', icon: '♨️', total: 1774, href: '/spots/onsen' },
  { id: 'castle', label: 'お城', icon: '🏯', total: 1782, href: '/spots/castle' },
  { id: 'shrine', label: '神社', icon: '⛩️', total: 3047, href: '/spots/shrine' },
  { id: 'leisure', label: '遊園地', icon: '🎡', total: 186, href: '/spots/leisure' },
  { id: 'zoo-aquarium', label: '動物園・水族館', icon: '🦁', total: 264, href: '/spots/zoo-aquarium' },
]
const TOTAL_SPOTS = SPOT_CATEGORIES.reduce((s, c) => s + c.total, 0)
const TOTAL_CITIES = 1741

const getRank = (count: number) => {
  if (count === 47) return { label: '🏆 全国制覇', color: 'text-yellow-400' }
  if (count >= 40) return { label: '🥇 新幹線ゴールド', color: 'text-yellow-400' }
  if (count >= 30) return { label: '🥈 特急シルバー', color: 'text-slate-300' }
  if (count >= 20) return { label: '🥉 急行ブロンズ', color: 'text-orange-400' }
  if (count >= 10) return { label: '🚃 普通列車', color: 'text-emerald-400' }
  return { label: '🎒 旅のはじまり', color: 'text-slate-400' }
}

type SpotCounts = Record<string, number>

function StatRow({ icon, label, visited, total }: { icon: string; label: string; visited: number; total: number }) {
  const pct = total > 0 ? Math.round((visited / total) * 100) : 0
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-300">
          <span className="mr-2">{icon}</span>{label}
        </span>
        <span className="text-sm font-bold tabular-nums">
          {visited.toLocaleString()}
          <span className="text-slate-500 text-xs font-normal"> / {total.toLocaleString()}</span>
          <span className="text-emerald-400 text-xs ml-2">{pct}%</span>
        </span>
      </div>
      <div className="w-full bg-slate-700/60 rounded-full h-2">
        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct || 0}%` }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [visitedCodes, setVisitedCodes] = useState<Set<number>>(new Set())
  const [cityCount, setCityCount] = useState(0)
  const [spotCounts, setSpotCounts] = useState<SpotCounts>({})
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsGuest(true); setLoading(false); return }
      setUserId(user.id)

      const [prefRes, cityRes, spotRes] = await Promise.all([
        supabase.from('visits').select('prefecture_code').eq('user_id', user.id),
        supabase.from('city_visits').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('spot_visits').select('category').eq('user_id', user.id),
      ])

      if (prefRes.data) setVisitedCodes(new Set(prefRes.data.map((v) => v.prefecture_code)))
      setCityCount(cityRes.count ?? 0)

      const counts: SpotCounts = {}
      for (const row of spotRes.data ?? []) {
        counts[row.category] = (counts[row.category] ?? 0) + 1
      }
      setSpotCounts(counts)
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

  const prefCount = visitedCodes.size
  const totalSpotVisited = Object.values(spotCounts).reduce((a, b) => a + b, 0)
  const rank = getRank(prefCount)
  const badges = calcBadges(visitedCodes)
  const earnedBadges = badges.filter((b) => b.earned)

  const shareText = prefCount === 47
    ? `🏆 旅コンプリで日本全国47都道府県を制覇しました！ #旅コンプリ`
    : `🗾 旅コンプリで${prefCount}/47都道府県を制覇中！${rank.label} #旅コンプリ`

  const [shareModalText, setShareModalText] = useState('')

  const openShare = (text: string) => { setShareModalText(text); setShowShareModal(true) }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <>
    {showShareModal && (
      <ShareModal
        text={shareModalText}
        onClose={() => setShowShareModal(false)}
      />
    )}
    <main className="min-h-screen bg-slate-900 text-white pb-24">
      <Header />

      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">👀 ゲストモードで体験中 — 記録するにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ml-4">
            ログインして始める
          </Link>
        </div>
      )}

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

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── 全体制覇サマリー ── */}
        <div className="bg-gradient-to-br from-slate-800 to-emerald-950 border border-emerald-500/20 rounded-2xl p-5 mb-5">
          <div className="mb-4">
            <p className="text-slate-400 text-xs mb-0.5">現在のランク</p>
            <p className={`text-base font-bold ${rank.color}`}>{rank.label}</p>
          </div>

          <StatRow icon="🗾" label="都道府県" visited={isGuest ? 0 : prefCount} total={47} />
          <StatRow icon="🏘" label="市区町村" visited={isGuest ? 0 : cityCount} total={TOTAL_CITIES} />
          <StatRow icon="📍" label="スポット合計" visited={isGuest ? 0 : totalSpotVisited} total={TOTAL_SPOTS} />

          {!isGuest && <ShareIcons text={shareText} />}

          {!isGuest && earnedBadges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-slate-400 text-xs">獲得バッジ</p>
              <div className="flex items-center gap-1">
                {earnedBadges.slice(0, 5).map((b) => (
                  <span key={b.id} className="text-lg" title={b.label}>{b.emoji}</span>
                ))}
                {earnedBadges.length > 5 && (
                  <span className="text-slate-400 text-xs ml-1">+{earnedBadges.length - 5}</span>
                )}
                <Link href="/badges" className="text-slate-500 hover:text-white text-xs ml-2 transition">全部見る →</Link>
              </div>
            </div>
          )}
        </div>

        {/* ── AI旅提案 ── */}
        {!isGuest && (
          <AiRecommend
            visitedCodes={Array.from(visitedCodes)}
            spotCount={totalSpotVisited}
            cityCount={cityCount}
          />
        )}

        {/* ── スポット別制覇カード ── */}
        <h2 className="text-sm font-bold text-slate-400 mb-3">スポット制覇</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {SPOT_CATEGORIES.map((cat) => {
            const visited = isGuest ? 0 : (spotCounts[cat.id] ?? 0)
            const pct = Math.round((visited / cat.total) * 100)
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 rounded-2xl p-4 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-medium leading-tight">{cat.label}</span>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {visited.toLocaleString()}
                  <span className="text-slate-500 text-xs font-normal"> / {cat.total.toLocaleString()}</span>
                </p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-emerald-400 text-xs mt-1">{pct}%</p>
              </Link>
            )
          })}
        </div>

        {/* ── 都道府県マップ ── */}
        <h2 className="text-base font-bold mb-1">🗾 都道府県マップ</h2>
        <p className="text-slate-400 text-xs mb-4">訪れた都道府県をタップして記録しよう</p>

        {REGIONS.map((region) => (
          <div key={region} className="mb-5">
            <h3 className="text-slate-400 text-xs font-medium mb-2">{region}</h3>
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

        {/* ── バッジ ── */}
        <div className="flex items-center justify-between mt-2 mb-3">
          <h2 className="text-base font-bold">🏅 バッジ</h2>
          <Link href="/badges" className="text-slate-500 hover:text-white text-xs transition">
            {earnedBadges.length}/{badges.length} 獲得 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
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
                  onClick={() => openShare(`${badge.emoji} 旅コンプリで「${badge.label}」バッジを獲得しました！ #旅コンプリ`)}
                  className="ml-auto text-slate-500 hover:text-emerald-400 transition flex-shrink-0 text-base"
                  title="シェア"
                >
                  ↑
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
    </>
  )
}
