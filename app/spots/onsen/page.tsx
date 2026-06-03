import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import onsenData from '@/lib/spots/onsen.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '日本三名泉',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '草津・有馬・下呂 ── 江戸時代から名高い日本三名泉',
  },
  A: {
    label: '日本百名湯',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '全国的に有名な名湯・温泉地',
  },
  B: {
    label: '有名温泉地',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域を代表する有名温泉地',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他の温泉・湯治場',
  },
}

export default function OnsenPage() {
  return (
    <TieredSpotPage
      categoryId="onsen"
      label="温泉"
      icon="♨️"
      spots={onsenData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'B', 'C']}
      searchPlaceholder="温泉名を検索..."
    />
  )
}
