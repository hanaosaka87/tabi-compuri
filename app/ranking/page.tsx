'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/app/components/Header'

type RankEntry = {
  userId: string
  count: number
  rank: number
  isMe: boolean
}

const getRankLabel = (count: number) => {
  if (count === 47) return { label: '🏆 全国制覇', color: 'text-yellow-400' }
  if (count >= 40) return { label: '🥇 新幹線ゴールド', color: 'text-yellow-400' }
  if (count >= 30) return { label: '🥈 特急シルバー', color: 'text-slate-300' }
  if (count >= 20) return { label: '🥉 急行ブロンズ', color: 'text-orange-400' }
  if (count >= 10) return { label: '🚃 普通列車', color: 'text-emerald-400' }
  return { label: '🎒 旅のはじまり', color: 'text-slate-400' }
}

const shortId = (uid: string) => `旅人 #${uid.slice(0, 6).toUpperCase()}`

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([])
  const [myRank, setMyRank] = useState<RankEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) setIsGuest(true)

      const { data, error } = await supabase.from('visits').select('user_id')
      if (error) {
        setError('ランキングの取得に失敗しました')
        setLoading(false)
        return
      }

      // user_id ごとに集計
      const countMap: Record<string, number> = {}
      for (const row of data ?? []) {
        countMap[row.user_id] = (countMap[row.user_id] ?? 0) + 1
      }

      const sorted: RankEntry[] = Object.entries(countMap)
        .sort(([, a], [, b]) => b - a)
        .map(([userId, count], i) => ({
          userId,
          count,
          rank: i + 1,
          isMe: user ? userId === user.id : false,
        }))

      setRanking(sorted)
      const me = user ? (sorted.find((r) => r.isMe) ?? null) : null
      setMyRank(me)
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
          <p className="text-emerald-400 text-sm">👀 ゲストモードで閲覧中 — ランキングに参加するにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ml-4">
            参加する
          </Link>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">🏆 都道府県制覇ランキング</h1>
        <p className="text-slate-400 text-sm mb-6">訪問数が多い旅人ほど上位に表示されます</p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* 自分の順位 */}
        {myRank && (
          <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800/50 border border-emerald-500/30 rounded-2xl p-4 mb-6">
            <p className="text-slate-400 text-xs mb-1">あなたの順位</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-emerald-400">{myRank.rank}位</span>
              <div>
                <p className="font-bold">{shortId(myRank.userId)} <span className="text-emerald-400 text-xs">（あなた）</span></p>
                <p className="text-slate-400 text-sm">{myRank.count}都道府県制覇</p>
              </div>
              <div className="ml-auto text-right">
                <p className={`text-sm font-bold ${getRankLabel(myRank.count).color}`}>
                  {getRankLabel(myRank.count).label}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ランキング一覧 */}
        {ranking.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">🏆</div>
            <p>まだランキングデータがありません</p>
            <p className="text-sm mt-1">都道府県を記録するとランキングに反映されます</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((entry) => {
              const rl = getRankLabel(entry.count)
              const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition ${
                    entry.isMe
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="w-8 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-slate-500 font-bold text-sm">{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {shortId(entry.userId)}
                      {entry.isMe && <span className="text-emerald-400 text-xs ml-1">（あなた）</span>}
                    </p>
                    <p className={`text-xs ${rl.color}`}>{rl.label}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-white">{entry.count}<span className="text-slate-400 text-xs font-normal"> / 47</span></p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
