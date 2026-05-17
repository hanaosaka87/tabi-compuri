'use client'

import { useEffect, useState } from 'react'

type Props = {
  title: string
  message: string
  emoji: string
  onClose: () => void
}

export default function CompleteModal({ title, message, emoji, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      {/* 花火パーティクル */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${0.8 + Math.random() * 0.8}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          >
            {['🎉', '✨', '🌟', '🎊', '⭐', '💫'][Math.floor(Math.random() * 6)]}
          </span>
        ))}
      </div>

      <div
        className={`bg-slate-800 border border-white/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-7xl mb-4 animate-bounce">{emoji}</div>
        <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <button
          onClick={handleClose}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-2xl transition text-base"
        >
          やったー！🎊
        </button>
      </div>
    </div>
  )
}
