import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PREFECTURE_NAMES: Record<number, string> = {
  1:'北海道',2:'青森県',3:'岩手県',4:'宮城県',5:'秋田県',6:'山形県',7:'福島県',
  8:'茨城県',9:'栃木県',10:'群馬県',11:'埼玉県',12:'千葉県',13:'東京都',14:'神奈川県',
  15:'新潟県',16:'富山県',17:'石川県',18:'福井県',19:'山梨県',20:'長野県',21:'岐阜県',
  22:'静岡県',23:'愛知県',24:'三重県',25:'滋賀県',26:'京都府',27:'大阪府',28:'兵庫県',
  29:'奈良県',30:'和歌山県',31:'鳥取県',32:'島根県',33:'岡山県',34:'広島県',35:'山口県',
  36:'徳島県',37:'香川県',38:'愛媛県',39:'高知県',40:'福岡県',41:'佐賀県',42:'長崎県',
  43:'熊本県',44:'大分県',45:'宮崎県',46:'鹿児島県',47:'沖縄県',
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const { visitedCodes, spotCount, cityCount } = await req.json() as {
    visitedCodes: number[]
    spotCount: number
    cityCount: number
  }

  const visited = visitedCodes.map((c) => PREFECTURE_NAMES[c]).filter(Boolean)
  const notVisited = Object.entries(PREFECTURE_NAMES)
    .filter(([code]) => !visitedCodes.includes(Number(code)))
    .map(([, name]) => name)

  const prompt = `あなたは旅行アドバイザーです。ユーザーの旅行制覇状況を見て、次に訪れるべき都道府県を3つ推薦してください。

【制覇済み都道府県（${visited.length}/47）】
${visited.length > 0 ? visited.join('、') : 'まだありません'}

【未訪問都道府県】
${notVisited.join('、')}

【その他の制覇状況】
- 市区町村: ${cityCount}件
- スポット（道の駅・温泉・お城など）: ${spotCount}件

以下のJSON形式のみで回答してください。説明文は不要です：
{
  "recommendations": [
    { "prefecture": "都道府県名", "reason": "おすすめ理由（30文字以内）", "emoji": "絵文字1つ" },
    { "prefecture": "都道府県名", "reason": "おすすめ理由（30文字以内）", "emoji": "絵文字1つ" },
    { "prefecture": "都道府県名", "reason": "おすすめ理由（30文字以内）", "emoji": "絵文字1つ" }
  ]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? '{}')
    return NextResponse.json(json)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
