import { writeFileSync, mkdirSync, readFileSync } from 'fs'

// 動物園・水族館は都道府県別カテゴリがないため
// 「日本の動物園」「日本の水族館」から全件取得してサブカテゴリも探索

const PREF_KEYWORDS = [
  [1,'北海道'],[2,'青森'],[3,'岩手'],[4,'宮城'],[5,'秋田'],[6,'山形'],[7,'福島'],
  [8,'茨城'],[9,'栃木'],[10,'群馬'],[11,'埼玉'],[12,'千葉'],[13,'東京'],[14,'神奈川'],
  [15,'新潟'],[16,'富山'],[17,'石川'],[18,'福井'],[19,'山梨'],[20,'長野'],
  [21,'岐阜'],[22,'静岡'],[23,'愛知'],[24,'三重'],[25,'滋賀'],[26,'京都'],[27,'大阪'],
  [28,'兵庫'],[29,'奈良'],[30,'和歌山'],[31,'鳥取'],[32,'島根'],[33,'岡山'],
  [34,'広島'],[35,'山口'],[36,'徳島'],[37,'香川'],[38,'愛媛'],[39,'高知'],
  [40,'福岡'],[41,'佐賀'],[42,'長崎'],[43,'熊本'],[44,'大分'],[45,'宮崎'],
  [46,'鹿児島'],[47,'沖縄'],
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchAll(catName) {
  const all = []
  let cmcontinue = null
  do {
    const params = new URLSearchParams({
      action: 'query', list: 'categorymembers',
      cmtitle: 'Category:' + catName,
      cmlimit: '500', cmnamespace: '0', format: 'json',
      ...(cmcontinue ? { cmcontinue } : {}),
    })
    const res = await fetch('https://ja.wikipedia.org/w/api.php?' + params, {
      headers: { 'User-Agent': 'tabi-compuri/1.0' }
    })
    const json = await res.json()
    all.push(...(json.query?.categorymembers ?? []))
    cmcontinue = json.continue?.cmcontinue ?? null
    if (cmcontinue) await sleep(500)
  } while (cmcontinue)
  return all
}

// タイトルから都道府県を推定
function guessPref(title) {
  for (const [code, kw] of PREF_KEYWORDS) {
    if (title.includes(kw)) return code
  }
  return null
}

async function main() {
  mkdirSync('lib/spots', { recursive: true })

  for (const [catId, catName, label] of [
    ['zoo', '日本の動物園', '動物園'],
    ['aquarium', '日本の水族館', '水族館'],
  ]) {
    console.log(`\n=== ${label} ===`)
    const members = await fetchAll(catName)
    console.log(`取得: ${members.length}件`)

    const spots = []
    const seen = new Set()
    for (const m of members) {
      if (seen.has(m.pageid) || m.title.includes('一覧') || m.title.includes('協会')) continue
      seen.add(m.pageid)
      const prefCode = guessPref(m.title) ?? 0
      spots.push({
        id: `${catId}-${m.pageid}`,
        name: m.title,
        prefecture_code: prefCode,
        lat: null, lon: null,
      })
    }

    // 都道府県不明(0)の件数を表示
    const unknown = spots.filter(s => s.prefecture_code === 0).length
    console.log(`有効: ${spots.length}件 (都道府県不明: ${unknown}件)`)
    writeFileSync(`lib/spots/${catId}.json`, JSON.stringify(spots, null, 2), 'utf-8')
    console.log(`lib/spots/${catId}.json 保存完了`)
    await sleep(1000)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
