const https = require('https')
const fs = require('fs')

// エラーになった都道府県のみ再取得
const RETRY_PREFS = [
  { code: 11, cat: '埼玉県のダム' },
  { code: 12, cat: '千葉県のダム' },
  { code: 13, cat: '東京都のダム' },
  { code: 14, cat: '神奈川県のダム' },
  { code: 15, cat: '新潟県のダム' },
  { code: 16, cat: '富山県のダム' },
  { code: 17, cat: '石川県のダム' },
  { code: 18, cat: '福井県のダム' },
  { code: 19, cat: '山梨県のダム' },
  { code: 20, cat: '長野県のダム' },
  { code: 21, cat: '岐阜県のダム' },
  { code: 22, cat: '静岡県のダム' },
  { code: 23, cat: '愛知県のダム' },
  { code: 24, cat: '三重県のダム' },
  { code: 25, cat: '滋賀県のダム' },
  { code: 26, cat: '京都府のダム' },
  { code: 27, cat: '大阪府のダム' },
  { code: 28, cat: '兵庫県のダム' },
  { code: 29, cat: '奈良県のダム' },
  { code: 40, cat: '福岡県のダム' },
  { code: 41, cat: '佐賀県のダム' },
  { code: 42, cat: '長崎県のダム' },
  { code: 43, cat: '熊本県のダム' },
  { code: 44, cat: '大分県のダム' },
  { code: 45, cat: '宮崎県のダム' },
  { code: 46, cat: '鹿児島県のダム' },
  { code: 47, cat: '沖縄県のダム' },
]

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'tabi-compuri-bot/1.0 (educational project)' } }, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error(data.substring(0, 50))) }
      })
    }).on('error', reject)
  })
}

async function getAllPages(categoryName) {
  const pages = []
  let cont = null
  do {
    let data = null
    for (let i = 0; i < 5; i++) {
      try {
        let url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(categoryName)}&cmlimit=500&cmtype=page&format=json`
        if (cont) url += `&cmcontinue=${encodeURIComponent(cont)}`
        data = await fetchJson(url)
        break
      } catch (e) {
        console.log(`  リトライ ${i+1}/5: ${e.message}`)
        await new Promise(r => setTimeout(r, 3000 * (i + 1)))
      }
    }
    if (!data) throw new Error('取得失敗')
    if (data.query && data.query.categorymembers) {
      pages.push(...data.query.categorymembers)
    }
    cont = data.continue ? data.continue.cmcontinue : null
  } while (cont)
  return pages
}

async function main() {
  // 既存データを読み込み
  const existing = JSON.parse(fs.readFileSync('./lib/spots/dam.json', 'utf8'))
  const seen = new Set(existing.map(e => e.id.split('-')[2]))
  console.log(`既存: ${existing.length}件`)

  const additional = []

  for (const pref of RETRY_PREFS) {
    console.log(`取得中: ${pref.cat} (${pref.code})`)
    try {
      const pages = await getAllPages(pref.cat)
      for (const page of pages) {
        const pageId = String(page.pageid)
        if (seen.has(pageId)) continue
        seen.add(pageId)
        additional.push({
          id: `dam-${pref.code}-${page.pageid}`,
          name: page.title,
          prefecture_code: pref.code,
        })
      }
      console.log(`  → ${pages.length}件`)
    } catch (e) {
      console.error(`  エラー: ${pref.cat}`, e.message)
    }
    await new Promise(r => setTimeout(r, 2000))
  }

  const all = [...existing, ...additional]
  all.sort((a, b) => a.prefecture_code - b.prefecture_code)
  fs.writeFileSync('./lib/spots/dam.json', JSON.stringify(all, null, 2), 'utf8')
  console.log(`\n完了: 合計${all.length}件 (追加${additional.length}件) → lib/spots/dam.json`)
}

main().catch(console.error)
