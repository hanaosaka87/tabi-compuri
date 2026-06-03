import { readFileSync, writeFileSync } from 'fs'

function matchTier(item, list) {
  return list.some(t => {
    const nm = item.name === t.name
      || item.name.startsWith(t.name + ' ')
      || item.name.startsWith(t.name + '（')
    return nm && (t.pref === 0 || item.prefecture_code === t.pref)
  })
}

// ─── 遊園地（amusement + theme-park 統合）────────────────────────────
const amusement = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/amusement.json', 'utf-8'))
const themePark = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/theme-park.json', 'utf-8'))

// theme-park の独自分を amusement に追加
const amNames = new Set(amusement.map(d => d.name))
const toAdd = themePark.filter(d => !amNames.has(d.name))
console.log('theme-park → amusement に追加:', toAdd.length, '件')
console.log('追加施設:', toAdd.map(d => d.name).join(', '))

const merged = [...amusement, ...toAdd]

const AM_S = [
  // 超大型・日本を代表するテーマパーク
  { name: '東京ディズニーランド', pref: 12 },
  { name: '東京ディズニーシー', pref: 12 },
  { name: 'ユニバーサル・スタジオ・ジャパン', pref: 27 },
  { name: '富士急ハイランド', pref: 19 },
  { name: 'ナガシマスパーランド', pref: 24 },
  { name: 'ハウステンボス', pref: 42 },
  { name: 'スペースワールド', pref: 40 },
  { name: 'シーガイア', pref: 45 },
  { name: '志摩スペイン村', pref: 24 },
  { name: 'レゴランド・ジャパン', pref: 23 },
  { name: 'サンリオピューロランド', pref: 13 },
  { name: 'ムーミンバレーパーク', pref: 11 },
]

const AM_A = [
  { name: '花やしき', pref: 13 },
  { name: '東京ドームシティ アトラクションズ', pref: 13 },
  { name: '東京ジョイポリス', pref: 13 },
  { name: 'よみうりランド', pref: 13 },
  { name: 'キッザニア東京', pref: 13 },
  { name: '横浜コスモワールド', pref: 14 },
  { name: '八景島シーパラダイス', pref: 14 },
  { name: '那須ハイランドパーク', pref: 9 },
  { name: 'EDO WONDERLAND 日光江戸村', pref: 9 },
  { name: '東武ワールドスクウェア', pref: 9 },
  { name: '西武園ゆうえんち', pref: 11 },
  { name: 'スパリゾートハワイアンズ', pref: 7 },
  { name: 'ラグーナテンボス', pref: 23 },
  { name: 'ひらかたパーク', pref: 27 },
  { name: 'キッザニア甲子園', pref: 28 },
  { name: '姫路セントラルパーク', pref: 28 },
  { name: '東映太秦映画村', pref: 26 },
  { name: 'グリーンランド', pref: 43 },
  { name: 'ハーモニーランド', pref: 44 },
  { name: 'おきなわワールド', pref: 47 },
  { name: '琉球村', pref: 47 },
  { name: '伊豆ぐらんぱる公園', pref: 22 },
  { name: '昭和新山熊牧場', pref: 1 },
  { name: 'のぼりべつクマ牧場', pref: 1 },
  { name: '白い恋人パーク', pref: 1 },
  { name: '鷲羽山ハイランド', pref: 33 },
  { name: 'ポルトヨーロッパ', pref: 30 },
  { name: 'キッザニア福岡', pref: 40 },
  { name: 'カナディアンワールド', pref: 1 },
]

const AM_B = [
  { name: '北海道開拓の村', pref: 1 },
  { name: 'えこりん村', pref: 1 },
  { name: '登別伊達時代村', pref: 1 },
  { name: 'サホロリゾート ベア・マウンテン', pref: 1 },
  { name: '東武動物公園', pref: 11 },
  { name: '石炭の歴史村', pref: 1 },
  { name: 'あさひかわラーメン村', pref: 1 },
]

const amResult = merged.map(s => {
  if (matchTier(s, AM_S)) return { ...s, tier: 'S' }
  if (matchTier(s, AM_A)) return { ...s, tier: 'A' }
  if (matchTier(s, AM_B)) return { ...s, tier: 'B' }
  return { ...s, tier: 'C' }
})
const ac = { S: 0, A: 0, B: 0, C: 0 }; amResult.forEach(s => ac[s.tier]++)
console.log('遊園地 tier:', JSON.stringify(ac))
console.log('S:', amResult.filter(s => s.tier === 'S').map(s => s.name))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/amusement.json', JSON.stringify(amResult, null, 2), 'utf-8')

// ─── 動物園 ────────────────────────────────────────────────────────
const ZOO_S = [
  { name: '旭山動物園', pref: 1 },
  { name: '恩賜上野動物園', pref: 13 },
  { name: '多摩動物公園', pref: 13 },
  { name: '天王寺動物園', pref: 27 },
  { name: '東山動植物園', pref: 23 },
  { name: 'よこはま動物園ズーラシア', pref: 14 },
  { name: '神戸市立王子動物園', pref: 28 },
  { name: '到津の森公園', pref: 40 },
  { name: '札幌市円山動物園', pref: 1 },
]

