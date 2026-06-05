import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PREF_MAP = {
  '北海道': 1, '青森県': 2, '岩手県': 3, '宮城県': 4, '秋田県': 5,
  '山形県': 6, '福島県': 7, '茨城県': 8, '栃木県': 9, '群馬県': 10,
  '埼玉県': 11, '千葉県': 12, '東京都': 13, '神奈川県': 14, '新潟県': 15,
  '富山県': 16, '石川県': 17, '福井県': 18, '山梨県': 19, '長野県': 20,
  '岐阜県': 21, '静岡県': 22, '愛知県': 23, '三重県': 24, '滋賀県': 25,
  '京都府': 26, '大阪府': 27, '兵庫県': 28, '奈良県': 29, '和歌山県': 30,
  '鳥取県': 31, '島根県': 32, '岡山県': 33, '広島県': 34, '山口県': 35,
  '徳島県': 36, '香川県': 37, '愛媛県': 38, '高知県': 39, '福岡県': 40,
  '佐賀県': 41, '長崎県': 42, '熊本県': 43, '大分県': 44, '宮崎県': 45,
  '鹿児島県': 46, '沖縄県': 47,
}

// スーパー銭湯チェーン名のキーワード（含む施設を優先的に取得）
const SUPER_SENTO_KEYWORDS = [
  '極楽湯', '湯快リゾート', '竜泉寺', 'おふろの王様', '万葉の湯',
  '湯楽の里', 'スパ銭', 'スーパー銭湯', 'スパリゾート', '天然温泉',
  'なごみの湯', '喜楽里', 'みどりの湯', '北欧', 'タイムズスパ',
  '湯処', 'センスパ', '庭の湯', '四季の湯', '健美の湯',
  'SPA', 'ゆの里', '湯の里', 'ふれあいの湯', 'テルメ',
  '天空の湯', '富士', '宮の湯', 'アミューズメントスパ', 'クアハウス',
  '湯快', 'スパワールド', '神戸クアハウス', '大江戸温泉', 'RAKU SPA',
  'ラクスパ', 'らくスパ', '湯ったりん', 'ドーミーイン', 'みさと',
  '小江戸', '名取', '稲毛', 'ゆらら', 'よみうりランド',
]

async function fetchOverpassData() {
  const query = `
[out:json][timeout:120];
area["ISO3166-1"="JP"]->.japan;
(
  node["leisure"="spa"](area.japan);
  node["amenity"="spa"](area.japan);
  node["amenity"="public_bath"]["name"~"スーパー銭湯|湯快|極楽湯|竜泉寺|おふろの王様|万葉|湯楽|スパリゾート|天然温泉|なごみの湯|喜楽里|みどりの湯|北欧|タイムズスパ|SPA|センスパ|庭の湯|四季の湯|健美の湯|ゆの里|湯の里|テルメ|天空|クアハウス|湯快|スパワールド|大江戸温泉|RAKU SPA|ラクスパ"](area.japan);
  way["leisure"="spa"](area.japan);
  way["amenity"="spa"](area.japan);
);
out center tags;
`
  console.log('Overpass APIにリクエスト中...')
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`)
  return res.json()
}

function getPrefCode(tags) {
  const pref = tags['addr:prefecture'] || tags['addr:province'] || ''
  if (pref && PREF_MAP[pref]) return PREF_MAP[pref]

  // 住所の都道府県部分を抽出
  const addr = tags['addr:full'] || tags['addr:housenumber'] || ''
  for (const [name, code] of Object.entries(PREF_MAP)) {
    if (addr.includes(name)) return code
  }
  return null
}

async function main() {
  const data = await fetchOverpassData()
  const elements = data.elements || []
  console.log(`取得件数: ${elements.length}`)

  const spots = []
  const seen = new Set()

  for (const el of elements) {
    const tags = el.tags || {}
    const name = tags.name || tags['name:ja']
    if (!name) continue

    // 重複除去（名称ベース）
    const key = name.trim()
    if (seen.has(key)) continue
    seen.add(key)

    const prefCode = getPrefCode(tags)
    if (!prefCode) continue

    const id = `super-sento-${el.id}`
    spots.push({ id, name: name.trim(), prefecture_code: prefCode })
  }

  // 都道府県コード順にソート
  spots.sort((a, b) => a.prefecture_code - b.prefecture_code || a.name.localeCompare(b.name, 'ja'))

  const outPath = path.join(__dirname, '../lib/spots/super-sento.json')
  fs.writeFileSync(outPath, JSON.stringify(spots, null, 2), 'utf-8')
  console.log(`✅ ${spots.length}件を保存: ${outPath}`)

  // 都道府県別カウント
  const countByPref = {}
  for (const s of spots) {
    countByPref[s.prefecture_code] = (countByPref[s.prefecture_code] || 0) + 1
  }
  console.log('都道府県別:')
  for (const [code, count] of Object.entries(countByPref).sort((a, b) => +a[0] - +b[0])) {
    const name = Object.keys(PREF_MAP).find(k => PREF_MAP[k] === +code)
    console.log(`  ${name}: ${count}件`)
  }
}

main().catch(console.error)
