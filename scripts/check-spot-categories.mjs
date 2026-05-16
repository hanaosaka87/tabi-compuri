// 各カテゴリのWikipedia登録件数を確認
const checks = [
  'Category:日本の温泉地',
  'Category:日本の温泉',
  'Category:日本の遊園地',
  'Category:日本のテーマパーク',
  'Category:日本の動物園',
  'Category:日本の水族館',
  'Category:日本のキャンプ場',
  'Category:日本の道の駅',
]

for (const cat of checks) {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmlimit=10&cmnamespace=0&format=json`
  const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0' } })
  const json = await res.json()
  const count = json.query?.categorymembers?.length ?? 0
  const sample = (json.query?.categorymembers ?? []).slice(0, 2).map(m => m.title).join(', ')
  console.log(`${cat}: ${count}件 [${sample}]`)
  await new Promise(r => setTimeout(r, 300))
}
