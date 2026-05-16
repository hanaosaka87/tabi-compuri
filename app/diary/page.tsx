'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PREFECTURES, getPrefectureName } from '@/lib/prefectures'
import Header from '@/app/components/Header'
import ShareModal from '@/app/components/ShareModal'

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
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [shareText, setShareText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsGuest(true)
        setLoading(false)
        return
      }
      setUserId(user.id)
      await fetchDiaries(user.id)
      setLoading(false)
    }
    init()
  }, [])

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
      <Header />

      {/* ゲストバナー */}
      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">📔 ゲストモードで閲覧中 — 日記を書くにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ml-4">
            ログインして始める
          </Link>
        </div>
      )}

      {/* ログイン促進モーダル */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4">📔</div>
            <h2 className="text-xl font-bold mb-2">日記を書くにはログインが必要です</h2>
            <p className="text-slate-400 text-sm mb-6">無料登録して旅の思い出を記録しましょう！</p>
            <Link href="/login" className="block bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition mb-3">
              ログイン / 新規登録
            </Link>
            <button onClick={() => setShowLoginPrompt(false)} className="text-slate-500 text-sm hover:text-slate-300 transition">
              引き続き見る
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8">
        {shareText && (
          <ShareModal text={shareText} onClose={() => setShareText('')} />
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">📔 旅日記</h1>
            {diaries.length > 0 && (
              <p className="text-slate-400 text-xs mt-0.5">{diaries.length}件の記録</p>
            )}
          </div>
          <button
            onClick={() => {
              if (isGuest) { setShowLoginPrompt(true); return }
              showForm ? handleCancelForm() : setShowForm(true)
            }}
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
        {isGuest ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">📔</div>
            <p>旅の思い出を記録しよう</p>
            <p className="text-sm mt-2 mb-6">ログインすると日記を書いて保存できます</p>
            <Link href="/login" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition">
              無料ではじめる
            </Link>
          </div>
        ) : diaries.length === 0 ? (
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
                          setShareText(`📔 ${getPrefectureName(diary.prefecture_code)}の旅「${diary.title}」${date} #旅コンプリ`)
                        }}
                        className="text-slate-600 hover:text-emerald-400 transition text-base"
                        title="シェア"
                      >
                        ↑
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
