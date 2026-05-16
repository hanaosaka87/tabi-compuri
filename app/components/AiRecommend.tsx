'use client'

import { useState } from 'react'
import { getRecommendations } from '@/lib/recommend'

type Props = {
  visitedCodes: number[]
  spotCount: number
  cityCount: number
}

export default function AiRecommend({ visitedCodes }: Props) {
  const [recs, setRecs] = useState<ReturnType<typeof getRecommendations>>([])
  const [loaded, setLoaded] = useState(false)

  const generate = () => {
    setRecs(getRecommendations(visitedCodes))
    setLoaded(true)
  }

  return (
    <div className="bg-gradient-to-br from-violet-900/30 to-slate-800/50 border border-violet-500/20 rounded-2xl p-5 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <h2 className="text-sm font-bold text-violet-300">次のおすすめ旅先</h2>
      </div>

      {!loaded ? (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm mb-4">
            制覇状況をもとに次に行くべき都道府県を提案します
          </p>
          <button
            onClick={generate}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition"
          >
            ✨ おすすめを見る
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-3">
            {recs.map((r) => (
              <div
                key={r.code}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white">{r.prefecture}</p>
                  <p className="text-slate-400 text-xs">{r.reason}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={generate}
            className="mt-3 w-full text-violet-400 hover:text-violet-300 text-xs transition"
          >
            ↺ 再提案
          </button>
        </div>
      )}
    </div>
  )
}
