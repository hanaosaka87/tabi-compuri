'use client'

import { useState } from 'react'

type Props = {
  text: string
  url?: string
  onClose: () => void
}

const APP_URL = 'https://tabi-compuri.hana.trickster.biz'

export default function ShareModal({ text, url = APP_URL, onClose }: Props) {
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const copyAndOpen = async (href: string, platformName: string) => {
    try {
      await navigator.clipboard.writeText(text + '\n' + url)
      showToast(`テキストをコピーしました。${platformName}に貼り付けて投稿しよう！`)
    } catch {
      showToast(`${platformName}アプリを開きます`)
    }
    window.open(href, '_blank')
  }

  const encoded = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)

  const directPlatforms = [
    {
      id: 'x',
      label: 'X',
      bg: 'bg-black hover:bg-zinc-800',
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: 'line',
      label: 'LINE',
      bg: 'bg-[#06C755] hover:bg-[#05b34c]',
      onClick: () => window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text + '\n' + url)}`, '_blank'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
    },
  ]

  const copyPlatforms = [
    {
      id: 'instagram',
      label: 'Instagram',
      bg: 'bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90',
      onClick: () => copyAndOpen('https://www.instagram.com', 'Instagram'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      ),
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      bg: 'bg-black hover:bg-zinc-900 border border-white/10',
      onClick: () => copyAndOpen('https://www.tiktok.com', 'TikTok'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      label: 'YouTube',
      bg: 'bg-[#FF0000] hover:bg-[#e60000]',
      onClick: () => copyAndOpen('https://www.youtube.com', 'YouTube'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text + '\n' + url)
    showToast('コピーしました！')
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 px-0 sm:px-6"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">シェアする</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition text-xl leading-none">✕</button>
        </div>

        <p className="text-slate-400 text-xs mb-5 bg-slate-700/50 rounded-xl px-3 py-2 leading-relaxed">
          {text}
        </p>

        {/* X / Facebook / LINE — 直接シェア */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {directPlatforms.map((p) => (
            <button
              key={p.id}
              onClick={p.onClick}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-white transition ${p.bg}`}
            >
              {p.icon}
              <span className="text-xs font-medium">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Instagram / TikTok / YouTube — コピー後アプリ起動 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {copyPlatforms.map((p) => (
            <button
              key={p.id}
              onClick={p.onClick}
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-white transition ${p.bg}`}
            >
              {p.icon}
              <span className="text-xs font-medium">{p.label}</span>
            </button>
          ))}
        </div>

        {toast && (
          <div className="bg-emerald-600/90 text-white text-xs text-center rounded-xl px-3 py-2 mb-3 transition-all">
            {toast}
          </div>
        )}

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm transition"
        >
          🔗 リンク＋テキストをコピー
        </button>

        <p className="text-slate-600 text-xs text-center mt-3">
          Instagram・TikTok・YouTubeはテキストを自動コピーしてアプリを開きます
        </p>
      </div>
    </div>
  )
}
