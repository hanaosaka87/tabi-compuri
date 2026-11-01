'use client'

import { useEffect, useState } from 'react'

type Props = {
  count: number
  prefRemaining: number | null
  prefName: string | null
  milestone: boolean
  onDone: () => void
}

// テスターフィードバック対応（2026-10-19）：5個達成ごとに効果音を鳴らす。
// 外部音声ファイルを使わず、Web Audio APIで短い和音を都度合成する（著作権・アセット管理不要）。
function playMilestoneChime() {
  try {
    type WindowWithWebkitAudio = typeof window & { webkitAudioContext?: typeof AudioContext }
    const w = window as WindowWithWebkitAudio
    const AudioCtx = w.AudioContext ?? w.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const notes = [523.25, 659.25, 783.99] // ド・ミ・ソの上昇アルペジオ
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.1
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.45)
    })
    setTimeout(() => ctx.close(), 900)
  } catch {
    // 自動再生制限等で失敗しても無視（スタンプ表示は独立して機能する）
  }
}

// 「何個目クリアか」「このエリアはあと何個か」を投稿直後にトースト表示し、
// 5個達成ごとは効果音＋スタンプ風バッジで強調する（テスターフィードバック対応・2026-10-19）
export default function VisitToast({ count, prefRemaining, prefName, milestone, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 20)
    if (milestone) playMilestoneChime()
    const hide = setTimeout(() => setVisible(false), milestone ? 3000 : 2000)
    const done = setTimeout(onDone, milestone ? 3300 : 2300)
    return () => { clearTimeout(show); clearTimeout(hide); clearTimeout(done) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm pointer-events-none">
      <div
        className={`rounded-2xl border shadow-xl px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        } ${milestone ? 'bg-amber-400/95 border-amber-200' : 'bg-slate-800/95 border-white/10'}`}
      >
        {milestone ? (
          <div className="shrink-0 w-12 h-12 rounded-full border-4 border-slate-900 flex items-center justify-center -rotate-6 bg-amber-300">
            <span className="text-[10px] font-black leading-none text-center text-slate-900">{count}個<br />達成</span>
          </div>
        ) : (
          <span className="text-2xl shrink-0">✅</span>
        )}
        <div className="text-sm leading-snug">
          {milestone && <p className="font-black mb-0.5 text-slate-900">🎉 {count}個達成スタンプ獲得！</p>}
          <p className={`font-semibold ${milestone ? 'text-slate-900' : 'text-white'}`}>
            あなたの{count.toLocaleString()}個目の制覇です
          </p>
          {prefName && prefRemaining !== null && (
            <p className={`text-xs ${milestone ? 'text-slate-800' : 'text-slate-400'}`}>
              {prefRemaining > 0 ? `${prefName}はあと${prefRemaining}件` : `${prefName}は制覇済み！🎊`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
