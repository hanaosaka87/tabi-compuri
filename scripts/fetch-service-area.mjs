// サービスエリア・パーキングエリア データ取得スクリプト（2026-10-19、テスターフィードバック対応）
// 道の駅と異なり都道府県別カテゴリが存在しないため、地方別カテゴリで一覧を取得した後、
// 各ページの本文（冒頭セクション）から都道府県名を正規表現で抽出して判定する。
import { writeFileSync } from 'fs'

const REGIONS = ['北海道地方', '東北地方', '関東地方', '中部地方', '近畿地方', '中国地方', '四国地方', '九州地方']

const PREF_MAP = {
  '北海道': 1, '青森県': 2, '岩手県': 3, '宮城県': 4, '秋田県': 5, '山形県': 6, '福島県': 7,
  '茨城県': 8, '栃木県': 9, '群馬県': 10, '埼玉県': 11, '千葉県': 12, '東京都': 13, '神奈川県': 14,
  '新潟県': 15, '富山県': 16, '石川県': 17, '福井県': 18, '山梨県': 19, '長野県': 20, '岐阜県': 21,
  '静岡県': 22, '愛知県': 23, '三重県': 24, '滋賀県': 25, '京都府': 26, '大阪府': 27, '兵庫県': 28,
  '奈良県': 29, '和歌山県': 30, '鳥取県': 31, '島根県': 32, '岡山県': 33, '広島県': 34, '山口県': 35,
  '徳島県': 36, '香川県': 37, '愛媛県': 38, '高知県': 39, '福岡県': 40, '佐賀県': 41, '長崎県': 42,
  '熊本県': 43, '大分県': 44, '宮崎県': 45, '鹿児島県': 46, '沖縄県': 47,
}
const PREF_NAMES = Object.keys(PREF_MAP)

const UA = 'tabi-compuri/1.0 (contact hanaosaka87@gmail.com)'
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchJson(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      const text = await res.text()
      if (text.startsWith('You are making')) { await sleep(8000); continue }
      return JSON.parse(text)
    } catch {
      await sleep(3000)
    }
  }
  return null
}

async function getAllPages(categoryName) {
  const pages = []
  let cont = null
  do {
    let url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + categoryName)}&cmlimit=500&cmtype=page&format=json`
    if (cont) url += `&cmcontinue=${encodeURIComponent(cont)}`
    const data = await fetchJson(url)
    if (data?.query?.categorymembers) pages.push(...data.query.categorymembers)
    cont = data?.continue ? data.continue.cmcontinue : null
    await sleep(600)
  } while (cont)
  return pages
}

async function getPrefCode(pageId) {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&prop=revisions&pageids=${pageId}&rvslots=main&rvprop=content&rvsection=0&format=json`
  const data = await fetchJson(url)
  const content = data?.query?.pages?.[String(pageId)]?.revisions?.[0]?.slots?.main?.['*']
  if (!content) return 0
  for (const name of PREF_NAMES) {
    if (content.includes(name)) return PREF_MAP[name]
  }
  return 0
}

async function main() {
  const seen = new Map() // pageid -> title
  for (const region of REGIONS) {
    const cat = `${region}のサービスエリア・パーキングエリア`
    process.stdout.write(`取得中: ${cat}... `)
    const pages = await getAllPages(cat)
    let added = 0
    for (const p of pages) {
      if (!seen.has(p.pageid)) { seen.set(p.pageid, p.title); added++ }
    }
    console.log(`${pages.length}件（新規${added}件）`)
    await sleep(800)
  }

  console.log(`\n合計（重複除去後）: ${seen.size}件`)
  console.log('都道府県判定を開始...')

  const results = []
  let found = 0
  let i = 0
  for (const [pageid, title] of seen) {
    i++
    const code = await getPrefCode(pageid)
    if (code > 0) found++
    results.push({ id: `sa-${code}-${pageid}`, name: title, prefecture_code: code })
    if (i % 20 === 0) process.stdout.write(`\r${i}/${seen.size}（都道府県判定: ${found}件）`)
    await sleep(350)
  }
  console.log(`\n都道府県判定完了: ${found}/${results.length}件`)

  results.sort((a, b) => a.prefecture_code - b.prefecture_code)
  writeFileSync('lib/spots/service-area.json', JSON.stringify(results, null, 2), 'utf-8')
  console.log(`\n完了: ${results.length}件 → lib/spots/service-area.json`)
}

main().catch(err => { console.error(err); process.exit(1) })
