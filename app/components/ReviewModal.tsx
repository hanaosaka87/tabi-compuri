'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReviewModal({ appName, onClose }: { appName: string; onClose: () => void }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (rating === 0) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('app_reviews').insert({
      app_name: appName,
      user_id: user?.id ?? null,
      rating,
      comment: comment.trim() || null,
    })
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-3">🙏</p>
            <p className="text-white font-bold mb-1">ありがとうございます！</p>
            <p className="text-slate-400 text-sm mb-4">レビューを受け付けました。</p>
            <button onClick={onClose} className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-medium">閉じる</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">アプリをレビュー</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <p className="text-slate-400 text-sm mb-5">旅コンプリはいかがでしたか？</p>

            <div className="flex justify-center gap-3 mb-5">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {s <= (hover || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-slate-400 text-xs mb-4">
                {['', 'もう少し頑張ります', '改善します', '普通', '良かった！', '最高！'][rating]}
              </p>
            )}

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="コメント（任意）"
              rows={3}
              className="w-full bg-slate-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none mb-4 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={submit}
              disabled={rating === 0 || loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-full text-sm font-medium transition"
            >
              {loading ? '送信中...' : '送信する'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
