'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type UpdatePost = {
  id: string
  nickname: string
  body: string
  photo_url: string | null
  created_at: string
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return 'たった今'
  if (diffH < 24) return `${diffH}時間前`
  return `${Math.floor(diffH / 24)}日前`
}

// スポットごとの「みんなの最新情報」投稿ボード。ファン同士で最新情報を共有できるようにする
// （2026-09-26、テスターフィードバック対応：道の駅を深掘りしてほしいという要望への第一弾）
export default function SpotUpdatesBoard({ categoryId, spotId, spotName }: { categoryId: string; spotId: string; spotName: string }) {
  const [posts, setPosts] = useState<UpdatePost[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [body, setBody] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      const { data } = await supabase
        .from('spot_updates')
        .select('id, nickname, body, photo_url, created_at')
        .eq('category', categoryId)
        .eq('spot_id', spotId)
        .order('created_at', { ascending: false })
        .limit(20)
      setPosts(data || [])
      setLoading(false)
    }
    init()
  }, [categoryId, spotId])

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

  // 旅日記機能と同じStorageバケット（photos）を流用（2026-09-26追加：みんなの最新情報に写真添付）
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
    if (!userId || !body.trim()) return
    setSubmitting(true)
    setError('')

    let photo_url: string | null = null
    if (photoFile) {
      photo_url = await uploadPhoto(userId, photoFile)
      if (!photo_url) {
        setError('写真のアップロードに失敗しました')
        setSubmitting(false)
        return
      }
    }

    const { data, error: insertErr } = await supabase
      .from('spot_updates')
      .insert({
        category: categoryId,
        spot_id: spotId,
        spot_name: spotName,
        user_id: userId,
        nickname: nickname.trim() || '名無しの旅人',
        body: body.trim(),
        photo_url,
      })
      .select('id, nickname, body, photo_url, created_at')
      .single()
    if (insertErr || !data) {
      setError('投稿に失敗しました。もう一度お試しください。')
    } else {
      setPosts(prev => [data, ...prev])
      setBody('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setShowForm(false)
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl px-4 py-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-slate-300">📢 みんなの最新情報</h2>
        {userId ? (
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-emerald-400 text-xs font-bold hover:underline"
          >
            {showForm ? 'キャンセル' : '＋ 投稿する'}
          </button>
        ) : (
          <Link href="/login" className="text-emerald-400 text-xs hover:underline">ログインして投稿</Link>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
          <input
            type="text"
            placeholder="ニックネーム（任意）"
            value={nickname}
            maxLength={20}
            onChange={e => setNickname(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500"
          />
          <textarea
            placeholder={`${spotName}の最新情報（営業状況・新メニュー・イベント等）を教えてください`}
            value={body}
            maxLength={300}
            rows={3}
            onChange={e => setBody(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none"
          />

          {/* 写真添付（任意・1枚まで） */}
          {photoPreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="プレビュー"
                className="w-full h-40 object-cover rounded-lg"
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
              className="w-full h-20 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-300 transition"
            >
              <span className="text-lg">📷</span>
              <span className="text-xs">写真を添付（任意）</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm"
          >
            {submitting ? '投稿中...' : '投稿する'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500 text-xs">読み込み中...</p>
      ) : posts.length === 0 ? (
        <p className="text-slate-500 text-xs">まだ投稿がありません。最初の情報を投稿してみませんか？</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(p => (
            <div key={p.id} className="border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-300">{p.nickname}</span>
                <span className="text-[11px] text-slate-500">{relativeTime(p.created_at)}</span>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">{p.body}</p>
              {p.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photo_url}
                  alt={`${spotName}の投稿写真`}
                  className="mt-2 w-full max-h-64 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
