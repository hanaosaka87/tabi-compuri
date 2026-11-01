import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import gameCenterData from '@/lib/spots/game-center.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '大手チェーン',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: 'GiGO・ラウンドワン・タイトーステーション・namco・アドアーズ等の全国チェーン店舗',
  },
  A: {
    label: '',
    badge: '',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '',
  },
  B: {
    label: '',
    badge: '',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '',
  },
  C: {
    label: 'ゲームセンター',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: '独立店・地域チェーンなど全国のゲームセンター',
  },
}

export default function GameCenterPage() {
  return (
    <TieredSpotPage
      categoryId="game-center"
      label="ゲームセンター"
      icon="🕹️"
      spots={gameCenterData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'C']}
      searchPlaceholder="ゲームセンター名を検索..."
    />
  )
}
