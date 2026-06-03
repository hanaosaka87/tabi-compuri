import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import damData from '@/lib/spots/dam.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '観光・巨大ダム',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '黒部・宮ヶ瀬・奥只見など日本を代表する巨大・観光ダム15選',
  },
  A: {
    label: '主要ダム',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '各地域の主要な多目的ダム',
  },
  B: {
    label: '有名ダム',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域の有名なダム',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他のダム',
  },
}

export default function DamPage() {
  return (
    <TieredSpotPage
      categoryId="dam"
      label="ダム"
      icon="🏞️"
      spots={damData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'C']}
      searchPlaceholder="ダム名を検索..."
    />
  )
}
