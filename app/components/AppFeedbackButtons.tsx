'use client'

import { useState } from 'react'
import ReviewModal from './ReviewModal'
import FeedbackModal from './FeedbackModal'

export default function AppFeedbackButtons({ appName }: { appName: string }) {
  const [showReview, setShowReview] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <>
      <div className="flex items-center justify-center gap-3 text-sm">
        <button
          onClick={() => setShowReview(true)}
          className="text-slate-400 hover:text-white transition"
        >
          ⭐ レビュー
        </button>
        <span className="text-slate-600">|</span>
        <button
          onClick={() => setShowFeedback(true)}
          className="text-slate-400 hover:text-white transition"
        >
          💬 フィードバック
        </button>
      </div>
      {showReview && <ReviewModal appName={appName} onClose={() => setShowReview(false)} />}
      {showFeedback && <FeedbackModal appName={appName} onClose={() => setShowFeedback(false)} />}
    </>
  )
}
