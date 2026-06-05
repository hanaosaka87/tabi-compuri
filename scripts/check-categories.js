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
  const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(categoryName)}&cmlimit=10&cmtype=page&format=json`
  const d = await fetchJson(url)
  const members = d.query?.categorymembers ?? []
  console.log(`\n【${categoryName}】${members.length}件（サンプル）`)
  members.slice(0, 5).forEach(m => console.log(' -', m.title))
}

async function main() {
  const cats = [
    '日本の観光地',
    '日本の観光名所',
    'パワースポット',
    '日本の霊場',
    '日本の聖地',
    '日本の名勝',
    '訪日外国人に人気の観光地',
    '日本のスピリチュアルスポット',
    '霊場',
  ]
  for (const c of cats) {
    try { await check(c) } catch(e) { console.log(`\n【${c}】エラー: ${e.message}`) }
    await new Promise(r => setTimeout(r, 500))
  }
}
main()
