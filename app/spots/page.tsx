import Link from 'next/link'
import Header from '@/app/components/Header'
import michiNoEkiData from '@/lib/spots/michi-no-eki.json'
import onsenData from '@/lib/spots/onsen.json'
import leisureData from '@/lib/spots/leisure.json'
import zooAqData from '@/lib/spots/zoo-aquarium.json'
import castleData from '@/lib/spots/castle.json'

const CATEGORIES = [
  {
    id: 'michi-no-eki',
    label: '道の駅',
    icon: '🚗',
    description: '全国の道の駅を制覇しよう',
    total: (michiNoEkiData as unknown[]).length,
    href: '/spots/michi-no-eki',
  },
  {
    id: 'onsen',
    label: '温泉',
    icon: '♨️',
    description: '名湯・秘湯を巡る温泉制覇',
    total: (onsenData as unknown[]).length,
    href: '/spots/onsen',
  },
  {
    id: 'castle',
    label: 'お城',
    icon: '🏯',
    description: '全国の城・城跡を制覇しよう',
    total: (castleData as unknown[]).length,
    href: '/spots/castle',
  },
  {
    id: 'leisure',
    label: '遊園地・テーマパーク',
    icon: '🎡',
    description: '全国の遊園地・テーマパークを制覇',
    total: (leisureData as unknown[]).length,
    href: '/spots/leisure',
  },
  {
    id: 'zoo-aquarium',
    label: '動物園・水族館',
    icon: '🦁',
    description: '全国の動物園・水族館を制覇',
    total: (zooAqData as unknown[]).length,
    href: '/spots/zoo-aquarium',
  },
]

export default function SpotsPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">🗺️ スポット制覇</h1>
        <p className="text-slate-400 text-sm mb-8">カテゴリを選んで制覇を目指そう</p>

        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => (
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
