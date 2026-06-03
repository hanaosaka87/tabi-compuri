import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import heritageData from '@/lib/spots/japan-heritage.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: 'プレミアム',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '',
  },
  A: {
    label: '広域・著名遺産',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '複数府県にまたがる広域認定ストーリー・世界遺産重複の日本遺産',
  },
  B: {
    label: '単独認定遺産',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '単一都道府県で認定された日本遺産ストーリーの構成文化財',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: '',
  },
}

export default function JapanHeritagePage() {
  return (
    <TieredSpotPage
      categoryId="japan-heritage"
      label="日本遺産"
      icon="🏛️"
      spots={heritageData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['A', 'B']}
      searchPlaceholder="遺産名を検索..."
    />
  )
}
