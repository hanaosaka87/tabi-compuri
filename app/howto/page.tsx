import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/app/components/Header'

export const metadata: Metadata = {
  title: '遊び方 | 旅コンプリ',
  description: '旅コンプリの遊び方・楽しみ方を紹介します。都道府県・市区町村・17カテゴリのスポット制覇、日記、ランキング、バッジ、グループ機能の使い方がわかります。',
}

const BASICS = [
  { step: '1', emoji: '📍', title: '訪れた場所を記録', desc: '都道府県マップ・市区町村・17カテゴリのスポット（お城・温泉・神社など）から、訪れた場所をタップして「制覇」を記録します。' },
  { step: '2', emoji: '📊', title: '制覇率をチェック', desc: 'ダッシュボードでカテゴリ別・都道府県別の制覇率がひと目でわかります。残りがどれだけあるか確認しながら次の旅先を決められます。' },
  { step: '3', emoji: '📔', title: '思い出を日記に残す', desc: '訪れたスポットに写真・コメントを添えて旅日記として保存。後から見返せる自分だけの旅の記録になります。' },
]

const WAYS_TO_ENJOY = [
  { emoji: '🗾', title: '全国制覇をめざす', desc: '47都道府県すべて制覇したら「🏆全国制覇」の称号。道中では「北海道マスター」「東北マスター」のような地方制覇バッジも手に入ります。' },
  { emoji: '🏯', title: 'カテゴリごとにコンプリートする', desc: 'お城（S〜Cランク）・温泉・神社など、カテゴリ内でもランク分けされているものは、ランクごとのコンプリートを目指す楽しみ方もできます。' },
  { emoji: '🏆', title: 'ランキングで競う', desc: '総合ランキングで全国の旅好きと制覇数を競えます。表示名はプライバシー保護のため全員架空のニックネームになるので、気軽に参加できます。' },
  { emoji: '🎖️', title: 'バッジ・称号を集める', desc: '都道府県制覇数やスポット制覇数に応じてバッジが解除されます。コレクション要素として集める楽しみも味わえます。' },
  { emoji: '👨‍👩‍👧', title: 'グループで一緒に制覇', desc: '招待コードで家族・友達とグループを作り、一緒に制覇を楽しめます。旅仲間と進捗を共有しながら旅のモチベーションを高められます。' },
  { emoji: '🤖', title: 'AIおすすめで次の旅先を見つける', desc: 'まだ訪れていないエリア・スポットをAIが提案。「次はどこに行こう」が決まらないときのヒントになります。' },
]

export default function HowtoPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">📖 遊び方</h1>
        <p className="text-slate-400 text-sm mb-8">旅コンプリの基本の使い方と、いろいろな楽しみ方を紹介します。</p>

        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-l-4 border-emerald-500 pl-3">まずはこの3ステップ</h2>
          <div className="flex flex-col gap-3">
            {BASICS.map((b) => (
              <div key={b.step} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {b.step}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1.5">{b.emoji} {b.title}</div>
                  <div className="text-sm text-slate-400 mt-1 leading-relaxed">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-l-4 border-emerald-500 pl-3">こんな楽しみ方ができます</h2>
          <div className="flex flex-col gap-3">
            {WAYS_TO_ENJOY.map((w) => (
              <div key={w.title} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="font-bold flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{w.emoji}</span>
                  <span>{w.title}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <Link href="/spots" className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 hover:border-emerald-500/60 transition">
            <span className="font-medium">🗺️ スポット制覇をはじめる</span>
            <span className="text-emerald-400">›</span>
          </Link>
          <Link href="/dashboard" className="text-center text-slate-500 text-sm hover:text-slate-300 transition">
            ← マップに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