const ZOO_A = [
  { name: '千葉市動物公園', pref: 12 },
  { name: '埼玉県こども動物自然公園', pref: 11 },
  { name: '那須どうぶつ王国', pref: 9 },
  { name: '那須サファリパーク', pref: 9 },
  { name: '富士サファリパーク', pref: 22 },
  { name: '伊豆シャボテン動物公園', pref: 22 },
  { name: '伊豆アニマルキングダム', pref: 22 },
  { name: '豊橋総合動植物公園', pref: 23 },
  { name: '東武動物公園', pref: 11 },
  { name: '神戸どうぶつ王国', pref: 28 },
  { name: '姫路市立動物園', pref: 28 },
  { name: '秋吉台サファリランド', pref: 35 },
  { name: '阿蘇カドリー・ドミニオン', pref: 43 },
  { name: '平川動物公園', pref: 46 },
  { name: 'ズーラシア', pref: 14 },
  { name: '京都市動物園', pref: 26 },
  { name: '大阪市天王寺動物園', pref: 27 },
  { name: '日本モンキーセンター', pref: 23 },
  { name: '福岡市動物園', pref: 40 },
  { name: '熊本市動植物園', pref: 43 },
  { name: '仙台市八木山動物公園', pref: 4 },
  { name: '秋田市大森山動物園', pref: 5 },
  { name: '盛岡市動物公園', pref: 3 },
  { name: '那須どうぶつ王国', pref: 9 },
]

const ZOO_B = [
  { name: 'IPCわんわん動物園', pref: 1 },
  { name: '旭川市旭山動物園', pref: 1 },
  { name: '長崎バイオパーク', pref: 42 },
  { name: '熱川バナナワニ園', pref: 22 },
  { name: '愛媛県立とべ動物園', pref: 38 },
  { name: '高知県立のいち動物公園', pref: 39 },
]

const zoo = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/zoo.json', 'utf-8'))
const zooResult = zoo.map(s => {
  if (matchTier(s, ZOO_S)) return { ...s, tier: 'S' }
  if (matchTier(s, ZOO_A)) return { ...s, tier: 'A' }
  if (matchTier(s, ZOO_B)) return { ...s, tier: 'B' }
  return { ...s, tier: 'C' }
})
const zc = { S: 0, A: 0, B: 0, C: 0 }; zooResult.forEach(s => zc[s.tier]++)
console.log('動物園 tier:', JSON.stringify(zc))
console.log('S:', zooResult.filter(s => s.tier === 'S').map(s => s.name))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/zoo.json', JSON.stringify(zooResult, null, 2), 'utf-8')

// ─── 水族館 ────────────────────────────────────────────────────────
const AQ_S = [
  { name: '沖縄美ら海水族館', pref: 47 },
  { name: '海遊館', pref: 27 },
  { name: '葛西臨海水族園', pref: 13 },
]

const AQ_A = [
  { name: 'サンシャイン水族館', pref: 13 },
  { name: 'アクアパーク品川', pref: 13 },
  { name: 'すみだ水族館', pref: 13 },
  { name: 'しながわ水族館', pref: 13 },
  { name: '横浜・八景島シーパラダイス', pref: 14 },
  { name: 'マクセル アクアパーク品川', pref: 13 },
  { name: '名古屋港水族館', pref: 23 },
  { name: '鳥羽水族館', pref: 24 },
  { name: '京都水族館', pref: 26 },
  { name: '大阪海遊館', pref: 27 },
  { name: '神戸市立須磨海浜水族園', pref: 28 },
  { name: 'アクア・トトぎふ', pref: 21 },
  { name: '新潟市水族館 マリンピア日本海', pref: 15 },
  { name: '仙台うみの杜水族館', pref: 4 },
  { name: 'マリンワールド海の中道', pref: 40 },
  { name: 'かごしま水族館', pref: 46 },
  { name: '竹島水族館', pref: 23 },
  { name: '下田海中水族館', pref: 22 },
  { name: '越前松島水族館', pref: 18 },
  { name: 'AOAO SAPPORO', pref: 1 },
  { name: '男鹿水族館GAO', pref: 5 },
  { name: '秋田県立男鹿水族館', pref: 5 },
  { name: '島根県立しまね海洋館アクアス', pref: 32 },
  { name: '四国水族館', pref: 37 },
  { name: '須磨海浜水族館', pref: 28 },
]

const AQ_B = [
  { name: '青森県営浅虫水族館', pref: 2 },
  { name: '福島県環境水族館', pref: 7 },
  { name: 'アクアテラス錦ヶ丘', pref: 4 },
  { name: 'アクア東条', pref: 28 },
  { name: '石川県ふれあい昆虫館', pref: 17 },
  { name: '滋賀県立琵琶湖博物館', pref: 25 },
  { name: '加茂水族館', pref: 6 },
  { name: 'のとじま水族館', pref: 17 },
  { name: 'うみたまご', pref: 44 },
]

const aquarium = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/aquarium.json', 'utf-8'))
const aqResult = aquarium.map(s => {
  if (matchTier(s, AQ_S)) return { ...s, tier: 'S' }
  if (matchTier(s, AQ_A)) return { ...s, tier: 'A' }
  if (matchTier(s, AQ_B)) return { ...s, tier: 'B' }
  return { ...s, tier: 'C' }
})
const aqc = { S: 0, A: 0, B: 0, C: 0 }; aqResult.forEach(s => aqc[s.tier]++)
console.log('水族館 tier:', JSON.stringify(aqc))
console.log('S:', aqResult.filter(s => s.tier === 'S').map(s => s.name))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/aquarium.json', JSON.stringify(aqResult, null, 2), 'utf-8')

console.log('全カテゴリ保存完了')
