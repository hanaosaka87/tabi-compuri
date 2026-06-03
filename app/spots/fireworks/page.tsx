'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TieredSpotPage, { type TieredSpot, type TierCfg, type Tier } from '@/app/components/TieredSpotPage'

const PREF_CODE: Record<string, number> = {
  '北海道':1,'青森県':2,'岩手県':3,'宮城県':4,'秋田県':5,'山形県':6,'福島県':7,
  '茨城県':8,'栃木県':9,'群馬県':10,'埼玉県':11,'千葉県':12,'東京都':13,'神奈川県':14,
  '新潟県':15,'富山県':16,'石川県':17,'福井県':18,'山梨県':19,'長野県':20,
  '岐阜県':21,'静岡県':22,'愛知県':23,'三重県':24,'滋賀県':25,'京都府':26,
  '大阪府':27,'兵庫県':28,'奈良県':29,'和歌山県':30,'鳥取県':31,'島根県':32,
  '岡山県':33,'広島県':34,'山口県':35,'徳島県':36,'香川県':37,'愛媛県':38,
  '高知県':39,'福岡県':40,'佐賀県':41,'長崎県':42,'熊本県':43,'大分県':44,
  '宮崎県':45,'鹿児島県':46,'沖縄県':47,
}

const FIREWORKS_S = [
  '全国花火競技大会','大曲の花火','大曲全国花火',
  '土浦全国花火競技大会','土浦花火',
  '長岡まつり大花火大会','長岡花火',
]

const FIREWORKS_A = [
  '隅田川花火大会','隅田川花火',
  'なにわ淀川花火大会','淀川花火',
  'みなとこうべ海上花火大会','みなとこうべ海上花火',
  'PL花火芸術','PL花火',
  '神宮外苑花火大会','神宮外苑',
  '諏訪湖祭湖上花火大会','諏訪湖花火',
  '熊野大花火大会','熊野花火',
  '宮島水中花火大会','宮島花火',
  '横浜開港祭花火大会',
  '葛飾納涼花火大会',
  '江戸川区花火大会',
  '足立の花火',
  '三河一色大花火大会',
  '名古屋みなと祭花火大会',
  '亀岡平和祭保津川花火大会',
  '天神まつり奉納花火',
  '博多どんたく花火大会',
  '日田祇園祭花火大会',
  '別府火祭り花火大会',
]

const FIREWORKS_B = [
  '函館港まつり花火大会','函館花火',
  '仙台七夕花火祭',
  '水戸黄門まつり花火大会',
  '高崎まつり花火大会',
  '八王子まつり花火大会',
  '長野えびす講花火大会',
  '浜松まつり花火大会',
  '豊田おいでんまつり花火大会',
  '大津祭花火',
  '城崎温泉花火大会',
  '松江水郷祭花火大会','松江花火',
  '広島みなと夢花火大会',
  '高松まつり花火大会',
  '高知花火大会',
  '筑後川花火大会',
  '熊本花火大会',
  '大分花火大会',
  '宮崎花火大会',
  '鹿児島花火大会',
  '那覇大綱挽花火大会',
]

function assignTier(name: string): Tier {
  if (FIREWORKS_S.some(s => name.includes(s) || s.includes(name))) return 'S'
  if (FIREWORKS_A.some(s => name.includes(s) || s.includes(name))) return 'A'
  if (FIREWORKS_B.some(s => name.includes(s) || s.includes(name))) return 'B'
  return 'C'
}

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '日本三大花火',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '大曲・土浦・長岡 ── 日本三大花火大会',
  },
  A: {
    label: '全国有名花火',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '隅田川・淀川・宮島など全国的に有名な花火大会',
  },
  B: {
    label: '地域有名花火',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域を代表する花火大会',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他の花火大会',
  },
}

export default function FireworksPage() {
  const [spots, setSpots] = useState<TieredSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('id,name,prefecture')
      .eq('type', 'hanabi')
      .order('prefecture')
      .then(({ data }) => {
        setSpots(
          (data ?? []).map(e => ({
            id: e.id,
            name: e.name,
            prefecture_code: PREF_CODE[e.prefecture ?? ''] ?? 0,
            tier: assignTier(e.name),
          }))
        )
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xl">読み込み中...</div>
  )

  return (
    <TieredSpotPage
      categoryId="fireworks"
      label="花火大会"
      icon="🎆"
      spots={spots}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'B', 'C']}
      searchPlaceholder="花火大会名を検索..."
    />
  )
}
