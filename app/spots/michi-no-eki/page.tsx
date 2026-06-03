import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'
import michiNoEkiData from '@/lib/spots/michi-no-eki.json'

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '人気No.1級',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: 'グランプリ受賞・観光スポット化した超人気道の駅',
  },
  A: {
    label: '都道府県トップ',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '各都道府県でトップクラスの人気を誇る道の駅',
  },
  B: {
    label: '有名道の駅',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域で人気の道の駅',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他の道の駅',
  },
}

export default function MichiNoEkiPage() {
  return (
    <TieredSpotPage
      categoryId="michi-no-eki"
      label="道の駅"
      icon="🚗"
      spots={michiNoEkiData as TieredSpot[]}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'C']}
      searchPlaceholder="道の駅名を検索..."
    />
  )
}
