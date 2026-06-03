import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import aquariumData from '@/lib/spots/aquarium.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '日本三大水族館',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '沖縄美ら海・海遊館・葛西臨海 ── 日本三大水族館',
  },
  A: {
    label: '全国有名水族館',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: 'サンシャイン水族館・名古屋港・鳥羽など全国的に人気の水族館',
  },
  B: {
    label: '地域の水族館',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域で親しまれている水族館',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他の水族館・海洋施設',
  },
}

export default function AquariumPage() {
  return (
    <TieredSpotPage
      categoryId="aquarium"
      label="水族館"
      icon="🐠"
      spots={aquariumData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'B', 'C']}
      searchPlaceholder="水族館名を検索..."
    />
  )
}
