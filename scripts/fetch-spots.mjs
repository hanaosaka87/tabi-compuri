import { writeFileSync, mkdirSync } from 'fs'

const PREFS = [
  { code: 1,  name: '北海道' }, { code: 2,  name: '青森県' }, { code: 3,  name: '岩手県' },
  { code: 4,  name: '宮城県' }, { code: 5,  name: '秋田県' }, { code: 6,  name: '山形県' },
  { code: 7,  name: '福島県' }, { code: 8,  name: '茨城県' }, { code: 9,  name: '栃木県' },
  { code: 10, name: '群馬県' }, { code: 11, name: '埼玉県' }, { code: 12, name: '千葉県' },
  { code: 13, name: '東京都' }, { code: 14, name: '神奈川県' }, { code: 15, name: '新潟県' },
  { code: 16, name: '富山県' }, { code: 17, name: '石川県' }, { code: 18, name: '福井県' },
  { code: 19, name: '山梨県' }, { code: 20, name: '長野県' }, { code: 21, name: '岐阜県' },
  { code: 22, name: '静岡県' }, { code: 23, name: '愛知県' }, { code: 24, name: '三重県' },
  { code: 25, name: '滋賀県' }, { code: 26, name: '京都府' }, { code: 27, name: '大阪府' },
  { code: 28, name: '兵庫県' }, { code: 29, name: '奈良県' }, { code: 30, name: '和歌山県' },
  { code: 31, name: '鳥取県' }, { code: 32, name: '島根県' }, { code: 33, name: '岡山県' },
  { code: 34, name: '広島県' }, { code: 35, name: '山口県' }, { code: 36, name: '徳島県' },
  { code: 37, name: '香川県' }, { code: 38, name: '愛媛県' }, { code: 39, name: '高知県' },
  { code: 40, name: '福岡県' }, { code: 41, name: '佐賀県' }, { code: 42, name: '長崎県' },
  { code: 43, name: '熊本県' }, { code: 44, name: '大分県' }, { code: 45, name: '宮崎県' },
  { code: 46, name: '鹿児島県' }, { code: 47, name: '沖縄県' },
]

// 取得するカテゴリ設定
const SPOT_TYPES = [
  { id: 'onsen',      label: '温泉',     suffix: 'の温泉',    prefix: '' },
  { id: 'amusement',  label: '遊園地',   suffix: 'の遊園地',  prefix: '' },
  { id: 'theme-park', label: 'テーマパーク', suffix: 'のテーマパーク', prefix: '' },
  { id: 'zoo',        label: '動物園',   suffix: 'の動物園',  prefix: '' },
  { id: 'aquarium',   label: '水族館',   suffix: 'の水族館',  prefix: '' },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchCategory(catName, retries = 3) {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + catName)}&cmlimit=500&cmnamespace=0&format=json`
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0 (github.com/hanaosaka87)' } })
      if (!res.ok) { await sleep(3000); continue }
      const text = await res.text()
      if (text.startsWith('You are making')) { await sleep(5000); continue }
      const json = JSON.parse(text)
      return json.query?.categorymembers ?? []
    } catch { await sleep(3000) }
  }
  return []
}

async function fetchSpotType(type) {
  const all = []
  const seen = new Set()

  for (const pref of PREFS) {
    process.stdout.write(`  [${type.label}] ${pref.name}... `)
    const members = await fetchCategory(pref.name + type.suffix)
    const spots = members
      .filter(m => !seen.has(m.pageid))
      .map(m => {
        seen.add(m.pageid)
        return {
          id: `${type.id}-${pref.code}-${m.pageid}`,
          name: m.title,
          prefecture_code: pref.code,
          lat: null,
          lon: null,
        }
      })
    console.log(`${spots.length}件`)
    all.push(...spots)
    await sleep(1000)
  }
  return all
}

async function main() {
  mkdirSync('lib/spots', { recursive: true })

  for (const type of SPOT_TYPES) {
    console.log(`\n=== ${type.label} ===`)
    const spots = await fetchSpotType(type)
    console.log(`→ 合計 ${spots.length}件`)
    writeFileSync(`lib/spots/${type.id}.json`, JSON.stringify(spots, null, 2), 'utf-8')
    console.log(`  lib/spots/${type.id}.json 保存完了`)
    await sleep(2000)
  }

  console.log('\n全カテゴリ取得完了')
}

main().catch(err => { console.error(err); process.exit(1) })
