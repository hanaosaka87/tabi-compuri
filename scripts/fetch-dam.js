const https = require('https')
const fs = require('fs')

const PREF_CATEGORIES = [
  { code: 1, cat: '北海道のダム' },
  { code: 2, cat: '青森県のダム' },
  { code: 3, cat: '岩手県のダム' },
  { code: 4, cat: '宮城県のダム' },
  { code: 5, cat: '秋田県のダム' },
  { code: 6, cat: '山形県のダム' },
  { code: 7, cat: '福島県のダム' },
  { code: 8, cat: '茨城県のダム' },
  { code: 9, cat: '栃木県のダム' },
  { code: 10, cat: '群馬県のダム' },
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
  { code: 30, cat: '和歌山県のダム' },
  { code: 31, cat: '鳥取県のダム' },
  { code: 32, cat: '島根県のダム' },
  { code: 33, cat: '岡山県のダム' },
  { code: 34, cat: '広島県のダム' },
  { code: 35, cat: '山口県のダム' },
  { code: 36, cat: '徳島県のダム' },
  { code: 37, cat: '香川県のダム' },
  { code: 38, cat: '愛媛県のダム' },
  { code: 39, cat: '高知県のダム' },
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
    https.get(url, { headers: { 'User-Agent': 'tabi-compuri/1.0' } }, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function fetchCategory(categoryName, continueParam = null) {
  let url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(categoryName)}&cmlimit=500&cmtype=page&format=json`
  if (continueParam) url += `&cmcontinue=${encodeURIComponent(continueParam)}`
  return fetchJson(url)
}

async function getAllPages(categoryName, retries = 3) {
  const pages = []
  let cont = null
  do {
    let data = null
    for (let i = 0; i < retries; i++) {
      try {
        data = await fetchCategory(categoryName, cont)
        break
      } catch (e) {
        if (i < retries - 1) await new Promise(r => setTimeout(r, 3000))
        else throw e
      }
    }
    if (data && data.query && data.query.categorymembers) {
      pages.push(...data.query.categorymembers)
    }
    cont = data && data.continue ? data.continue.cmcontinue : null
  } while (cont)
  return pages
}

async function main() {
  const results = []
  const seen = new Set()

  for (const pref of PREF_CATEGORIES) {
    console.log(`取得中: ${pref.cat} (${pref.code})`)
    try {
      const pages = await getAllPages(pref.cat)
      for (const page of pages) {
        const name = page.title.replace(/（.*?）/g, '').trim()
        if (seen.has(page.pageid)) continue
        seen.add(page.pageid)
        results.push({
          id: `dam-${pref.code}-${page.pageid}`,
          name: page.title,
          prefecture_code: pref.code,
        })
      }
      console.log(`  → ${pages.length}件`)
    } catch (e) {
      console.error(`  エラー: ${pref.cat}`, e.message)
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  results.sort((a, b) => a.prefecture_code - b.prefecture_code)
  fs.writeFileSync('./lib/spots/dam.json', JSON.stringify(results, null, 2), 'utf8')
  console.log(`\n完了: ${results.length}件 → lib/spots/dam.json`)
}

main().catch(console.error)
