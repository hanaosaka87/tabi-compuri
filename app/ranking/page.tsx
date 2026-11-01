'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/app/components/Header'

type RankEntry = {
  userId: string
  nickname: string
  count: number
  spotCount: number
  score: number
  rank: number
  isMe: boolean
}

const getRankLabel = (count: number) => {
  if (count === 47) return { label: '🏆 全国制覇', color: 'text-yellow-400' }
  if (count >= 40) return { label: '🥇 新幹線ゴールド', color: 'text-yellow-400' }
  if (count >= 30) return { label: '🥈 特急シルバー', color: 'text-slate-300' }
  if (count >= 20) return { label: '🥉 急行ブロンズ', color: 'text-orange-400' }
  if (count >= 10) return { label: '🚃 普通列車', color: 'text-emerald-400' }
  return { label: '🎒 旅のはじまり', color: 'text-slate-400' }
}

// テスターフィードバック対応（2026-10-23）：ランキングは実名・自己設定ニックネームに関わらず、常に架空の名前で表示する（プライバシー配慮）
// 2026-10-25：形容詞×名詞の「〇〇+何々」という組み合わせ式だと、先頭が同じ・構造が同じで「テンプレートっぽい」と繰り返し指摘されたため、
// 組み合わせ式自体を廃止し、1件ずつ独立した完結済みのニックネームを160件用意する方式に全面変更した
const NICKNAMES = [
  'ふらっとさん', 'ぶらりびと', '風来坊', '自由人', '風まかせ', '気まぐれ旅人', '名もなき旅人', '通りすがり', '流れ者', '渡り鳥',
  'さすらいびと', '旅がらす', '旅の虫', '旅バカ一代', 'ノマドワーカー', 'バックパッカー', 'ソロ旅派', 'ひとり旅派', '家族旅行派', '週末旅人',
  'プチ旅人', '弾丸旅人', 'のんびり旅人', 'ロングドライブ党', '鈍行派', '新幹線派', '高速バス派', 'レンタカー派', '夜行バス派', '車中泊派',
  'テント派', 'グランピング派', '温泉巡礼者', '朝風呂派', '夜風呂派', '露天風呂派', '日帰り温泉派', '道の駅マイスター', '道の駅コレクター', 'サービスエリア愛好家',
  'お城めぐり隊長', '神社仏閣ウォッチャー', '御朱印集め', 'パワースポット巡り', '絶景ハンター', '秘境ハンター', '離島マニア', '山派', '海派', '高原派',
  '渓谷派', '滝めぐり派', '紅葉狩り師', '桜前線を追う人', '雪見旅人', '花火観賞派', '夏祭りはしご族', '星空観測派', '夜景ハンター', '日の出を見に行く人',
  '日没を見送る人', '写真映え探求者', 'インスタ映え派', '動画記録派', '旅日記つける人', 'スタンプラリー王', 'スタンプ集め名人', '制覇マニア', '全国制覇中', '47都道府県踏破中',
  'コンプリちゃん', 'コンプリ番長', 'コンプリ王子', 'コンプリ姫', '制覇ハンター', '制覇職人', 'ご当地ハンター', 'ご当地グルメ派', '駅弁コレクター', '時刻表マニア',
  '乗り換え案内マスター', '鉄道好き', 'バス好き', '飛行機好き', '船旅派', 'フェリー愛好家', '車窓族', '方言収集家', 'ローカル線ファン', '地元民になりたい人',
  '旅の計画魔', '行き当たりばったり派', '地図読めない系', 'ナビ頼みの人', 'GPS信者', 'コンパス派', '紙地図派', '旅のしおり係', '旅支度の達人', '荷物最小主義',
  '荷物多め派', 'リュック派', 'スーツケース派', 'お土産買いすぎ派', 'お土産選びが得意', '現地グルメハンター', 'ソウルフード探求家', 'B級グルメ派', '高級旅館派', '民宿派',
  'ゲストハウス派', 'カプセルホテル派', 'ビジネスホテル派', 'キャンプ派', '車旅派', '自転車旅人', 'ツーリング好き', '徒歩旅人', '登山旅人', 'サイクリスト',
  'ランナー旅人', '早起き旅人', '夜型旅人', '朝活派', '夜更かし派', '寄り道上等', 'まっすぐ目的地派', '予定びっしり派', '余白を楽しむ派', '天気任せ旅人',
  '晴れ男', '晴れ女', '雨でも行く派', '旅の相棒募集中', '一人旅満喫中', '思い出作り中', '珍道中の人', 'カップル旅行中', '推し活ついでの旅人', '聖地巡礼派',
  '乗り鉄', '撮り鉄', '収集癖のある旅人', '行動力お化け', '気づけば旅人', '次はどこ行こう族', '旅好きが高じた人', '有給消化は旅へ', '休日は旅一択', '旅が生きがい',
  '日本のどこかにいる人', '今日も元気に移動中', '旅先で道に迷いがち', '地図より勘が頼り', '予約してから考える派', '現地で考える派', '旅の予算は青天井', '旅はコスパ重視', '旅は贅沢したい派', '旅の思い出は写真より記憶',
]

