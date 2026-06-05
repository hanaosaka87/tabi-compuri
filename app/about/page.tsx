import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '旅コンプリについて | 日本全国制覇アプリ',
  description: '旅コンプリは47都道府県・市区町村・道の駅・温泉・お城など全国スポットを制覇記録できる旅行アプリです。旅の思い出を地図に記録して全国ランキングに挑戦しましょう。',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="bg-emerald-600 shadow-sm px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-white text-sm hover:underline">← トップに戻る</Link>
        <span className="text-xl font-bold text-white">🗾 旅コンプリ</span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        <section className="text-center">
          <div className="text-6xl mb-4">🗾</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">旅コンプリ</h1>
          <p className="text-gray-600 leading-relaxed">
            日本全国の旅スポットを制覇記録できる、旅行好きのための無料アプリです。<br />
            47都道府県・道の駅・温泉・お城・神社など、あなたの旅の軌跡を地図に刻みましょう。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3">アプリの特徴</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                icon: '🗺️',
                title: '全国スポットを制覇記録',
                desc: '47都道府県・市区町村・道の駅・温泉・お城・神社など、カテゴリ別にスポット制覇を記録できます。',
              },
              {
                icon: '📊',
                title: '制覇率をグラフで確認',
                desc: '都道府県別・カテゴリ別の制覇率をグラフで可視化。どこを制覇済みでどこが残っているかひと目でわかります。',
              },
              {
                icon: '🏆',
                title: '全国ランキングに挑戦',
                desc: 'ユーザー間でスポット制覇数を競うランキング機能。全国の旅好きと競い合いながらモチベーションを高められます。',
              },
              {
                icon: '📖',
                title: '旅の日記・思い出を記録',
                desc: '訪れたスポットに写真・コメントを添えて旅の日記として保存。後で見返せる大切な旅の思い出帳になります。',
              },
              {
                icon: '👥',
                title: 'グループで一緒に制覇',
                desc: 'グループ機能で家族・友達と一緒に制覇を楽しめます。旅仲間と協力して全国制覇を目指しましょう。',
              },
              {
                icon: '🎖️',
                title: 'バッジ・実績システム',
                desc: '一定数制覇するとバッジが解除されます。コレクション要素として収集する楽しみも味わえます。',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3">制覇できるスポットカテゴリ</h2>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              {[
                '🗾 47都道府県',
                '🏙️ 市区町村',
                '🛣️ 道の駅',
                '♨️ 温泉地',
                '🏯 お城',
                '⛩️ 神社・仏閣',
                '🌊 海水浴場',
                '🏔️ 山・峠',
                '🌸 名所・観光地',
                '🍜 ご当地グルメスポット',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 py-1">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3">使い方</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'アカウントを作成', desc: 'メールアドレスまたはSNSアカウントで無料登録。すぐに使い始められます。' },
              { step: '2', title: 'スポットを選んで制覇を記録', desc: 'カテゴリから訪問したスポットを選択して「制覇！」ボタンを押すだけ。' },
              { step: '3', title: '旅の日記を書く', desc: '制覇したスポットに写真・コメントを添えて思い出を記録しましょう。' },
              { step: '4', title: 'ランキングに挑戦', desc: '制覇数が増えるほどランキングが上昇。全国制覇を目指して旅を続けましょう。' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{item.title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-emerald-500 pl-3">よくある質問</h2>
          <div className="space-y-3">
            {[
              { q: '利用料金はかかりますか？', a: '基本機能は完全無料でご利用いただけます。' },
              { q: '記録したデータは消えませんか？', a: 'クラウドに保存されるため、機種変更後もデータが引き継げます。' },
              { q: 'オフラインでも使えますか？', a: '制覇記録の閲覧は一部オフラインで確認できますが、記録の追加にはインターネット接続が必要です。' },
              { q: 'スポットを追加してほしい場合は？', a: 'フィードバック機能からご要望をお寄せください。' },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="font-bold text-gray-800 mb-1.5">Q. {item.q}</div>
                <div className="text-sm text-gray-600 leading-relaxed">A. {item.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-3">開発者について</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            「旅コンプリ」は株式会社華が開発・運営しています。<br />
            旅行好きのための便利なアプリを目指して継続的に機能を追加しています。
          </p>
          <a href="https://hana.trickster.biz" target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm hover:underline">
            株式会社華 公式サイト →
          </a>
        </section>

        <div className="flex flex-col gap-2 text-center text-sm pb-8">
          <Link href="/" className="text-emerald-600 hover:underline">← トップに戻る</Link>
          <Link href="/privacy" className="text-gray-500 hover:underline">プライバシーポリシー</Link>
          <a href="https://hana.trickster.biz/tokushoho.html" className="text-gray-500 hover:underline">特定商取引法に基づく表記</a>
        </div>
      </main>
    </div>
  )
}
