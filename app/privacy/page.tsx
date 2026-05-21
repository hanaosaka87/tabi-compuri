import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | 旅コンプリ',
  robots: { index: false, follow: false },
}

const UPDATED = '2026年5月21日'
const COMPANY = '株式会社華'
const CONTACT = 'hanaosaka87@gmail.com'
const SITE_URL = 'https://tabi-compuri.hana.trickster.biz'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition">← トップへ</Link>
        <span className="text-slate-600">|</span>
        <span className="text-sm text-slate-300">プライバシーポリシー</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 text-slate-300 text-sm leading-relaxed">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">プライバシーポリシー</h1>
          <p className="text-slate-500 text-xs">最終更新：{UPDATED}</p>
        </div>

        <p>
          {COMPANY}（以下「当社」）は、旅コンプリ（{SITE_URL}、以下「本サービス」）における
          利用者情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
        </p>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">1. 収集する情報</h2>
          <p>本サービスは以下の情報を収集することがあります。</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>メールアドレス（アカウント登録時）</li>
            <li>ニックネーム・プロフィール情報（任意入力）</li>
            <li>訪問スポット・都道府県の記録データ</li>
            <li>投稿した写真・日記のテキスト</li>
            <li>アクセスログ（IPアドレス・ブラウザ種別・参照元URL）</li>
            <li>Cookie・ローカルストレージによる利用状況データ</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">2. 利用目的</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>本サービスの提供・運営・改善</li>
            <li>ユーザーサポートへの対応</li>
            <li>ランキング・バッジ等の機能提供</li>
            <li>サービスに関するお知らせの配信</li>
            <li>不正利用の検知・防止</li>
            <li>利用状況の分析（匿名・集計データとして使用）</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">3. Cookieおよびトラッキング技術の使用</h2>
          <p>
            本サービスは、サービス品質の向上および広告配信の最適化のためにCookieを使用します。
          </p>

          <h3 className="text-slate-200 font-medium mt-4">3-1. アクセス解析（Google Analytics）</h3>
          <p>
            本サービスはGoogle LLC提供のGoogle Analytics（GA4）を利用しています。
            Google Analyticsはデータ収集のためにCookieを使用します。
            収集されたデータは匿名で処理され、個人を特定するものではありません。
            詳細は
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline ml-1">
              Googleプライバシーポリシー
            </a>
            をご確認ください。
          </p>

          <h3 className="text-slate-200 font-medium mt-4">3-2. アフィリエイト広告</h3>
          <p>
            本サービスは、A8.net・バリューコマース等のアフィリエイトサービスプロバイダー（ASP）
            を通じた広告プログラムに参加しています。アフィリエイトリンク（じゃらんnet・楽天トラベル等）
            をクリックした場合、当該サービス事業者がCookieを使用して成果を計測します。
            これにより当社に報酬が発生することがあります。
            お客様の個人情報が当社から第三者に提供されるものではありません。
          </p>

          <h3 className="text-slate-200 font-medium mt-4">3-3. Cookieの無効化</h3>
          <p>
            ブラウザの設定によりCookieを無効にすることが可能です。
            ただし、一部の機能が正常に動作しなくなる場合があります。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">4. 第三者サービスの利用</h2>
          <p>本サービスは以下の第三者サービスを利用しており、各サービスのプライバシーポリシーが適用されます。</p>
          <div className="space-y-2 text-slate-400">
            <div className="flex gap-2">
              <span className="flex-shrink-0">・</span>
              <span><span className="text-slate-300">Supabase</span>（データベース・認証）：
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline ml-1">
                  プライバシーポリシー
                </a>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="flex-shrink-0">・</span>
              <span><span className="text-slate-300">Vercel</span>（ホスティング）：
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline ml-1">
                  プライバシーポリシー
                </a>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="flex-shrink-0">・</span>
              <span><span className="text-slate-300">Google Analytics</span>（アクセス解析）：
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline ml-1">
                  プライバシーポリシー
                </a>
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">5. 情報の第三者提供</h2>
          <p>
            当社は、以下の場合を除き、収集した個人情報を第三者に提供しません。
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>ユーザー本人の同意がある場合</li>
            <li>法令に基づく開示が必要な場合</li>
            <li>人の生命・身体・財産の保護に必要な場合</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">6. データの保管・削除</h2>
          <p>
            収集した情報はSupabase（米国）のサーバーに保管されます。
            アカウント削除を希望する場合は、下記お問い合わせ先までご連絡ください。
            お申し出から30日以内に対応いたします。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">7. 未成年者の利用</h2>
          <p>
            13歳未満のお子様は、保護者の同意を得た上でご利用ください。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">8. プライバシーポリシーの変更</h2>
          <p>
            本ポリシーは予告なく変更する場合があります。
            変更後はこのページに掲載し、最終更新日を更新します。
            重要な変更がある場合はサービス内でお知らせします。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-white font-bold text-base">9. お問い合わせ</h2>
          <div className="bg-slate-800 border border-white/10 rounded-xl px-5 py-4">
            <p className="text-slate-400">個人情報に関するお問い合わせ</p>
            <p className="text-white font-medium mt-1">{COMPANY}</p>
            <a href={`mailto:${CONTACT}`} className="text-emerald-400 hover:underline text-sm">
              {CONTACT}
            </a>
          </div>
        </section>

        <div className="pt-4 border-t border-white/10 text-center">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition">
            ← トップページへ戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
