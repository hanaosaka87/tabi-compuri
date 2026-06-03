import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import zooData from '@/lib/spots/zoo.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '日本を代表する動物園',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '旭山・上野・天王寺・多摩・東山など日本を代表する動物園9選',
  },
  A: {
    label: '全国有名動物園',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '全国的に人気の大型動物園・サファリパーク',
  },
  B: {
    label: '地域の動物園',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域で親しまれている動物園',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他の動物園・動物施設',
  },
}

export default function ZooPage() {
  return (
    <TieredSpotPage
      categoryId="zoo"
      label="動物園"
      icon="🦁"
      spots={zooData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'B', 'C']}
      searchPlaceholder="動物園名を検索..."
    />
  )
}
