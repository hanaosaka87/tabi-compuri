'use client'

import { useState } from 'react'

type Props = {
  text: string
  url?: string
  onClose: () => void
}

const APP_URL = 'https://tabi-compuri.hana.trickster.biz'

export default function ShareModal({ text, url = APP_URL, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const encoded = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)

  const platforms = [
    {
      id: 'x',
      label: 'X',
      bg: 'bg-black hover:bg-zinc-800',
      href: `https://twitter.com/intent/tweet?text=${encoded}`,
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
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
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
      href: `https://line.me/R/msg/text/?${encodeURIComponent(text + '\n' + url)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
    },
  ]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text + '\n' + url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        <div className="grid grid-cols-3 gap-3 mb-4">
          {platforms.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-white transition ${p.bg}`}
            >
              {p.icon}
              <span className="text-xs font-medium">{p.label}</span>
            </a>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm transition"
        >
          {copied ? (
            <><span>✓</span> コピーしました</>
          ) : (
            <><span>🔗</span> リンク＋テキストをコピー</>
          )}
        </button>
      </div>
    </div>
  )
}
