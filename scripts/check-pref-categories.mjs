// 都道府県別カテゴリが存在するか確認
const types = ['の温泉', 'の遊園地', 'のテーマパーク', 'の動物園', 'の水族館']
const testPrefs = ['北海道', '東京都', '大阪府', '福岡県']

for (const pref of testPrefs) {
  for (const type of types) {
    const cat = 'Category:' + pref + type
    const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmlimit=3&cmnamespace=0&format=json`
    const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0' } })
    const json = await res.json()
    const members = json.query?.categorymembers ?? []
    if (members.length > 0) {
      console.log(`✅ ${cat}: ${members.length}件+ [${members.map(m=>m.title).join(', ')}]`)
    }
    await new Promise(r => setTimeout(r, 200))
  }
}
