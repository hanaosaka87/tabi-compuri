import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCategoryById, getSpotData, getAllJsonBackedParams, SpotData } from '@/lib/spotCategories'
import Header from '@/app/components/Header'
import SpotDetailClient from './SpotDetailClient'

const SUPABASE_CATEGORIES = ['festival', 'fireworks']

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

// JSON由来の約1.25万件は全件ビルド時に静的生成する（旧実装はスポット詳細ページを開くたびに
// カテゴリ全件分のJSON（最大460KB超）をクライアント側で再取得しており、CDNリクエストを無駄に消費していた）
export function generateStaticParams() {
  return getAllJsonBackedParams()
}

// festival・fireworks（Supabase由来）はビルド時生成の対象外のため、オンデマンドでの描画を許可する
export const dynamicParams = true
// festival・fireworksページのSupabase再取得頻度を抑える（1時間キャッシュ）
export const revalidate = 3600

async function resolveSpot(categoryId: string, spotId: string): Promise<SpotData | null> {
  if (SUPABASE_CATEGORIES.includes(categoryId)) {
    const { data } = await supabase.from('events').select('id,name,prefecture').eq('id', spotId).maybeSingle()
    if (!data) return null
    return { id: data.id, name: data.name, prefecture_code: PREF_CODE[data.prefecture ?? ''] ?? 0 }
  }
  const cat = getCategoryById(categoryId)
  if (!cat) return null
  const spots = getSpotData(cat.jsonFile)
  return spots.find((s) => s.id === spotId) ?? null
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>
}) {
  const { category: categoryId, id: spotId } = await params
  const category = getCategoryById(categoryId)
  const spot = category ? await resolveSpot(categoryId, spotId) : null

  if (!category || !spot) {
    return (
      <main className="min-h-screen bg-slate-900 text-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-400 text-lg mb-6">スポットが見つかりませんでした</p>
          <Link href="/spots" className="text-emerald-400 hover:underline">スポット一覧へ戻る</Link>
        </div>
      </main>
    )
  }

  return (
    <SpotDetailClient
      categoryId={categoryId}
      spotId={spotId}
      category={category}
      spot={spot}
    />
  )
}
