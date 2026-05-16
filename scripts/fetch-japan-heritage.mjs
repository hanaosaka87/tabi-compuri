import { writeFileSync } from 'fs'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchAll() {
  const all = []
  let cmcontinue = undefined

  while (true) {
    const params = new URLSearchParams({
      action: 'query', list: 'categorymembers',
      cmtitle: 'Category:日本遺産',
      cmlimit: '500', cmnamespace: '0', format: 'json',
      ...(cmcontinue ? { cmcontinue } : {}),
    })
    const res = await fetch(`https://ja.wikipedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': 'tabi-compuri/1.0 (github.com/hanaosaka87)' }
    })
    const text = await res.text()
    if (text.startsWith('You are making')) { await sleep(8000); continue }
    const data = JSON.parse(text)
    const members = data.query?.categorymembers ?? []
    all.push(...members)
    if (data.continue?.cmcontinue) {
      cmcontinue = data.continue.cmcontinue
      await sleep(1000)
    } else break
  }

  return all
    .filter(m => m.title !== '日本遺産')
    .map(m => ({
      id: `heritage-0-${m.pageid}`,
      name: m.title,
      prefecture_code: 0,
      lat: null,
      lon: null,
    }))
}

const spots = await fetchAll()
console.log(`合計 ${spots.length}件`)
writeFileSync('lib/spots/japan-heritage.json', JSON.stringify(spots, null, 2), 'utf-8')
console.log('lib/spots/japan-heritage.json 保存完了')
