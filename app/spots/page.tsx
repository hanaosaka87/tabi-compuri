import Link from 'next/link'
import Header from '@/app/components/Header'

const CATEGORIES = [
  {
    id: 'michi-no-eki',
    label: '道の駅',
    icon: '🚗',
    description: '全国1,238か所の道の駅を制覇しよう',
    total: 1238,
    href: '/spots/michi-no-eki',
  },
  {
    id: 'onsen',
    label: '温泉',
    icon: '♨️',
    description: '名湯・秘湯を巡る温泉制覇（準備中）',
    total: null,
    href: '#',
  },
  {
    id: 'amusement',
    label: '遊園地・テーマパーク',
    icon: '🎡',
    description: '全国の遊園地・テーマパークを制覇（準備中）',
    total: null,
    href: '#',
  },
  {
    id: 'zoo',
    label: '動物園・水族館',
    icon: '🦁',
    description: '全国の動物園・水族館を制覇（準備中）',
    total: null,
    href: '#',
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
              className={`flex items-center gap-5 px-6 py-5 rounded-2xl border transition ${
                cat.total
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40'
                  : 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed pointer-events-none'
              }`}
            >
              <span className="text-4xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-lg">{cat.label}</p>
                  {cat.total && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                      全{cat.total.toLocaleString()}か所
                    </span>
                  )}
                  {!cat.total && (
                    <span className="bg-white/10 text-slate-500 text-xs px-2 py-0.5 rounded-full">準備中</span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{cat.description}</p>
              </div>
              {cat.total && <span className="text-slate-500 text-xl flex-shrink-0">›</span>}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
