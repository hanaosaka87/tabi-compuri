/**
 * サンプルユーザー100人をSupabaseに登録するシードスクリプト
 *
 * 使い方:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=your_service_role_key \
 *   node scripts/seed-sample-users.mjs
 *
 * または .env.local から読み込む場合:
 *   node -r dotenv/config scripts/seed-sample-users.mjs dotenv_config_path=.env.local
 *   ※ dotenv パッケージが必要: npm install --save-dev dotenv
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// .env.local を手動でパースして process.env に反映
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

// URL確認（キーは伏せる）
console.log('🔍 接続先URL :', SUPABASE_URL ?? '(未設定)')
console.log('🔍 Service Key:', SERVICE_KEY ? SERVICE_KEY.slice(0, 10) + '...' : '(未設定)')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ 環境変数が不足しています。')
  console.error('   .env.local に以下のキーが必要です:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY（Supabase ダッシュボード → Settings → API → service_role）')
  console.error('\n現在読み込まれたキー:', Object.keys(process.env).filter(k => k.includes('SUPA')).join(', ') || 'なし')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// 都道府県コード 1〜47
const ALL_PREF_CODES = Array.from({ length: 47 }, (_, i) => i + 1)

// スポットカテゴリ
const SPOT_CATEGORIES = [
  'castle', 'shrine', 'onsen', 'michi-no-eki',
  'dam', 'zoo', 'amusement', 'japan-heritage',
]

// カテゴリごとのスポットID最大値（件数に合わせた概算）
const SPOT_MAX = {
  'castle': 1782, 'shrine': 3047, 'onsen': 1774, 'michi-no-eki': 1238,
  'dam': 898, 'zoo': 264, 'amusement': 186, 'japan-heritage': 463,
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ランキングが賑やかになるよう、上位〜下位をバランスよく分布させる
function getPrefCount(rank) {
  if (rank <= 3)  return randomInt(40, 47)   // 上位3人は全国制覇レベル
  if (rank <= 10) return randomInt(25, 39)   // 上位10人は特急シルバー以上
  if (rank <= 30) return randomInt(10, 24)   // 中位は普通列車〜急行
  return randomInt(1, 9)                     // 下位は旅のはじまり
}

function getSpotCount(rank) {
  if (rank <= 5)  return randomInt(300, 600)
  if (rank <= 20) return randomInt(50, 299)
  if (rank <= 50) return randomInt(5, 49)
  return randomInt(0, 4)
}

const SAMPLE_NAME_PREFIXES = [
  '旅する', '全国制覇', '温泉好き', '城巡り', '道の駅',
  '神社仏閣', '滝マニア', 'ダム巡礼', '旅人', '流浪の',
]
const SAMPLE_NAME_SUFFIXES = [
  'たかし', 'はなこ', 'けんじ', 'あきら', 'ゆうこ',
  'まさお', 'さゆり', 'のぶひろ', 'みき', 'りょうた',
  'ともき', 'なつみ', 'こうへい', 'えみ', 'だいすけ',
  'かなえ', 'しんいち', 'よしこ', 'たける', 'みほ',
]

async function main() {
  console.log('🚀 サンプルユーザー100人の作成を開始します...\n')

  const userCount = 100
  const errors = []

  for (let i = 1; i <= userCount; i++) {
    const rank = i
    const email = `sample_user_${String(i).padStart(3, '0')}@tabi-compuri.example.com`
    const namePrefix = SAMPLE_NAME_PREFIXES[(i - 1) % SAMPLE_NAME_PREFIXES.length]
    const nameSuffix = SAMPLE_NAME_SUFFIXES[(i - 1) % SAMPLE_NAME_SUFFIXES.length]
    const username = `${namePrefix}${nameSuffix}`

    // 1. Supabase Authユーザー作成（パスワードは不要・確認済み状態で作成）
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { username },
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        process.stdout.write(`[${i}/100] ${username} — 既存スキップ\n`)
        continue
      }
      errors.push({ i, email, error: authError.message })
      process.stdout.write(`[${i}/100] ❌ ${authError.message}\n`)
      continue
    }

    const uid = authData.user.id
    const prefCount = getPrefCount(rank)
    const spotCount = getSpotCount(rank)
    const selectedPrefs = shuffle(ALL_PREF_CODES).slice(0, prefCount)

    // 2. profiles テーブルに挿入
    await supabase.from('profiles').upsert({ id: uid, username })

    // 3. visits テーブルに都道府県訪問データを挿入
    const today = new Date()
    const visitRows = selectedPrefs.map((code) => {
      const daysAgo = randomInt(0, 180)
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      return {
        user_id: uid,
        prefecture_code: code,
        visited_at: date.toISOString().split('T')[0],
      }
    })
    if (visitRows.length > 0) {
      await supabase.from('visits').insert(visitRows)
    }

    // 4. spot_visits テーブルにスポット訪問データを挿入
    if (spotCount > 0) {
      const spotRows = []
      for (let s = 0; s < spotCount; s++) {
        const category = SPOT_CATEGORIES[Math.floor(Math.random() * SPOT_CATEGORIES.length)]
        const maxId = SPOT_MAX[category]
        const spotId = `seed-${category}-${randomInt(1, maxId)}`
        const prefCode = selectedPrefs[Math.floor(Math.random() * selectedPrefs.length)]
        const daysAgo = randomInt(0, 180)
        const date = new Date(today)
        date.setDate(date.getDate() - daysAgo)
        spotRows.push({
          user_id: uid,
          spot_id: spotId,
          category,
          spot_name: `サンプルスポット${s + 1}`,
          prefecture_code: prefCode,
          visited_at: date.toISOString().split('T')[0],
        })
      }
      // 重複を除去（同一 spot_id の場合は最初の1件のみ）
      const uniqueSpotRows = spotRows.filter(
        (row, idx, arr) => arr.findIndex((r) => r.spot_id === row.spot_id) === idx
      )
      await supabase.from('spot_visits').insert(uniqueSpotRows)
    }

    process.stdout.write(
      `[${String(i).padStart(3, ' ')}/100] ✅ ${username.padEnd(14)} — 都道府県:${String(prefCount).padStart(2)}都道府県 / スポット:${String(spotCount).padStart(3)}件\n`
    )
  }

  console.log('\n==================================================')
  if (errors.length === 0) {
    console.log('✅ 全100人のサンプルユーザーを登録しました！')
  } else {
    console.log(`⚠️  完了（エラー: ${errors.length}件）`)
    for (const e of errors) {
      console.log(`   - [${e.i}] ${e.email}: ${e.error}`)
    }
  }
  console.log('\n▶ ランキングページ: https://tabi-compuri.hana.trickster.biz/ranking')
  console.log('==================================================\n')
}

main().catch((e) => {
  console.error('❌ 予期せぬエラー:', e)
  process.exit(1)
})
