const https = require('https')

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'tabi-compuri/1.0' } }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => resolve(JSON.parse(data)))
    }).on('error', reject)
  })
}

async function check(categoryName) {
  // サブカテゴリも含めて確認
  const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(categoryName)}&cmlimit=20&format=json`
  const d = await fetchJson(url)
  const members = d.query?.categorymembers ?? []
  console.log(`\n【${categoryName}】合計${members.length}件`)
  members.forEach(m => console.log(` ${m.ns===14?'[カテゴリ]':'[ページ]'} ${m.title}`))
}

async function main() {
  const cats = [
    '日本の霊山',
    '日本の名山',
    '修験道の山',
    '日本の聖地',
    'パワースポット (日本)',
    '日本の百名山',
    '日本の滝百選',
    '日本三景',
    '観光地 (日本)',
    '日本の名所',
    '外国人観光客に人気の場所',
  ]
  for (const c of cats) {
    try { await check(c) } catch(e) { console.log(`\n【${c}】エラー`) }
    await new Promise(r => setTimeout(r, 500))
  }
}
main()
