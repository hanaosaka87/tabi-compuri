'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/app/components/Header'

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [saved, setSaved] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single()
      if (data?.username) { setUsername(data.username); setSaved(data.username) }
      setLoading(false)
    }
    init()
  }, [router])

  const handleSave = async () => {
    if (!userId) return
    const trimmed = username.trim()
    if (!trimmed) { setError('ニックネームを入力してください'); return }
    if (trimmed.length > 20) { setError('20文字以内で入力してください'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('profiles').upsert({ id: userId, username: trimmed }, { onConflict: 'id' })
    if (err) { setError('保存に失敗しました: ' + err.message) }
    else { setSaved(trimmed) }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">読み込み中...</div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-24">
      <Header />
      <div className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">👤 プロフィール</h1>
        <p className="text-slate-400 text-sm mb-8">ランキングに表示される名前を設定できます</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <label className="block text-sm text-slate-400 mb-2">ニックネーム（20文字以内）</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            placeholder="例：旅好き太郎"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition mb-1"
          />
          <p className="text-slate-600 text-xs text-right mb-4">{username.length} / 20</p>

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || username.trim() === saved}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition"
          >
            {saving ? '保存中...' : username.trim() === saved && saved ? '✓ 保存済み' : '保存する'}
          </button>
        </div>

        {saved && (
          <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">ランキングでの表示名</p>
            <p className="text-xl font-bold text-emerald-400">{saved}</p>
          </div>
        )}

        <p className="text-slate-600 text-xs text-center mt-6">
          名前は全ユーザーのランキングに公開されます
        </p>
      </div>
    </main>
  )
}
