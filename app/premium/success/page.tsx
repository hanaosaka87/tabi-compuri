'use client'
import Link from 'next/link'

export default function PremiumSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          プレミアム会員になりました！
        </h1>
        <p className="text-gray-400 mb-8">
          全国制覇をさらに楽しめる特典が使えるようになりました。
        </p>
        <Link
          href="/dashboard"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-full transition"
        >
          ダッシュボードへ
        </Link>
      </div>
    </div>
  )
}
