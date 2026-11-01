'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import iconv from 'iconv-lite'
import { supabase } from '@/lib/supabase'
import { SpotData } from '@/lib/spotCategories'
import { getPrefectureFullName, getPrefectureName } from '@/lib/prefectures'
import Header from '@/app/components/Header'
import SpotUpdatesBoard from '@/app/components/SpotUpdatesBoard'

function encodeShiftJIS(str: string): string {
  const buf = iconv.encode(str, 'Shift_JIS')
  return Array.from(buf).map(b => `%${b.toString(16).toUpperCase().padStart(2, '0')}`).join('')
}

function getGoogleMapsUrl(spotName: string, prefCode: number) {
  const pref = getPrefectureFullName(prefCode)
  return `https://www.google.com/maps/search/${encodeURIComponent(pref + ' ' + spotName)}`
}

type BookingSite = {
  name: string
  icon: string
  color: string        // テキスト色クラス
  bg: string           // 背景色クラス
  border: string       // ボーダー色クラス
  getUrl: (prefCode: number, prefName: string, spotName: string) => string
}

const BOOKING_SITES: BookingSite[] = [
  {
    name: 'じゃらんnet',
    icon: '🏮',
    color: 'text-orange-300',
    bg: 'bg-orange-500/10 hover:bg-orange-500/20',
    border: 'border-orange-500/30',
    getUrl: (_p, _pn, name) => `https://px.a8.net/svt/ejp?a8mat=4B3VRA+DOZOY+14CS+6C9LD&a8ejpredirect=${encodeURIComponent(`https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword=${encodeShiftJIS(name)}&isMobileApp=false&isApp=0`)}`,
  },
  {
    name: '楽天トラベル',
    icon: '🦅',
    color: 'text-red-300',
    bg: 'bg-red-500/10 hover:bg-red-500/20',
    border: 'border-red-500/30',
    getUrl: (_p, _pn, name) =>
      `https://rpx.a8.net/svt/ejp?a8mat=4B3VR9+GC8AGI+2HOM+6I9N5&rakuten=y&a8ejpredirect=${encodeURIComponent(`https://kw.travel.rakuten.co.jp/keyword/Search.do?charset=utf-8&f_query=${encodeURIComponent(name)}&isApp=0`)}`,
  },
  {
    name: 'JTB',
    icon: '✈️',
    color: 'text-blue-300',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    border: 'border-blue-500/30',
    getUrl: (_p, _pn, name) => `https://px.a8.net/svt/ejp?a8mat=4B3VRA+RDYLU+15A4+1TIJEP&a8ejpredirect=${encodeURIComponent(`https://www.jtb.co.jp/kokunai-hotel/list/?keyword=${name}&isApp=0`)}`,
  },
  {
    name: '一休.com',
    icon: '🎎',
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    border: 'border-yellow-500/30',
    getUrl: (_p, _pn, name) => `https://px.a8.net/svt/ejp?a8mat=4B3VRA+UD4MQ+1OK+669JL&a8ejpredirect=${encodeURIComponent(`https://www.ikyu.com/search?kwd=${name}&ppc=2&rc=1&isApp=0`)}`,
  },
  {
    name: 'Yahoo!トラベル',
    icon: '🔴',
    color: 'text-purple-300',
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    border: 'border-purple-500/30',
    getUrl: (_p, _pn, name) => `https://px.a8.net/svt/ejp?a8mat=4B3VRA+XCANM+4ZCO+60OXE&a8ejpredirect=${encodeURIComponent(`https://travel.yahoo.co.jp/search?kwd=${name}&ppc=2&rc=1&isApp=0`)}`,
  },
  {
    name: 'Agoda',
    icon: '🌏',
    color: 'text-teal-300',
    bg: 'bg-teal-500/10 hover:bg-teal-500/20',
    border: 'border-teal-500/30',
    getUrl: (_p, _pn, name) => `https://px.a8.net/svt/ejp?a8mat=4B3YVC+2KA7JM+4X1W+5YRHE&a8ejpredirect=${encodeURIComponent(`https://www.agoda.com/search?q=${encodeURIComponent(name)}&lang=ja-jp&nomobileredirect=1`)}`,
  },
  {
    name: 'ゆこゆこネット',
    icon: '♨️',
    color: 'text-green-300',
    bg: 'bg-green-500/10 hover:bg-green-500/20',
    border: 'border-green-500/30',
    getUrl: (_p, _pn, name) =>
      `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3771667&pid=892622765&vc_url=${encodeURIComponent(`https://www.yukoyuko.net/search/?keyword=${encodeURIComponent(name)}&isApp=0`)}`,
  },
  {
    name: '日本旅行',
    icon: '🗾',
    color: 'text-red-300',
    bg: 'bg-red-500/10 hover:bg-red-500/20',
    border: 'border-red-500/30',
    getUrl: (_p, _pn, _name) =>
      `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3771667&pid=892622766&vc_url=${encodeURIComponent('https://www.nta.co.jp/yado/ranking/?SITE_ID=44080001&isApp=0')}`,
  },
]

