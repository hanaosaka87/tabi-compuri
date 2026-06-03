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

const FESTIVAL_S = [
  '祇園祭','天神祭','神田祭','山王祭',
  '博多祇園山笠','秋田竿燈まつり','竿燈まつり',
  '青森ねぶた祭','ねぶた祭','弘前ねぷたまつり',
  '阿波おどり','阿波踊り',
  'よさこい祭り','よさこい祭','高知よさこい',
  'さっぽろ雪まつり','札幌雪まつり',
  '仙台七夕まつり','仙台七夕',
  '長崎くんち','唐津くんち',
  '那覇大綱挽まつり',
  '岸和田だんじり祭',
  '灘のけんか祭り',
]

const FESTIVAL_A = [
  '弘前桜まつり','弘前城雪燈籠まつり',
  'YOSAKOIソーラン','YOSAKOI ソーラン',
  '男鹿のなまはげ','なまはげ柴灯まつり',
  '山形花笠まつり','花笠まつり',
  '会津まつり',
  '三社祭','浅草三社祭',
  '川越まつり',
  '高山祭','飛騨古川祭',
  '浜松まつり','名古屋まつり','郡上おどり','郡上踊り',
  '時代祭','葵祭','三船祭',
  '博多どんたく港まつり','博多どんたく',
  '長崎ランタンフェスティバル','長崎ペーロン',
  '熊本城まつり','別府温泉まつり',
  '那覇ハーリー',
  '佐賀バルーンフェスタ',
  '金沢百万石まつり',
]

const FESTIVAL_B = [
  '盛岡さんさ踊り','米沢上杉まつり','遠野まつり',
  '二本松提灯まつり',
  '熊谷うちわ祭',
  '岡崎城下家康公まつり',
  '松江水郷祭','倉敷','福山ばら祭','萩まつり',
  '高知龍馬まつり','大洲まつり',
  '久留米まつり','直方','平戸ザビエル上陸祭',
  '宮崎神宮大祭','知覧特攻平和祭','首里城祭',
]

function assignTier(name: string): Tier {
  if (FESTIVAL_S.some(s => name.includes(s) || s.includes(name))) return 'S'
  if (FESTIVAL_A.some(s => name.includes(s) || s.includes(name))) return 'A'
  if (FESTIVAL_B.some(s => name.includes(s) || s.includes(name))) return 'B'
  return 'C'
}

const TIER_CONFIG: Record<Tier, TierCfg> = {
  S: {
    label: '三大祭・ユネスコ',
    badge: '⭐S',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    bg: 'bg-yellow-500/20',
    barColor: 'bg-yellow-500',
    desc: '日本三大祭・ユネスコ無形文化遺産登録の祭り',
  },
  A: {
    label: '全国有名祭り',
    badge: '🏆A',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    bg: 'bg-orange-500/20',
    barColor: 'bg-orange-500',
    desc: '全国的に有名な伝統祭り・イベント',
  },
  B: {
    label: '地域有名祭り',
    badge: '🥈B',
    color: 'text-sky-400',
    border: 'border-sky-500/60',
    bg: 'bg-sky-500/20',
    barColor: 'bg-sky-500',
    desc: '地域を代表する有名な祭り',
  },
  C: {
    label: 'その他',
    badge: 'C',
    color: 'text-slate-400',
    border: 'border-slate-600',
    bg: 'bg-slate-700/40',
    barColor: 'bg-slate-500',
    desc: 'その他のお祭り・イベント',
  },
}

export default function FestivalPage() {
  const [spots, setSpots] = useState<TieredSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('id,name,prefecture')
      .eq('type', 'matsuri')
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
      categoryId="festival"
      label="お祭り"
      icon="🏮"
      spots={spots}
      tierConfig={TIER_CONFIG}
      tiers={['S', 'A', 'B', 'C']}
      searchPlaceholder="祭り名を検索..."
    />
  )
}
