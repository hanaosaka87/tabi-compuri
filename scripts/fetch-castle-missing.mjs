import { readFileSync, writeFileSync } from 'fs'

const MISSING_PREFS = [
  { code: 11, name: '埼玉県' },
  { code: 12, name: '千葉県' },
  { code: 23, name: '愛知県' },
  { code: 24, name: '三重県' },
  { code: 25, name: '滋賀県' },
  { code: 26, name: '京都府' },
  { code: 37, name: '香川県' },
  { code: 38, name: '愛媛県' },
  { code: 39, name: '高知県' },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchCategory(catName) {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:' + catName)}&cmlimit=500&cmnamespace=0&format=json`
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0 (github.com/hanaosaka87)' } })
      if (!res.ok) { await sleep(3000); continue }
      const text = await res.text()
      if (text.startsWith('You are making')) { await sleep(5000); continue }
      return JSON.parse(text).query?.categorymembers ?? []
    } catch { await sleep(3000) }
  }
  return []
}

async function main() {
  const existing = JSON.parse(readFileSync('lib/spots/castle.json', 'utf-8'))
  const seen = new Set(existing.map(e => e.id))
  const seenPageIds = new Set(existing.map(e => e.id.split('-')[2]))
  const added = []

  for (const pref of MISSING_PREFS) {
    process.stdout.write(`[城] ${pref.name}... `)
    const members = await fetchCategory(pref.name + 'の城')

    const spots = members
      .filter(m => {
        if (seenPageIds.has(String(m.pageid))) return false
        if (m.title.includes('の城の一覧')) return false
        if (m.title.includes('の一覧')) return false
        if (m.title === pref.name + 'の城') return false
        seenPageIds.add(String(m.pageid))
        return true
      })
      .map(m => ({
        id: `castle-${pref.code}-${m.pageid}`,
        name: m.title,
        prefecture_code: pref.code,
        lat: null,
        lon: null,
      }))
      .filter(s => !seen.has(s.id))

    console.log(`${spots.length}件追加`)
    added.push(...spots)
    await sleep(800)
  }

  const merged = [...existing, ...added]
  console.log(`\n追加: ${added.length}件 → 合計: ${merged.length}件`)
  writeFileSync('lib/spots/castle.json', JSON.stringify(merged, null, 2), 'utf-8')
  console.log('lib/spots/castle.json 更新完了')
}

main().catch(err => { console.error(err); process.exit(1) })
