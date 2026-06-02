'use client'
import { useState } from 'react'

// NEXT_PUBLIC_PREMIUM_ENABLED=true になるまで非表示
const PREMIUM_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_ENABLED === 'true'

interface Props {
  isPremium: boolean
}

export default function PremiumUpgradeButton({ isPremium }: Props) {
  const [loading, setLoading] = useState(false)

  if (!PREMIUM_ENABLED) return null

  const handleUpgrade = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  const handlePortal = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  if (isPremium) {
    return (
      <div className="flex items-center gap-3">
        <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          ⭐ プレミアム会員
        </span>
        <button
          onClick={handlePortal}
          disabled={loading}
          className="text-xs text-gray-400 underline"
        >
          {loading ? '処理中…' : 'プラン管理'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold px-5 py-2 rounded-full text-sm transition"
    >
      {loading ? '処理中…' : '⭐ プレミアムにアップグレード · 月額480円'}
    </button>
  )
}
