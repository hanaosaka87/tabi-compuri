import Link from 'next/link'
import type { Metadata } from 'next'
import SnsFollowBanner from '@/app/components/SnsFollowBanner'

export const metadata: Metadata = {
  title: '旅コンプリ | 日本全国制覇アプリ - 無料で都道府県・道の駅・温泉・お城を記録',
  description: '47都道府県・全国1,741市区町村・道の駅1,238か所・温泉1,774か所・お城1,782か所を制覇しよう。旅の思い出を写真・日記で記録し、全国ランキングに挑戦できる無料の旅行制覇アプリ。',
  alternates: { canonical: 'https://tabi-compuri.hana.trickster.biz' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '旅コンプリ',
  url: 'https://tabi-compuri.hana.trickster.biz',
  description: '47都道府県・市区町村・道の駅・温泉・お城を制覇できる旅行記録アプリ',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  creator: { '@type': 'Organization', name: '株式会社華' },
}

const FAQS = [
  { q: '無料で使えますか？', a: 'はい、すべての機能が完全無料です。アプリのインストールも不要で、ブラウザからすぐ使えます。' },
  { q: '登録に個人情報は必要ですか？', a: 'メールアドレスのみで登録できます。名前・住所・電話番号などは一切不要です。' },
  { q: 'スマホでも使えますか？', a: 'スマホ・タブレット・PCすべてに対応しています。ホーム画面に追加するとアプリのように使えます。' },
]

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-900 text-white">

        {/* ヘッダー */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗾</span>
            <span className="text-xl font-bold tracking-wide">旅コンプリ</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition hidden sm:block">体験する</Link>
            <Link href="/ranking" className="text-slate-400 hover:text-white transition hidden sm:block">ランキング</Link>
            <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-full text-sm font-medium transition">
              無料で始める
            </Link>
          </nav>
        </header>

        {/* ヒーロー */}
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-medium mb-6">
              🗾 旅行好きのための制覇アプリ
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              旅の記録、<br />
              <span className="text-emerald-400">ゲームにしよう。</span>
            </h1>
            <p className="text-slate-300 text-lg mb-4 leading-relaxed">
              都道府県・道の駅・温泉・お城…<br />
              訪れた場所を「制覇」として記録して、<br />
              日本全国コンプリートを目指そう。
            </p>
            <p className="text-slate-500 text-sm mb-8">
              ✓ 完全無料 &nbsp;✓ 登録30秒 &nbsp;✓ インストール不要
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full text-lg font-bold transition shadow-lg shadow-emerald-500/30 text-center">
                無料ではじめる →
              </Link>
              <Link href="/dashboard" className="border border-white/20 hover:border-white/40 text-slate-300 hover:text-white px-8 py-4 rounded-full text-lg transition text-center">
                まず体験する
              </Link>
            </div>
          </div>

          {/* アプリモック */}
          <div className="flex-shrink-0 w-full max-w-xs mx-auto md:mx-0">
            <div className="bg-slate-800 border border-white/10 rounded-3xl p-4 shadow-2xl">
              <div className="bg-slate-900 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold">🗾 制覇マップ</span>
                  <span className="text-emerald-400 text-xs font-bold">32%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{width:'32%'}} />
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {['北海道','東京','大阪','京都','福岡','沖縄','愛知','神奈川'].map((p,i) => (
                    <div key={p} className={`text-[10px] text-center py-1.5 rounded-lg font-medium ${i<5 ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                      {i<5 ? '✓' : ''}{p.slice(0,2)}
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-3 grid grid-cols-3 gap-2 text-center">
                  {[{n:'15',l:'都道府県'},{n:'89',l:'市区町村'},{n:'42',l:'スポット'}].map(x=>(
                    <div key={x.l}>
                      <div className="text-emerald-400 font-bold text-sm">{x.n}</div>
                      <div className="text-slate-500 text-[9px]">{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-around mt-3 px-2">
                {['🗾','🏘','🚗','📔','🏆'].map(icon=>(
                  <span key={icon} className="text-xl opacity-60">{icon}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 痛点→解決 */}
        <section className="bg-white/5 border-y border-white/10 py-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-slate-400 text-lg mb-2">「旅行の記録、どうしてる？」</p>
            <p className="text-white text-2xl font-bold mb-6">写真フォルダに眠ったまま…になっていませんか？</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {[
                { before: '📱 写真がバラバラ', after: '✅ 都道府県ごとに整理' },
                { before: '🤔 どこ行ったか忘れる', after: '✅ 制覇マップで一目瞭然' },
                { before: '😐 旅行がマンネリ', after: '✅ 制覇数でモチベUP' },
              ].map(item => (
                <div key={item.before} className="bg-white/5 rounded-2xl p-4">
                  <p className="text-slate-400 mb-2">{item.before}</p>
                  <p className="text-emerald-400 font-bold">{item.after}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 機能紹介 */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">旅がもっと楽しくなる機能</h2>
          <div className="flex flex-col gap-8">
            {[
              {
                icon: '🗺️', title: '都道府県・市区町村を制覇',
                desc: '47都道府県と全国1,741市区町村を記録。地方ごとに色分けされたマップで制覇状況が一目でわかります。',
                tags: ['47都道府県', '1,741市区町村', 'ランク制度'],
              },
              {
                icon: '📍', title: '全国5,000以上のスポットを制覇',
                desc: '道の駅・温泉・お城・遊園地・動物園など、カテゴリ別に全国のスポットを制覇。旅先で「ここも制覇できる！」が増えます。',
                tags: ['道の駅1,238件', 'お城1,782件', '温泉1,774件'],
              },
              {
                icon: '🏆', title: 'ランキング・バッジでモチベUP',
                desc: '全国のユーザーと制覇数を競えるランキング。条件を満たすと獲得できるバッジで、旅のモチベーションが続きます。',
                tags: ['全国ランキング', 'バッジ14種', 'SNSシェア'],
              },
            ].map(f => (
              <div key={f.title} className="flex flex-col sm:flex-row items-start gap-5 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition">
                <span className="text-5xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{f.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.tags.map(tag => (
                      <span key={tag} className="bg-emerald-500/15 text-emerald-400 text-xs px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* スポット統計 */}
        <section className="bg-white/5 border-y border-white/10 py-12 px-6 text-center">
          <p className="text-slate-400 text-sm mb-2">制覇できるスポット総数</p>
          <p className="text-4xl font-bold text-emerald-400 mb-6">5,244<span className="text-slate-400 text-xl font-normal">か所以上</span></p>
          <div className="inline-grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-8">
            {[
              { num: '47', label: '都道府県', icon: '🗾' },
              { num: '1,741', label: '市区町村', icon: '🏘' },
              { num: '1,782', label: 'お城', icon: '🏯' },
              { num: '1,774', label: '温泉', icon: '♨️' },
              { num: '1,238', label: '道の駅', icon: '🚗' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xl sm:text-2xl font-bold text-white">{item.num}</div>
                <div className="text-slate-400 text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 中間CTA */}
        <section className="text-center py-16 px-6">
          <h2 className="text-2xl font-bold mb-3">さあ、制覇の旅を始めよう</h2>
          <p className="text-slate-400 mb-6">メールアドレスだけで今すぐ無料登録。インストール不要。</p>
          <Link href="/login" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-full text-lg font-bold transition shadow-lg shadow-emerald-500/30">
            無料ではじめる →
          </Link>
          <p className="text-slate-500 text-xs mt-4">登録は30秒 · 完全無料 · いつでも退会できます</p>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-bold text-center mb-6">よくある質問</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="font-bold text-sm mb-2">Q. {faq.q}</p>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SNSフォローバナー */}
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <SnsFollowBanner />
        </div>

        {/* フッター */}
        <footer className="text-center text-slate-500 text-sm py-8 border-t border-white/10">
          © 2026 旅コンプリ by 株式会社華
        </footer>
      </main>
    </>
  )
}
