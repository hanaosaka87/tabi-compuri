'use client'

import { useState } from 'react'
import Link from 'next/link'

type Rec = { prefecture: string; reason: string; emoji: string }

type Props = {
  visitedCodes: number[]
  spotCount: number
  cityCount: number
}

export default function AiRecommend({ visitedCodes, spotCount, cityCount }: Props) {
  const [recs, setRecs] = useState<Rec[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  const fetch = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await window.fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitedCodes, spotCount, cityCount }),
      })
      const data = await res.json()
      if (data.recommendations) { setRecs(data.recommendations); setLoaded(true) }
      else setError('取得に失敗しました')
    } catch {
      setError('通信エラーが発生しました')
    }
    setLoading(false)
  }

  return (
    <div className="bg-gradient-to-br from-violet-900/30 to-slate-800/50 border border-violet-500/20 rounded-2xl p-5 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <h2 className="text-sm font-bold text-violet-300">AI旅提案</h2>
        <span className="bg-violet-500/20 text-violet-400 text-[10px] px-2 py-0.5 rounded-full">Beta</span>
      </div>

      {!loaded ? (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm mb-4">
            あなたの制覇状況をもとに、次に行くべき場所をAIが提案します
          </p>
          <button
            onClick={fetch}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AIが考え中...
              </span>
            ) : '✨ おすすめを教えて'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-3">
            {recs.map((r, i) => (
              <Link
                key={i}
                href="/dashboard"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition"
              >
                <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white">{r.prefecture}</p>
                  <p className="text-slate-400 text-xs truncate">{r.reason}</p>
                </div>
                <span className="text-slate-500 text-sm flex-shrink-0">›</span>
              </Link>
            ))}
          </div>
          <button
            onClick={fetch}
            disabled={loading}
            className="mt-3 w-full text-violet-400 hover:text-violet-300 text-xs transition disabled:opacity-50"
          >
            {loading ? 'AIが考え中...' : '↺ 再提案'}
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}
