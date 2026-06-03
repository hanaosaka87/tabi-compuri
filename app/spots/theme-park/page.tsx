import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import amusementData from '@/lib/spots/amusement.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '超大型テーマパーク',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: 'ディズニー・USJ・富士急・ハウステンボスなど日本を代表するテーマパーク',
  },
  A: {
    label: '全国有名',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '全国的に有名なテーマパーク・遊園地',
  },
  B: {
    label: '人気施設',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域で人気の施設',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他',
  },
}

export default function ThemeParkPage() {
  return (
    <TieredSpotPage
      categoryId="amusement"
      label="テーマパーク・遊園地"
      icon="🎢"
      spots={amusementData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'B', 'C']}
      searchPlaceholder="施設名を検索..."
    />
  )
}
