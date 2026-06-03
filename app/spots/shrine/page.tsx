import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import shrineData from '@/lib/spots/shrine-temple.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '格式最高神社',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '勅祭社・三大神社・世界遺産神社など格式最高の社',
  },
  A: {
    label: '一之宮・著名大社',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '全国一之宮・明治神宮など全国的に著名な大社',
  },
  B: {
    label: '有名神社',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域を代表する有名神社・寺院',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他の神社・寺院',
  },
}

export default function ShrinePage() {
  return (
    <TieredSpotPage
      categoryId="shrine"
      label="神社"
      icon="⛩️"
      spots={shrineData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'B', 'C']}
      searchPlaceholder="神社名を検索..."
    />
  )
}
