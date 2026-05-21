'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCategoryById, loadSpotData, SpotData } from '@/lib/spotCategories'
import { getPrefectureFullName, getPrefectureName } from '@/lib/prefectures'
import Header from '@/app/components/Header'

// ASP承認後にアフィリエイトパラメータを追加する
function getJalanUrl(prefCode: number, spotName: string) {
  const pref = getPrefectureName(prefCode)
  return `https://www.jalan.net/yado/search/?freeWord=${encodeURIComponent(pref + ' ' + spotName)}`
}

function getRakutenUrl(prefCode: number) {
  const code = String(prefCode).padStart(2, '0')
  return `https://travel.rakuten.co.jp/area/${code}/`
}

function getGoogleMapsUrl(spotName: string, prefCode: number) {
  const pref = getPrefectureFullName(prefCode)
  return `https://www.google.com/maps/search/${encodeURIComponent(pref + ' ' + spotName)}`
}

export default function SpotDetailPage() {
  const params = useParams()
  const categoryId = params.category as string
  const spotId = params.id as string

  const [spot, setSpot] = useState<SpotData | null>(null)
  const [category, setCategory] = useState<{ id: string; label: string; icon: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [visited, setVisited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const init = async () => {
      const cat = getCategoryById(categoryId)
      if (!cat) { setNotFound(true); setLoading(false); return }
      setCategory(cat)

      const spots = await loadSpotData(cat.jsonFile)
      const found = spots.find((s) => s.id === spotId)
      if (!found) { setNotFound(true); setLoading(false); return }
      setSpot(found)

      const { data: { user } } = await supabase.auth.getUser()
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
  }, [categoryId, spotId])

  const handleToggle = async () => {
    if (!userId || !spot || toggling) return
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

  if (notFound || !spot || !category) return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-lg mb-6">スポットが見つかりませんでした</p>
        <Link href="/spots" className="text-emerald-400 hover:underline">スポット一覧へ戻る</Link>
      </div>
    </main>
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
        </div>

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

        {/* 宿・旅行予約リンク */}
        <div className="mb-5">
          <h2 className="text-sm font-medium text-slate-400 mb-3">
            🏨 {prefShort}の宿を予約する
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={getJalanUrl(spot.prefecture_code, spot.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-4 hover:bg-orange-500/20 transition text-center"
            >
              <span className="text-2xl">🏮</span>
              <div>
                <p className="text-sm font-bold text-orange-300">じゃらんnetで探す</p>
                <p className="text-xs text-slate-500 mt-0.5">周辺の宿・温泉宿</p>
              </div>
            </a>
            <a
              href={getRakutenUrl(spot.prefecture_code)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-4 hover:bg-red-500/20 transition text-center"
            >
              <span className="text-2xl">🦅</span>
              <div>
                <p className="text-sm font-bold text-red-300">楽天トラベルで探す</p>
                <p className="text-xs text-slate-500 mt-0.5">お得なプランを比較</p>
              </div>
            </a>
          </div>
          <p className="text-slate-600 text-xs mt-2 text-center">
            ※ 外部サイトへ遷移します
          </p>
        </div>

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

        {/* 全スポット一覧へ */}
        <div className="text-center">
          <Link
            href={`/spots/${categoryId}`}
            className="text-slate-500 text-sm hover:text-slate-300 transition"
          >
            ← {category.label}一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
