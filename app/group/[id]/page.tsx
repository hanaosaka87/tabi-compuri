'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PREFECTURES } from '@/lib/prefectures'
import Header from '@/app/components/Header'

const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州']

type Group = {
  id: string
  name: string
  icon: string
  invite_code: string
  created_by: string
}

type Member = {
  userId: string
  username: string
  visitedCodes: Set<number>
  spotCount: number
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setMyUserId(user.id)

      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!groupData) { router.push('/group'); return }
      setGroup(groupData)

      const { data: memberRows } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', id)

      if (!memberRows || memberRows.length === 0) { setLoading(false); return }

      const userIds = memberRows.map((r) => r.user_id)

      const [profilesRes, visitsRes, spotsRes] = await Promise.all([
        supabase.from('profiles').select('id, username').in('id', userIds),
        supabase.from('visits').select('user_id, prefecture_code').in('user_id', userIds),
        supabase.from('spot_visits').select('user_id').in('user_id', userIds),
      ])

      const usernameMap: Record<string, string> = {}
      for (const p of profilesRes.data ?? []) {
        if (p.username) usernameMap[p.id] = p.username
      }

      const visitMap: Record<string, Set<number>> = {}
      for (const uid of userIds) visitMap[uid] = new Set()
      for (const v of visitsRes.data ?? []) {
        visitMap[v.user_id]?.add(v.prefecture_code)
      }

      const spotMap: Record<string, number> = {}
      for (const s of spotsRes.data ?? []) {
        spotMap[s.user_id] = (spotMap[s.user_id] ?? 0) + 1
      }

      const memberList: Member[] = userIds
        .map((uid) => ({
          userId: uid,
          username: usernameMap[uid] ?? `旅人 #${uid.slice(0, 6).toUpperCase()}`,
          visitedCodes: visitMap[uid] ?? new Set(),
          spotCount: spotMap[uid] ?? 0,
        }))
        .sort((a, b) => b.visitedCodes.size - a.visitedCodes.size)

      setMembers(memberList)
      setLoading(false)
    }
    init()
  }, [id, router])

  const groupVisitedCodes = new Set(members.flatMap((m) => Array.from(m.visitedCodes)))
  const groupPct = Math.round((groupVisitedCodes.size / 47) * 100)

  const copyInviteCode = async () => {
    if (!group) return
    await navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const leaveGroup = async () => {
    if (!myUserId || !group) return
    if (!confirm('グループを退出しますか？')) return
    setLeaving(true)
    await supabase.from('group_members').delete().eq('group_id', group.id).eq('user_id', myUserId)
    router.push('/group')
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )
  if (!group) return null

  return (
    <main className="min-h-screen bg-slate-900 text-white pb-24">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* グループヘッダー */}
        <div className="bg-gradient-to-br from-slate-800 to-blue-950 border border-blue-500/20 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{group.icon}</span>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{group.name}</h1>
              <p className="text-slate-400 text-sm">{members.length}人のメンバー</p>
            </div>
          </div>

          {/* 招待コード */}
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="w-full text-left bg-white/5 border border-white/10 hover:border-blue-400/40 rounded-xl px-4 py-3 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-xs">📨 友達を招待する</p>
              <span className="text-slate-400 text-xs">{showInvite ? '▲' : '▼'}</span>
            </div>
            {showInvite && (
              <div className="flex items-center justify-between mt-2" onClick={(e) => e.stopPropagation()}>
                <p className="font-mono text-2xl font-bold text-white tracking-widest">{group.invite_code}</p>
                <button
                  onClick={copyInviteCode}
                  className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  {copied ? '✓ コピー' : 'コピー'}
                </button>
              </div>
            )}
          </button>
        </div>

        {/* グループ全体制覇サマリー */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <h2 className="text-sm font-bold text-slate-300 mb-3">🗾 グループ制覇マップ</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="text-slate-300">みんなで制覇した都道府県</span>
              <span className="font-bold">
                <span className="text-emerald-400 text-lg">{groupVisitedCodes.size}</span>
                <span className="text-slate-500 text-xs font-normal"> / 47</span>
                <span className="text-emerald-400 text-xs ml-2">{groupPct}%</span>
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${groupPct}%` }}
              />
            </div>
          </div>

          {REGIONS.map((region) => (
            <div key={region} className="mb-4 last:mb-0">
              <h3 className="text-slate-500 text-xs font-medium mb-2">{region}</h3>
              <div className="flex flex-wrap gap-1.5">
                {PREFECTURES.filter((p) => p.region === region).map((p) => {
                  const visitedBy = members.filter((m) => m.visitedCodes.has(p.code))
                  const isGroupVisited = visitedBy.length > 0
                  return (
                    <div
                      key={p.code}
                      title={isGroupVisited ? visitedBy.map((m) => m.username).join('・') + 'が訪問' : '未訪問'}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-default ${
                        isGroupVisited
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                    >
                      {isGroupVisited && '✓ '}{p.name}
                      {visitedBy.length > 1 && (
                        <span className="ml-1 text-[10px] text-emerald-500/80">×{visitedBy.length}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* メンバーランキング */}
        <h2 className="text-sm font-bold text-slate-300 mb-3">🏆 メンバー制覇ランキング</h2>
        <div className="flex flex-col gap-2 mb-6">
          {members.map((m, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
            const isMe = m.userId === myUserId
            const pct = Math.round((m.visitedCodes.size / 47) * 100)
            return (
              <div
                key={m.userId}
                className={`px-4 py-3 rounded-2xl border ${
                  isMe ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 text-center flex-shrink-0">
                    {medal ? (
                      <span className="text-lg">{medal}</span>
                    ) : (
                      <span className="text-slate-500 text-sm font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {m.username}
                      {isMe && <span className="text-emerald-400 text-xs ml-1">（あなた）</span>}
                    </p>
                    <p className="text-slate-400 text-xs">{m.visitedCodes.size}都道府県 · {m.spotCount}スポット</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-emerald-400 tabular-nums">
                      {m.visitedCodes.size}<span className="text-slate-500 text-xs font-normal"> 県</span>
                    </p>
                    <p className="text-slate-500 text-xs">{pct}%</p>
                  </div>
                </div>
                <div className="ml-10 w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* 退出ボタン */}
        <button
          onClick={leaveGroup}
          disabled={leaving}
          className="w-full text-slate-500 hover:text-red-400 text-sm transition py-3 border border-white/5 hover:border-red-500/20 rounded-xl"
        >
          {leaving ? '退出中...' : 'グループを退出する'}
        </button>
      </div>
    </main>
  )
}
