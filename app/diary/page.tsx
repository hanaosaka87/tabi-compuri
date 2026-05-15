'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES, getPrefectureName } from '@/lib/prefectures'

type Diary = {
  id: string
  prefecture_code: number
  title: string
  body: string | null
  visited_date: string | null
  photo_url: string | null
  created_at: string
}

const EMPTY_FORM = { prefecture_code: 1, title: '', body: '', visited_date: '' }

export default function DiaryPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      await fetchDiaries(user.id)
      setLoading(false)
    }
    init()
  }, [router])

  const fetchDiaries = async (uid: string) => {
    const { data } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', uid)
      .order('visited_date', { ascending: false })
    if (data) setDiaries(data)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadPhoto = async (uid: string, file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `${uid}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('photos').upload(path, file)
    if (error) return null
    const { data } = supabase.storage.from('photos').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !form.title.trim()) return
    setSaving(true)
    setError('')

    let photo_url: string | null = null
    if (photoFile) {
      photo_url = await uploadPhoto(userId, photoFile)
      if (!photo_url) {
        setError('写真のアップロードに失敗しました')
        setSaving(false)
        return
      }
    }

    const { error } = await supabase.from('diaries').insert({
      user_id: userId,
      prefecture_code: form.prefecture_code,
      title: form.title.trim(),
      body: form.body.trim() || null,
      visited_date: form.visited_date || null,
      photo_url,
    })
    if (error) {
      setError('保存に失敗しました')
    } else {
      setForm(EMPTY_FORM)
      setPhotoFile(null)
      setPhotoPreview(null)
      setShowForm(false)
      await fetchDiaries(userId)
    }
    setSaving(false)
  }

  const handleDelete = async (diary: Diary) => {
    if (!userId) return
    if (diary.photo_url) {
      const path = diary.photo_url.split('/photos/')[1]
      if (path) await supabase.storage.from('photos').remove([path])
    }
    await supabase.from('diaries').delete().eq('id', diary.id).eq('user_id', userId)
    setDiaries((prev) => prev.filter((d) => d.id !== diary.id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setForm(EMPTY_FORM)
    setPhotoFile(null)
    setPhotoPreview(null)
    setError('')
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗾</span>
          <span className="text-lg font-bold">旅コンプリ</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition">マップ</Link>
          <Link href="/ranking" className="text-slate-400 hover:text-white transition">ランキング</Link>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition">ログアウト</button>
        </nav>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📔 旅日記</h1>
          <button
            onClick={() => showForm ? handleCancelForm() : setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            {showForm ? 'キャンセル' : '＋ 日記を書く'}
          </button>
        </div>

        {/* 新規作成フォーム */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">新しい日記</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">都道府県</label>
                <select
                  value={form.prefecture_code}
                  onChange={(e) => setForm({ ...form, prefecture_code: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition"
                >
                  {PREFECTURES.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">タイトル <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="例：初めての京都旅行"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">訪問日</label>
                <input
                  type="date"
                  value={form.visited_date}
                  onChange={(e) => setForm({ ...form, visited_date: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">本文</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={4}
                  placeholder="旅の思い出を書こう..."
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition resize-none"
                />
              </div>

              {/* 写真アップロード */}
              <div>
                <label className="text-slate-400 text-sm mb-2 block">写真</label>
                {photoPreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="プレビュー"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition"
                  >
                    <span className="text-3xl">📷</span>
                    <span className="text-sm">写真を選択</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
              >
                {saving ? '保存中...' : '保存する'}
              </button>
            </form>
          </div>
        )}

        {/* 日記一覧 */}
        {diaries.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">📔</div>
            <p>まだ日記がありません</p>
            <p className="text-sm mt-1">旅の思い出を記録しよう！</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {diaries.map((diary) => (
              <div key={diary.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition">
                {diary.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={diary.photo_url}
                    alt={diary.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">
                          {getPrefectureName(diary.prefecture_code)}
                        </span>
                        {diary.visited_date && (
                          <span className="text-slate-500 text-xs">{diary.visited_date}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-white truncate">{diary.title}</h3>
                      {diary.body && (
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{diary.body}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                      <button
                        onClick={() => {
                          const date = diary.visited_date ? ` (${diary.visited_date})` : ''
                          const text = `📔 ${diary.title}${date} #旅コンプリ\nhttps://tabi-compuri.hana.trickster.biz`
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                        }}
                        className="text-slate-600 hover:text-sky-400 transition text-base"
                        title="Xでシェア"
                      >
                        𝕏
                      </button>
                      <button
                        onClick={() => handleDelete(diary)}
                        className="text-slate-600 hover:text-red-400 transition text-lg"
                        title="削除"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
