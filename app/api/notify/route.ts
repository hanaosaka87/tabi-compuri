import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { type, appName, rating, comment, category, body } = await req.json()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_ADDRESS,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const appLabel: Record<string, string> = {
    tabi: '旅コンプリ',
    iitokodori: 'いいとこどり',
    attara: 'あったらいいね！',
  }

  let subject = ''
  let text = ''

  if (type === 'review') {
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
    subject = `【レビュー】${appLabel[appName] ?? appName} ${stars}`
    text = `アプリ: ${appLabel[appName] ?? appName}\n評価: ${stars} (${rating}/5)\nコメント: ${comment || 'なし'}\n受信日時: ${new Date().toLocaleString('ja-JP')}`
  } else {
    const catLabel: Record<string, string> = { bug: 'バグ報告', request: '改善要望', other: 'その他' }
    subject = `【フィードバック・${catLabel[category] ?? category}】${appLabel[appName] ?? appName}`
    text = `アプリ: ${appLabel[appName] ?? appName}\nカテゴリ: ${catLabel[category] ?? category}\n内容:\n${body}\n受信日時: ${new Date().toLocaleString('ja-JP')}`
  }

  await transporter.sendMail({
    from: `"株式会社華" <${process.env.GMAIL_ADDRESS}>`,
    to: 'hana@trickster.biz',
    subject,
    text,
  })

  return NextResponse.json({ ok: true })
}
