import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-900 text-white">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗾</span>
          <span className="text-xl font-bold tracking-wide">旅コンプリ</span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition hidden sm:block">マップを体験</Link>
          <Link href="/ranking" className="text-slate-400 hover:text-white transition hidden sm:block">ランキング</Link>
          <Link href="/badges" className="text-slate-400 hover:text-white transition hidden sm:block">バッジ</Link>
          <Link
            href="/login"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-full text-sm font-medium transition"
          >
            ログイン
          </Link>
        </nav>
      </header>

      {/* ヒーローセクション */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 gap-6">
        <div className="text-6xl mb-2">🗾</div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          日本全国<br />
          <span className="text-emerald-400">制覇</span>の旅へ
        </h1>
        <p className="text-slate-300 text-lg max-w-md">
          47都道府県を訪れ、旅の思い出を記録しよう。<br />
          写真・日記・ランキングで旅をもっと楽しく。
        </p>
        <Link
          href="/login"
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full text-lg font-bold transition shadow-lg shadow-emerald-500/30 mt-2"
        >
          無料ではじめる →
        </Link>
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-white text-sm underline underline-offset-4 transition"
        >
          まずはゲストで体験する
        </Link>
      </section>

      {/* 機能紹介 */}
      <section className="px-6 py-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🗺️', title: '制覇マップ', desc: '訪れた都道府県を地図に記録。全国制覇を目指そう。' },
          { icon: '📷', title: '思い出記録', desc: '写真・日記で旅の思い出をいつまでも残せる。' },
          { icon: '🏆', title: 'ランキング', desc: '訪問数で全国ランキングに挑戦。トップを目指せ！' },
        ].map((item) => (
          <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="text-lg font-bold mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* 統計 */}
      <section className="text-center py-12 px-6">
        <div className="inline-flex items-center gap-8 bg-white/5 border border-white/10 rounded-2xl px-10 py-6">
          {[
            { num: '47', label: '都道府県' },
            { num: '1741', label: '市区町村' },
            { num: '∞', label: '思い出' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{item.num}</div>
              <div className="text-slate-400 text-sm mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="text-center text-slate-500 text-sm py-8 border-t border-white/10">
        © 2026 旅コンプリ by 株式会社華
      </footer>
    </main>
  )
}
