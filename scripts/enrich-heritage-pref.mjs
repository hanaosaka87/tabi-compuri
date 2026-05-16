import { readFileSync, writeFileSync } from 'fs'

const PREF_MAP = {
  '北海道':1,'青森県':2,'岩手県':3,'宮城県':4,'秋田県':5,'山形県':6,'福島県':7,
  '茨城県':8,'栃木県':9,'群馬県':10,'埼玉県':11,'千葉県':12,'東京都':13,'神奈川県':14,
  '新潟県':15,'富山県':16,'石川県':17,'福井県':18,'山梨県':19,'長野県':20,'岐阜県':21,
  '静岡県':22,'愛知県':23,'三重県':24,'滋賀県':25,'京都府':26,'大阪府':27,'兵庫県':28,
  '奈良県':29,'和歌山県':30,'鳥取県':31,'島根県':32,'岡山県':33,'広島県':34,'山口県':35,
  '徳島県':36,'香川県':37,'愛媛県':38,'高知県':39,'福岡県':40,'佐賀県':41,'長崎県':42,
  '熊本県':43,'大分県':44,'宮崎県':45,'鹿児島県':46,'沖縄県':47,
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function getPrefCode(pageId) {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&prop=categories&pageids=${pageId}&cllimit=50&format=json`
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0' } })
      const text = await res.text()
      if (text.startsWith('You are making')) { await sleep(8000); continue }
      const data = JSON.parse(text)
      const cats = data.query?.pages?.[pageId]?.categories ?? []
      for (const cat of cats) {
        for (const [name, code] of Object.entries(PREF_MAP)) {
          if (cat.title.includes(name)) return code
        }
      }
      return 0
    } catch { await sleep(3000) }
  }
  return 0
}

const spots = JSON.parse(readFileSync('lib/spots/japan-heritage.json', 'utf-8'))
console.log(`${spots.length}件を処理中...`)

let found = 0
for (let i = 0; i < spots.length; i++) {
  const spot = spots[i]
  const pageId = spot.id.split('-')[2]
  const code = await getPrefCode(pageId)
  if (code > 0) { spot.prefecture_code = code; found++ }
  spot.id = spot.id.replace(`heritage-0-`, `heritage-${code}-`)
  if ((i + 1) % 10 === 0) process.stdout.write(`\r${i+1}/${spots.length} (都道府県判定: ${found}件)`)
  await sleep(300)
}

console.log(`\n完了: ${found}/${spots.length}件に都道府県を設定`)
writeFileSync('lib/spots/japan-heritage.json', JSON.stringify(spots, null, 2), 'utf-8')
console.log('保存完了')
