import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/app/components/Header'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'スポット制覇',
  description: '世界遺産・国立公園・道の駅・温泉・お城など全国のスポットを制覇しよう。',
}
export const dynamic = 'force-dynamic'

import michiNoEkiData from '@/lib/spots/michi-no-eki.json'
import onsenData from '@/lib/spots/onsen.json'
import amusementData from '@/lib/spots/amusement.json'
import themeParkData from '@/lib/spots/theme-park.json'
import zooData from '@/lib/spots/zoo.json'
import aquariumData from '@/lib/spots/aquarium.json'
import castleData from '@/lib/spots/castle.json'
import shrineData from '@/lib/spots/shrine-temple.json'
import heritageData from '@/lib/spots/japan-heritage.json'
import worldHeritageData from '@/lib/spots/world-heritage.json'
import nationalParkData from '@/lib/spots/national-park.json'
import damData from '@/lib/spots/dam.json'
import superSentoData from '@/lib/spots/super-sento.json'
import festivalData from '@/lib/spots/festival.json'

const CATEGORIES = [
  {
    id: 'world-heritage',
    label: '世界遺産',
    icon: '🌍',
    description: '日本国内のユネスコ世界遺産を制覇しよう',
    total: (worldHeritageData as unknown[]).length,
    href: '/spots/world-heritage',
    badge: 'コンプしやすい',
  },
  {
    id: 'national-park',
    label: '国立公園',
    icon: '🏔️',
    description: '全国34か所の国立公園を制覇しよう',
    total: (nationalParkData as unknown[]).length,
    href: '/spots/national-park',
    badge: 'コンプしやすい',
  },
  {
    id: 'theme-park',
    label: 'テーマパーク',
    icon: '🎢',
    description: '全国のテーマパークを制覇しよう',
    total: (themeParkData as unknown[]).length,
    href: '/spots/theme-park',
    badge: 'コンプしやすい',
  },
  {
    id: 'amusement',
    label: '遊園地',
    icon: '🎡',
    description: '全国の遊園地を制覇しよう',
    total: (amusementData as unknown[]).length,
    href: '/spots/amusement',
    badge: null,
  },
  {
    id: 'aquarium',
    label: '水族館',
    icon: '🐠',
    description: '全国の水族館を制覇しよう',
    total: (aquariumData as unknown[]).length,
    href: '/spots/aquarium',
    badge: null,
  },
  {
    id: 'zoo',
    label: '動物園',
    icon: '🦁',
    description: '全国の動物園を制覇しよう',
    total: (zooData as unknown[]).length,
    href: '/spots/zoo',
    badge: null,
  },
  {
    id: 'japan-heritage',
    label: '日本遺産',
    icon: '🏛️',
    description: '広域・単独ストーリーの文化財を制覇',
    total: (heritageData as unknown[]).length,
    href: '/spots/japan-heritage',
    badge: '⭐ 階層制あり',
  },
  {
    id: 'castle',
    label: 'お城',
    icon: '🏯',
    description: '現存天守・100名城・続100名城・全国の城跡を階層別に制覇',
    total: (castleData as unknown[]).length,
    href: '/spots/castle',
    badge: '⭐ 階層制あり',
  },
  {
    id: 'shrine',
    label: '神社',
    icon: '⛩️',
    description: '勅祭社・一之宮・別表神社など格式別に制覇',
    total: (shrineData as unknown[]).length,
    href: '/spots/shrine',
    badge: '⭐ 階層制あり',
  },
  {
    id: 'onsen',
    label: '温泉',
    icon: '♨️',
    description: '三名泉・百名湯から秘湯まで温泉制覇',
    total: (onsenData as unknown[]).length,
    href: '/spots/onsen',
    badge: '⭐ 階層制あり',
  },
  {
    id: 'michi-no-eki',
    label: '道の駅',
    icon: '🚗',
    description: 'グランプリ受賞・都道府県トップ人気まで道の駅制覇',
    total: (michiNoEkiData as unknown[]).length,
    href: '/spots/michi-no-eki',
    badge: '⭐ 階層制あり',
  },
  {
    id: 'dam',
    label: 'ダム',
    icon: '🏞️',
    description: '黒部・宮ヶ瀬など観光ダムから全国のダムを制覇',
    total: (damData as unknown[]).length,
    href: '/spots/dam',
    badge: '⭐ 階層制あり',
  },
  {
    id: 'super-sento',
    label: 'スーパー銭湯',
    icon: '🛁',
    description: '全国のスーパー銭湯制覇＋チェーン支店制覇',
    total: (superSentoData as unknown[]).length,
    href: '/spots/super-sento',
    badge: 'チェーン制覇あり',
  },
  {
    id: 'festival',
    label: 'お祭り',
    icon: '🏮',
    description: '三大祭・ユネスコ無形文化遺産から地域の祭りまで制覇',
    total: 0,
    href: '/spots/festival',
    badge: '⭐ 階層制あり',
  },
  {
    id: 'fireworks',
    label: '花火大会',
    icon: '🎆',
    description: '大曲・土浦・長岡の三大花火から全国花火大会を制覇',
    total: 0,
    href: '/spots/fireworks',
    badge: '⭐ 階層制あり',
  },
]

export default async function SpotsPage() {
  // 花火大会・お祭りの件数を Supabase から取得
  const [{ count: fireworksCount }, { count: festivalCount }] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('type', 'hanabi'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('type', 'matsuri'),
  ])
  const categories = CATEGORIES.map(c => {
    if (c.id === 'fireworks') return { ...c, total: fireworksCount ?? 0 }
    if (c.id === 'festival')  return { ...c, total: festivalCount  ?? 0 }
    return c
  })

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">🗺️ スポット制覇</h1>
        <p className="text-slate-400 text-sm mb-8">カテゴリを選んで制覇を目指そう</p>

        <div className="flex flex-col gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex items-center gap-5 px-6 py-5 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40 transition"
            >
              <span className="text-4xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-lg">{cat.label}</p>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                    全{cat.total.toLocaleString()}か所
                  </span>
                  {cat.badge && (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
                      🏆 {cat.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{cat.description}</p>
              </div>
              <span className="text-slate-500 text-xl flex-shrink-0">›</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