function hashUserId(userId: string): number {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0
  return Math.abs(h)
}

// テスターフィードバック対応（2026-10-24）：「同じニックネームは一切使わない」ため、表示対象のuserId全体で重複のない組み合わせを確定割当する
// （ハッシュ値だけで決めると候補数（160件）に収まらず衝突する可能性があるため、衝突時は別の候補へ順送りする）
function assignUniqueNicknames(userIds: string[]): Record<string, string> {
  const used = new Set<number>()
  const result: Record<string, string> = {}
  // ハッシュ値の小さい順ではなくuserId文字列順に処理し、割当結果を再現可能にする
  const sortedIds = [...userIds].sort()
  for (const userId of sortedIds) {
    const h = hashUserId(userId)
    let idx = h % NICKNAMES.length
    let tries = 0
    while (used.has(idx) && tries < NICKNAMES.length) {
      idx = (idx + 1) % NICKNAMES.length
      tries++
    }
    if (used.has(idx)) {
      // 160件を使い切った場合のみ、ユーザーID断片を付けて一意性を保証する
      result[userId] = `${NICKNAMES[h % NICKNAMES.length]}#${userId.slice(0, 4).toUpperCase()}`
    } else {
      used.add(idx)
      result[userId] = NICKNAMES[idx]
    }
  }
  return result
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([])
  const [myRank, setMyRank] = useState<RankEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) setIsGuest(true)

      const [visitsRes, spotsRes] = await Promise.all([
        supabase.from('visits').select('user_id'),
        supabase.from('spot_visits').select('user_id'),
      ])
      if (visitsRes.error) {
        setError('ランキングの取得に失敗しました')
        setLoading(false)
        return
      }

      const countMap: Record<string, number> = {}
      for (const row of visitsRes.data ?? []) {
        countMap[row.user_id] = (countMap[row.user_id] ?? 0) + 1
      }

      const spotMap: Record<string, number> = {}
      for (const row of spotsRes.data ?? []) {
        spotMap[row.user_id] = (spotMap[row.user_id] ?? 0) + 1
      }

      const nicknames = assignUniqueNicknames(Object.keys(countMap))

      const sorted: RankEntry[] = Object.entries(countMap)
        .map(([userId, count]) => {
          const spotCount = spotMap[userId] ?? 0
          return {
            userId,
            nickname: nicknames[userId],
            count,
            spotCount,
            score: count * 10 + spotCount,
            rank: 0,
            isMe: user ? userId === user.id : false,
          }
        })
        .sort((a, b) => b.score - a.score)
        .map((entry, i) => ({ ...entry, rank: i + 1 }))

      setRanking(sorted)
      const me = user ? (sorted.find((r) => r.isMe) ?? null) : null
      setMyRank(me)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />
      {isGuest && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3 flex items-center justify-between">
          <p className="text-emerald-400 text-sm">👀 ゲストモードで閲覧中 — ランキングに参加するにはログインが必要です</p>
          <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ml-4">
            参加する
          </Link>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">🏆 総合ランキング</h1>
        </div>
        <p className="text-slate-400 text-sm mb-1">都道府県×10 + スポット数 の総合スコアで順位を決定</p>
        <p className="text-slate-600 text-xs mb-6">都道府県1件 ＝ スポット10件分 ／ お名前はプライバシー保護のため、全員架空のニックネームで表示されます</p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* 自分の順位 */}
        {myRank && (
          <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800/50 border border-emerald-500/30 rounded-2xl p-4 mb-6">
            <p className="text-slate-400 text-xs mb-1">あなたの順位</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-emerald-400">{myRank.rank}位</span>
              <div>
                <p className="font-bold">{myRank.nickname} <span className="text-emerald-400 text-xs">（あなた）</span></p>
                <p className="text-slate-400 text-sm">{myRank.count}都道府県 · {myRank.spotCount}スポット</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-emerald-400 font-bold tabular-nums">{myRank.score.toLocaleString()}<span className="text-slate-500 text-xs font-normal"> pt</span></p>
                <p className={`text-xs ${getRankLabel(myRank.count).color}`}>{getRankLabel(myRank.count).label}</p>
              </div>
            </div>
          </div>
        )}

        {/* ランキング一覧 */}
        {ranking.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-4">🏆</div>
            <p>まだランキングデータがありません</p>
            <p className="text-sm mt-1">都道府県を記録するとランキングに反映されます</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((entry) => {
              const rl = getRankLabel(entry.count)
              const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition ${
                    entry.isMe
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="w-8 text-center">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-slate-500 font-bold text-sm">{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {entry.nickname}
                      {entry.isMe && <span className="text-emerald-400 text-xs ml-1">（あなた）</span>}
                    </p>
                    <p className={`text-xs ${rl.color}`}>{rl.label}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-emerald-400 tabular-nums">{entry.score.toLocaleString()}<span className="text-slate-500 text-xs font-normal"> pt</span></p>
                    <p className="text-slate-500 text-xs tabular-nums">{entry.count}都道府県 · {entry.spotCount}スポット</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
