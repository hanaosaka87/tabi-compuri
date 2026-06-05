'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/app/components/Header'

type Group = {
  id: string
  name: string
  icon: string
  invite_code: string
  created_by: string
  member_count?: number
}

const ICONS = ['👨‍👩‍👧', '👫', '👬', '👭', '🧑‍🤝‍🧑', '🏠', '✈️', '🗾', '🌸', '🚗']

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function GroupPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('👨‍👩‍👧')
  const [creating, setCreating] = useState(false)
  const [inviteInput, setInviteInput] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      await loadGroups(user.id)
      setLoading(false)
    }
    init()
  }, [router])

  async function loadGroups(uid: string) {
    const { data: memberRows } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', uid)

    if (!memberRows || memberRows.length === 0) { setGroups([]); return }

    const groupIds = memberRows.map((r) => r.group_id)
    const { data: groupRows } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .order('created_at', { ascending: false })

    if (!groupRows) { setGroups([]); return }

    const withCount = await Promise.all(
      groupRows.map(async (g) => {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', g.id)
        return { ...g, member_count: count ?? 0 }
      })
    )
    setGroups(withCount)
  }

  async function createGroup() {
    if (!userId || !newName.trim()) return
    setCreating(true)
    const invite_code = generateInviteCode()
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: newName.trim(), icon: newIcon, invite_code, created_by: userId })
      .select()
      .single()

    if (!error && data) {
      await supabase.from('group_members').insert({ group_id: data.id, user_id: userId })
      setShowCreate(false)
      setNewName('')
      router.push(`/group/${data.id}`)
    }
    setCreating(false)
  }

  async function joinGroup() {
    if (!userId || !inviteInput.trim()) return
    setJoining(true)
    setJoinError('')

    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteInput.trim().toUpperCase())
      .maybeSingle()

    if (!group) {
      setJoinError('招待コードが見つかりません')
      setJoining(false)
      return
    }

    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId })

    if (error) {
      setJoinError('すでにそのグループに参加しています')
    } else {
      setInviteInput('')
      router.push(`/group/${group.id}`)
    }
    setJoining(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-24">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">👨‍👩‍👧 グループ旅行</h1>
            <p className="text-slate-400 text-sm mt-0.5">みんなで旅を制覇しよう</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition"
          >
            ＋ 作成
          </button>
        </div>

        {/* 招待コードで参加 */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-bold text-blue-300 mb-3">📨 招待コードで参加</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
              placeholder="6桁のコード（例：ABC123）"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono tracking-widest"
              maxLength={6}
            />
            <button
              onClick={joinGroup}
              disabled={joining || inviteInput.trim().length < 6}
              className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white text-sm font-bold px-4 py-2 rounded-xl transition"
            >
              {joining ? '...' : '参加'}
            </button>
          </div>
          {joinError && <p className="text-red-400 text-xs mt-2">{joinError}</p>}
        </div>

        {/* グループ一覧 */}
        <h2 className="text-sm font-bold text-slate-400 mb-3">参加中のグループ</h2>
        {groups.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <p className="font-medium mb-1">まだグループがありません</p>
            <p className="text-sm">グループを作成するか、招待コードで参加しましょう</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/group/${g.id}`}
                className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/8 rounded-2xl p-4 transition"
              >
                <span className="text-3xl">{g.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{g.name}</p>
                  <p className="text-slate-400 text-sm">{g.member_count}人のメンバー</p>
                </div>
                <span className="text-slate-500 text-lg">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* グループ作成モーダル */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">グループを作成</h2>

            <div className="mb-4">
              <label className="text-slate-400 text-xs mb-1 block">グループ名（20文字以内）</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例：家族旅行、カップル旅"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                maxLength={20}
                autoFocus
              />
            </div>

            <div className="mb-5">
              <label className="text-slate-400 text-xs mb-2 block">アイコン</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className={`text-2xl p-2 rounded-xl border transition ${
                      newIcon === icon
                        ? 'border-emerald-400 bg-emerald-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={createGroup}
              disabled={creating || !newName.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition"
            >
              {creating ? '作成中...' : '作成する'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="w-full text-slate-500 text-sm mt-3 hover:text-slate-300 transition py-1"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
