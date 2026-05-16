import { writeFileSync, mkdirSync } from 'fs'

const PREFS = [
  { code: 1,  name: '北海道',   lat: 43.46, lon: 142.82 },
  { code: 2,  name: '青森県',   lat: 40.60, lon: 140.74 },
  { code: 3,  name: '岩手県',   lat: 39.70, lon: 141.13 },
  { code: 4,  name: '宮城県',   lat: 38.27, lon: 140.87 },
  { code: 5,  name: '秋田県',   lat: 39.72, lon: 140.10 },
  { code: 6,  name: '山形県',   lat: 38.42, lon: 140.36 },
  { code: 7,  name: '福島県',   lat: 37.36, lon: 140.29 },
  { code: 8,  name: '茨城県',   lat: 36.34, lon: 140.45 },
  { code: 9,  name: '栃木県',   lat: 36.56, lon: 139.88 },
  { code: 10, name: '群馬県',   lat: 36.39, lon: 139.06 },
  { code: 11, name: '埼玉県',   lat: 35.99, lon: 139.47 },
  { code: 12, name: '千葉県',   lat: 35.49, lon: 140.23 },
  { code: 13, name: '東京都',   lat: 35.69, lon: 139.69 },
  { code: 14, name: '神奈川県', lat: 35.45, lon: 139.34 },
  { code: 15, name: '新潟県',   lat: 37.36, lon: 138.96 },
  { code: 16, name: '富山県',   lat: 36.70, lon: 137.21 },
  { code: 17, name: '石川県',   lat: 36.59, lon: 136.63 },
  { code: 18, name: '福井県',   lat: 35.90, lon: 136.22 },
  { code: 19, name: '山梨県',   lat: 35.66, lon: 138.57 },
  { code: 20, name: '長野県',   lat: 36.15, lon: 137.98 },
  { code: 21, name: '岐阜県',   lat: 35.79, lon: 137.01 },
  { code: 22, name: '静岡県',   lat: 34.98, lon: 138.38 },
  { code: 23, name: '愛知県',   lat: 35.18, lon: 137.10 },
  { code: 24, name: '三重県',   lat: 34.27, lon: 136.51 },
  { code: 25, name: '滋賀県',   lat: 35.00, lon: 136.22 },
  { code: 26, name: '京都府',   lat: 35.21, lon: 135.76 },
  { code: 27, name: '大阪府',   lat: 34.69, lon: 135.50 },
  { code: 28, name: '兵庫県',   lat: 35.10, lon: 134.87 },
  { code: 29, name: '奈良県',   lat: 34.37, lon: 135.86 },
  { code: 30, name: '和歌山県', lat: 33.94, lon: 135.37 },
  { code: 31, name: '鳥取県',   lat: 35.36, lon: 133.62 },
  { code: 32, name: '島根県',   lat: 35.10, lon: 132.53 },
  { code: 33, name: '岡山県',   lat: 34.90, lon: 133.79 },
  { code: 34, name: '広島県',   lat: 34.70, lon: 132.54 },
  { code: 35, name: '山口県',   lat: 34.19, lon: 131.47 },
  { code: 36, name: '徳島県',   lat: 33.94, lon: 134.34 },
  { code: 37, name: '香川県',   lat: 34.34, lon: 134.04 },
  { code: 38, name: '愛媛県',   lat: 33.84, lon: 132.77 },
  { code: 39, name: '高知県',   lat: 33.56, lon: 133.53 },
  { code: 40, name: '福岡県',   lat: 33.58, lon: 130.77 },
  { code: 41, name: '佐賀県',   lat: 33.25, lon: 130.30 },
  { code: 42, name: '長崎県',   lat: 32.84, lon: 129.61 },
  { code: 43, name: '熊本県',   lat: 32.79, lon: 130.74 },
  { code: 44, name: '大分県',   lat: 33.24, lon: 131.61 },
  { code: 45, name: '宮崎県',   lat: 32.42, lon: 131.42 },
  { code: 46, name: '鹿児島県', lat: 31.56, lon: 130.56 },
  { code: 47, name: '沖縄県',   lat: 26.21, lon: 127.68 },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchPrefStations(pref, retries = 3) {
  const cat = 'Category:' + pref.name + 'の道の駅'
  const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmlimit=500&cmnamespace=0&format=json`
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'tabi-compuri/1.0 (https://github.com/hanaosaka87/tabi-compuri)' },
      })
      if (!res.ok) { await sleep(3000); continue }
      const json = await res.json()
      const members = json.query?.categorymembers ?? []
      return members
        .filter(m => m.title.startsWith('道の駅'))
        .map(m => ({
          id: `michi-${pref.code}-${m.pageid}`,
          name: m.title.replace(/^道の駅\s*/, ''),
          prefecture_code: pref.code,
          lat: null,
          lon: null,
        }))
    } catch {
      await sleep(3000)
    }
  }
  return []
}

async function main() {
  const all = []
  for (const pref of PREFS) {
    process.stdout.write(`  ${pref.name}... `)
    const stations = await fetchPrefStations(pref)
    console.log(`${stations.length}件`)
    all.push(...stations)
    await sleep(800)
  }

  console.log(`\n合計: ${all.length}件`)
  mkdirSync('lib/spots', { recursive: true })
  writeFileSync('lib/spots/michi-no-eki.json', JSON.stringify(all, null, 2), 'utf-8')
  console.log('lib/spots/michi-no-eki.json に保存しました')
}

main().catch(err => { console.error(err); process.exit(1) })
