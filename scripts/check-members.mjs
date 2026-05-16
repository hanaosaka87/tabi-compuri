// 埼玉のカテゴリメンバーを直接確認
const url = `https://ja.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:埼玉県の道の駅')}&cmlimit=10&format=json`
const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0' } })
const json = await res.json()
console.log(JSON.stringify(json.query?.categorymembers, null, 2))
