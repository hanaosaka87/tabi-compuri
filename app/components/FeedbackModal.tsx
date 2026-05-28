'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'bug', label: '🐛 バグ報告' },
  { value: 'request', label: '💡 改善要望' },
  { value: 'other', label: '💬 その他' },
]

export default function FeedbackModal({ appName, onClose }: { appName: string; onClose: () => void }) {
  const [category, setCategory] = useState('request')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!body.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('app_feedbacks').insert({
      app_name: appName,
      user_id: user?.id ?? null,
      category,
      body: body.trim(),
    })
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-3">📬</p>
            <p className="text-white font-bold mb-1">送信しました！</p>
            <p className="text-slate-400 text-sm mb-4">フィードバックを受け付けました。開発チームが確認します。</p>
            <button onClick={onClose} className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-medium">閉じる</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">フィードバック</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <p className="text-slate-400 text-sm mb-4">ご意見・ご要望をお聞かせください。</p>

            <div className="flex gap-2 mb-4">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex-1 text-xs py-2 rounded-xl border transition ${
                    category === c.value
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="内容を入力してください"
              rows={4}
              className="w-full bg-slate-700 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none mb-4 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={submit}
              disabled={!body.trim() || loading}
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
