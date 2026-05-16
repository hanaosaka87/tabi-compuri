// 埼玉・長野などのカテゴリ名を探す
const targets = ['埼玉県', '長野県', '大阪府', '福岡県']
for (const pref of targets) {
  // カテゴリ検索
  const url = `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent('Category:' + pref + 'の道の駅')}&srnamespace=14&srlimit=5&format=json`
  const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0' } })
  const json = await res.json()
  console.log(`\n[${pref}]`)
  for (const r of json.query?.search ?? []) {
    console.log(' ', r.title)
  }
}