type Props = {
  categoryId: string
  spotId: string
  category: { id: string; label: string; icon: string }
  spot: SpotData
}

export default function SpotDetailClient({ categoryId, spotId, category, spot }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [iitokodoriUrl, setIitokodoriUrl] = useState('')
  const [visited, setVisited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  // テスターフィードバック対応（2026-10-23）：同一ルート([category]/[id])のまま別スポットへ遷移すると
  // Next.jsのApp Routerが自動スクロールリセットをスキップし、前のページの途中スクロール位置が残ってしまうための対策
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [categoryId, spotId])

  useEffect(() => {
    const init = async () => {
      const [{ data: { user } }, { data: { session } }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ])
      const base = `https://iitokodori.vercel.app/search?q=${encodeURIComponent(spot.name)}&pref=${String(spot.prefecture_code).padStart(2, '0')}`
      setIitokodoriUrl(session
        ? `${base}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&token_type=bearer`
        : base
      )

      if (!user) { setIsGuest(true); setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase.from('spot_visits')
        .select('spot_id')
        .eq('user_id', user.id)
        .eq('spot_id', spotId)
        .eq('category', categoryId)
        .maybeSingle()
      setVisited(!!data)
      setLoading(false)
    }
    init()
  }, [categoryId, spotId, spot.name, spot.prefecture_code])

  const handleToggle = async () => {
    if (!userId || toggling) return
    setToggling(true)
    if (visited) {
      await supabase.from('spot_visits').delete()
        .eq('user_id', userId).eq('spot_id', spot.id).eq('category', categoryId)
      setVisited(false)
    } else {
      await supabase.from('spot_visits').insert({
        user_id: userId, spot_id: spot.id, category: categoryId,
        spot_name: spot.name, prefecture_code: spot.prefecture_code,
        visited_at: new Date().toISOString().split('T')[0],
      })
      setVisited(true)
    }
    setToggling(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">
      読み込み中...
    </div>
  )

  const prefName = getPrefectureFullName(spot.prefecture_code)
  const prefShort = getPrefectureName(spot.prefecture_code)

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* パンくず */}
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
          <Link href="/spots" className="hover:text-slate-300">スポット</Link>
          <span>›</span>
          <Link href={`/spots/${categoryId}`} className="hover:text-slate-300">{category.label}</Link>
          <span>›</span>
          <span className="text-white truncate">{spot.name}</span>
        </div>

        {/* スポット情報 */}
        <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-4">
            <span className="text-5xl flex-shrink-0">{category.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-400 text-sm mb-1">{category.label}</p>
              <h1 className="text-2xl font-bold leading-tight mb-2">{spot.name}</h1>
              {prefName && (
                <p className="text-slate-400 text-sm">📍 {prefName}</p>
              )}
            </div>
          </div>

          {/* 制覇チェックボタン */}
          <div className="mt-5">
            {isGuest ? (
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-3">記録するにはログインが必要です</p>
                <Link
                  href="/login"
                  className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3 rounded-xl transition"
                >
                  ログインして制覇を記録
                </Link>
              </div>
            ) : (
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`w-full py-3 rounded-xl font-bold text-base transition border ${
                  visited
                    ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-white/5 border-white/20 text-slate-300 hover:border-emerald-500 hover:text-white'
                }`}
              >
                {toggling ? '更新中...' : visited ? '✓ 制覇済み（タップで解除）' : `${category.icon} 制覇する`}
              </button>
            )}
          </div>

          {/* 記念の1枚を旅日記に残す（テスターフィードバック対応・2026-09-22） */}
          {visited && (
            <Link
              href={`/diary?pref=${spot.prefecture_code}&title=${encodeURIComponent(spot.name)}`}
              className="mt-3 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 hover:border-emerald-500/60 transition"
            >
              <span className="text-2xl">📷</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-300">記念の1枚を旅日記に残す</p>
                <p className="text-slate-400 text-xs truncate">写真つきで{spot.name}の思い出を記録できます</p>
              </div>
              <span className="ml-auto text-slate-500 text-sm flex-shrink-0">›</span>
            </Link>
          )}
        </div>

        {/* みんなの最新情報（ファン投稿ボード） */}
        <SpotUpdatesBoard categoryId={categoryId} spotId={spot.id} spotName={spot.name} />

        {/* Google マップで確認 */}
        <a
          href={getGoogleMapsUrl(spot.name, spot.prefecture_code)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 mb-5 hover:border-white/30 transition"
        >
          <span className="text-2xl">🗺️</span>
          <div>
            <p className="text-sm font-medium">Google マップで確認</p>
            <p className="text-slate-500 text-xs">場所・アクセスを調べる</p>
          </div>
          <span className="ml-auto text-slate-500 text-sm">›</span>
        </a>

        {/* レンタカー */}
        <p className="text-slate-400 text-xs mb-1">🚗 レンタカーを探す</p>
        <div className="mb-1 flex flex-col gap-2">
          <a
            href="https://rpx.a8.net/svt/ejp?a8mat=4B3VR9+GC8AGI+2HOM+6I9N5&rakuten=y&a8ejpredirect=https%3A%2F%2Ftravel.rakuten.co.jp%2Fcars%2F"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 hover:border-white/30 transition"
          >
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-sm font-medium">楽天レンタカー</p>
              <p className="text-slate-500 text-xs">{prefShort}のレンタカーを比較・予約</p>
            </div>
            <span className="ml-auto text-slate-500 text-sm">›</span>
          </a>
          <a
            href="https://px.a8.net/svt/ejp?a8mat=4B3YV4+FK8X0Y+2AIA+5ZU29"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 hover:border-white/30 transition"
          >
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-sm font-medium">スカイレンタカー</p>
              <p className="text-slate-500 text-xs">{prefShort}のレンタカーを比較・予約</p>
            </div>
            <span className="ml-auto text-slate-500 text-sm">›</span>
          </a>
        </div>
        <p className="text-amber-400/80 text-xs mb-5 text-center">
          📱 アプリが起動した場合は「ブラウザで開く」を選んでご予約ください
        </p>

        {/* アソビュー（体験・チケット予約）*/}
        <a
          href={`https://px.a8.net/svt/ejp?a8mat=4B3Y3C+8BH22A+455G+656YP&a8ejpredirect=${encodeURIComponent('https://www.asoview.com/?isApp=0')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-1 hover:border-green-500/60 transition"
        >
          <span className="text-2xl">🎡</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-300">アソビューでチケットを予約</p>
            <p className="text-slate-400 text-xs truncate">{spot.name}の体験・入場券を比較</p>
          </div>
          <span className="text-slate-500 text-sm flex-shrink-0">›</span>
        </a>
        <p className="text-amber-400/80 text-xs mb-5 text-center">
          📱 アプリが起動した場合は「ブラウザで開く」を選んでご予約ください
        </p>

        {/* 宿・旅行予約リンク */}
        <div className="mb-5">
          <h2 className="text-sm font-medium text-slate-400 mb-3">
            🏨 {prefShort}の宿・旅行を予約する
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {BOOKING_SITES.map((site) => (
              <a
                key={site.name}
                href={site.getUrl(spot.prefecture_code, prefShort, spot.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-1.5 ${site.bg} border ${site.border} rounded-xl px-2 py-3 transition text-center`}
              >
                <span className="text-xl">{site.icon}</span>
                <p className={`text-xs font-bold ${site.color} leading-tight`}>{site.name}</p>
              </a>
            ))}
          </div>
          <p className="text-amber-400/80 text-xs mt-2 text-center">
            📱 アプリが起動した場合は「ブラウザで開く」を選んでご予約ください
          </p>
          <p className="text-slate-600 text-xs mt-1 text-center">
            ※ 各サービスの外部サイトへ遷移します
          </p>
        </div>

        {/* いいとこどり連携バナー */}
        <a
          href={iitokodoriUrl || `https://iitokodori.vercel.app/search?q=${encodeURIComponent(spot.name)}&pref=${String(spot.prefecture_code).padStart(2, '0')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-5 hover:border-amber-500/60 transition"
        >
          <span className="text-2xl">🌸</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-300">「いいとこどり」で口コミを見る</p>
            <p className="text-slate-400 text-xs truncate">{spot.name}周辺のホテル・旅館の良かった声</p>
          </div>
          <span className="text-slate-500 text-sm flex-shrink-0">›</span>
        </a>

        {/* 同じ都道府県の他スポットへ誘導 */}
        <div className="bg-slate-800/40 border border-white/10 rounded-xl px-4 py-4 mb-5">
          <p className="text-sm text-slate-400 mb-3">📋 {prefShort}の{category.label}一覧へ戻る</p>
          <Link
            href={`/spots/${categoryId}?pref=${spot.prefecture_code}`}
            className="text-emerald-400 text-sm hover:underline"
          >
            {prefShort}の{category.label}をすべて見る →
          </Link>
        </div>

        {/* スポット一覧へ（都道府県の絞り込みを維持） */}
        <div className="text-center">
          <Link
            href={`/spots/${categoryId}?pref=${spot.prefecture_code}`}
            className="text-slate-500 text-sm hover:text-slate-300 transition"
          >
            ← {category.label}一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
