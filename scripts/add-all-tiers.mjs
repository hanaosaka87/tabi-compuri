import { readFileSync, writeFileSync } from 'fs'

function matchTier(item, list) {
  return list.some(t => {
    const nm = item.name === t.name
      || item.name === t.name + '跡'
      || item.name.startsWith(t.name + ' ')
      || item.name.startsWith(t.name + '（')
    return nm && item.prefecture_code === t.pref
  })
}

// ─── 神社 ────────────────────────────────────────────────────────────
const SHRINE_S = [
  { name: '北海道神宮', pref: 1 }, { name: '鹽竈神社', pref: 4 }, { name: '塩竈神社', pref: 4 },
  { name: '氷川神社', pref: 11 }, { name: '鹿島神宮', pref: 8 }, { name: '香取神宮', pref: 12 },
  { name: '富士山本宮浅間大社', pref: 22 }, { name: '三嶋大社', pref: 22 },
  { name: '熱田神宮', pref: 23 },
  { name: '椿大神社', pref: 24 }, { name: '伊勢神宮', pref: 24 },
  { name: '建部大社', pref: 25 }, { name: '多賀大社', pref: 25 },
  { name: '賀茂別雷神社', pref: 26 }, { name: '賀茂御祖神社', pref: 26 },
  { name: '上賀茂神社', pref: 26 }, { name: '下鴨神社', pref: 26 },
  { name: '石清水八幡宮', pref: 26 }, { name: '松尾大社', pref: 26 },
  { name: '伏見稲荷大社', pref: 26 }, { name: '平野神社', pref: 26 },
  { name: '吉田神社', pref: 26 }, { name: '北野天満宮', pref: 26 },
  { name: '住吉大社', pref: 27 },
  { name: '廣田神社', pref: 28 }, { name: '生田神社', pref: 28 },
  { name: '大神神社', pref: 29 }, { name: '春日大社', pref: 29 },
  { name: '石上神宮', pref: 29 }, { name: '大和神社', pref: 29 },
  { name: '廣瀬大社', pref: 29 }, { name: '龍田大社', pref: 29 },
  { name: '丹生都比売神社', pref: 30 }, { name: '熊野那智大社', pref: 30 },
  { name: '熊野本宮大社', pref: 30 }, { name: '熊野速玉大社', pref: 30 },
  { name: '出雲大社', pref: 32 }, { name: '熊野大社', pref: 32 },
  { name: '吉備津彦神社', pref: 33 }, { name: '吉備津神社', pref: 33 },
  { name: '厳島神社', pref: 34 },
  { name: '住吉神社', pref: 40 }, { name: '太宰府天満宮', pref: 40 },
  { name: '宇佐神宮', pref: 44 },
  { name: '霧島神宮', pref: 46 },
  { name: '波上宮', pref: 47 },
]

const SHRINE_A = [
  { name: '岩木山神社', pref: 2 }, { name: '駒形神社', pref: 3 },
  { name: '志波彦神社', pref: 4 }, { name: '大物忌神社', pref: 6 },
  { name: '鳥海山大物忌神社', pref: 6 },
  { name: '都々古別神社', pref: 7 },
  { name: '日光二荒山神社', pref: 9 }, { name: '宇都宮二荒山神社', pref: 9 },
  { name: '貫前神社', pref: 10 },
  { name: '弥彦神社', pref: 15 },
  { name: '気多大社', pref: 17 }, { name: '白山比咩神社', pref: 17 },
  { name: '気比神宮', pref: 18 }, { name: '若狭彦神社', pref: 18 },
  { name: '浅間神社', pref: 19 }, { name: '諏訪大社', pref: 20 },
  { name: '南宮大社', pref: 21 }, { name: '小国神社', pref: 22 },
  { name: '真清田神社', pref: 23 },
  { name: '都波岐奈加等神社', pref: 24 },
  { name: '伊和神社', pref: 28 }, { name: '粒坐天照神社', pref: 28 },
  { name: '宇倍神社', pref: 31 },
  { name: '明治神宮', pref: 13 }, { name: '靖国神社', pref: 13 },
  { name: '日枝神社', pref: 13 }, { name: '神田神社', pref: 13 }, { name: '神田明神', pref: 13 },
  { name: '鶴岡八幡宮', pref: 14 }, { name: '江島神社', pref: 14 }, { name: '箱根神社', pref: 14 },
  { name: '大山阿夫利神社', pref: 14 },
  { name: '八坂神社', pref: 26 }, { name: '平安神宮', pref: 26 }, { name: '晴明神社', pref: 26 },
  { name: '金刀比羅宮', pref: 37 },
  { name: '阿蘇神社', pref: 43 },
  { name: '都農神社', pref: 45 },
  { name: '枚聞神社', pref: 46 }, { name: '鹿児島神宮', pref: 46 },
  { name: '土佐神社', pref: 39 },
]

const SHRINE_B = [
  { name: '函館八幡宮', pref: 1 }, { name: '旭川神社', pref: 1 },
  { name: '大崎八幡宮', pref: 4 },
  { name: '出羽神社', pref: 6 }, { name: '出羽三山神社', pref: 6 },
  { name: '大洗磯前神社', pref: 8 }, { name: '筑波山神社', pref: 8 },
  { name: '二荒山神社', pref: 9 }, { name: '榛名神社', pref: 10 },
  { name: '三峯神社', pref: 11 }, { name: '秩父神社', pref: 11 },
  { name: '千葉神社', pref: 12 },
  { name: '穂高神社', pref: 20 },
  { name: '飛騨一宮水無神社', pref: 21 },
  { name: '三嶋大社', pref: 22 },
  { name: '豊川稲荷', pref: 23 }, { name: '津島神社', pref: 23 },
  { name: '多度大社', pref: 24 },
  { name: '日牟禮八幡宮', pref: 25 },
  { name: '愛宕神社', pref: 26 }, { name: '今宮神社', pref: 26 },
  { name: '難波八阪神社', pref: 27 },
  { name: '長田神社', pref: 28 }, { name: '湊川神社', pref: 28 },
  { name: '談山神社', pref: 29 },
  { name: '玉置神社', pref: 30 },
  { name: '美保神社', pref: 32 },
  { name: '最上稲荷', pref: 33 },
  { name: '大麻比古神社', pref: 36 },
  { name: '田村神社', pref: 37 },
  { name: '大山祇神社', pref: 38 }, { name: '伊曽乃神社', pref: 38 },
  { name: '筥崎宮', pref: 40 }, { name: '宮地嶽神社', pref: 40 }, { name: '香椎宮', pref: 40 },
  { name: '祐徳稲荷神社', pref: 41 }, { name: '千栗八幡宮', pref: 41 },
  { name: '西寒多神社', pref: 44 }, { name: '柞原八幡宮', pref: 44 },
  { name: '青島神社', pref: 45 }, { name: '高千穂神社', pref: 45 },
  { name: '照国神社', pref: 46 },
]

const shrines = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/shrine-temple.json', 'utf-8'))
const shrineResult = shrines.map(s => {
  if (matchTier(s, SHRINE_S)) return { ...s, tier: 'S' }
  if (matchTier(s, SHRINE_A)) return { ...s, tier: 'A' }
  if (matchTier(s, SHRINE_B)) return { ...s, tier: 'B' }
  return { ...s, tier: 'C' }
})
const sc = { S: 0, A: 0, B: 0, C: 0 }; shrineResult.forEach(s => sc[s.tier]++)
console.log('神社 tier:', JSON.stringify(sc))
console.log('S:', shrineResult.filter(s => s.tier === 'S').map(s => s.name))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/shrine-temple.json', JSON.stringify(shrineResult, null, 2), 'utf-8')

// ─── 温泉 ────────────────────────────────────────────────────────────
const ONSEN_S = [
  { name: '草津温泉', pref: 10 }, { name: '有馬温泉', pref: 28 }, { name: '下呂温泉', pref: 21 },
]
const ONSEN_A = [
  { name: '登別温泉', pref: 1 }, { name: '定山渓温泉', pref: 1 }, { name: '洞爺湖温泉', pref: 1 },
  { name: '層雲峡温泉', pref: 1 }, { name: '十勝川温泉', pref: 1 }, { name: '阿寒湖温泉', pref: 1 },
  { name: '川湯温泉', pref: 1 }, { name: '函館湯の川温泉', pref: 1 },
  { name: '酸ヶ湯温泉', pref: 2 }, { name: '青荷温泉', pref: 2 },
  { name: '鉛温泉', pref: 3 }, { name: 'つなぎ温泉', pref: 3 },
  { name: '鳴子温泉', pref: 4 }, { name: '作並温泉', pref: 4 }, { name: '秋保温泉', pref: 4 },
  { name: '玉川温泉', pref: 5 }, { name: '乳頭温泉', pref: 5 }, { name: '後生掛温泉', pref: 5 },
  { name: '銀山温泉', pref: 6 }, { name: '蔵王温泉', pref: 6 },
  { name: '東山温泉', pref: 7 }, { name: '芦ノ牧温泉', pref: 7 },
  { name: '那須温泉', pref: 9 }, { name: '那須湯本温泉', pref: 9 },
  { name: '塩原温泉', pref: 9 }, { name: '鬼怒川温泉', pref: 9 },
  { name: '伊香保温泉', pref: 10 }, { name: '四万温泉', pref: 10 },
  { name: '箱根温泉', pref: 14 }, { name: '湯河原温泉', pref: 14 },
  { name: '越後湯沢温泉', pref: 15 }, { name: '月岡温泉', pref: 15 },
  { name: '宇奈月温泉', pref: 16 },
  { name: '山代温泉', pref: 17 }, { name: '山中温泉', pref: 17 }, { name: '粟津温泉', pref: 17 },
  { name: '芦原温泉', pref: 18 },
  { name: '石和温泉', pref: 19 }, { name: '下部温泉', pref: 19 },
  { name: '野沢温泉', pref: 20 }, { name: '白骨温泉', pref: 20 },
  { name: '上諏訪温泉', pref: 20 }, { name: '渋温泉', pref: 20 }, { name: '昼神温泉', pref: 20 },
  { name: '熱海温泉', pref: 22 }, { name: '修善寺温泉', pref: 22 },
  { name: '伊東温泉', pref: 22 }, { name: '伊豆長岡温泉', pref: 22 },
  { name: '白浜温泉', pref: 30 }, { name: '龍神温泉', pref: 30 }, { name: '川湯温泉', pref: 30 },
  { name: '皆生温泉', pref: 31 },
  { name: '玉造温泉', pref: 32 },
  { name: '湯原温泉', pref: 33 },
  { name: '道後温泉', pref: 38 },
  { name: '別府温泉', pref: 44 }, { name: '湯布院温泉', pref: 44 }, { name: '由布院温泉', pref: 44 },
  { name: '黒川温泉', pref: 43 }, { name: '人吉温泉', pref: 43 },
  { name: '雲仙温泉', pref: 42 }, { name: '小浜温泉', pref: 42 },
  { name: '指宿温泉', pref: 46 }, { name: '霧島温泉', pref: 46 },
]
const ONSEN_B = [
  { name: '十和田湖温泉', pref: 2 }, { name: '大鰐温泉', pref: 2 },
  { name: '花巻温泉', pref: 3 }, { name: '岩手湯本温泉', pref: 3 },
  { name: '磐梯熱海温泉', pref: 7 },
  { name: '城崎温泉', pref: 28 }, { name: '湯村温泉', pref: 28 },
  { name: '三朝温泉', pref: 31 }, { name: '奥津温泉', pref: 33 },
  { name: '湯田温泉', pref: 35 }, { name: '長門湯本温泉', pref: 35 },
  { name: '祖谷温泉', pref: 36 },
  { name: '奥道後温泉', pref: 38 }, { name: '松山温泉', pref: 38 },
  { name: '武雄温泉', pref: 41 }, { name: '嬉野温泉', pref: 41 },
  { name: '平戸温泉', pref: 42 },
  { name: '山鹿温泉', pref: 43 },
  { name: '別府八湯', pref: 44 }, { name: '筋湯温泉', pref: 44 },
  { name: 'えびの温泉', pref: 45 },
  { name: '妙見温泉', pref: 46 },
]

const onsen = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/onsen.json', 'utf-8'))
const onsenResult = onsen.map(s => {
  if (matchTier(s, ONSEN_S)) return { ...s, tier: 'S' }
  if (matchTier(s, ONSEN_A)) return { ...s, tier: 'A' }
  if (matchTier(s, ONSEN_B)) return { ...s, tier: 'B' }
  return { ...s, tier: 'C' }
})
const oc = { S: 0, A: 0, B: 0, C: 0 }; onsenResult.forEach(s => oc[s.tier]++)
console.log('温泉 tier:', JSON.stringify(oc))
console.log('S:', onsenResult.filter(s => s.tier === 'S').map(s => s.name))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/onsen.json', JSON.stringify(onsenResult, null, 2), 'utf-8')

// ─── 日本遺産 ────────────────────────────────────────────────────────
const HERITAGE_A_KEYWORDS = [
  '富士', '白川', '日光', '熊野', '高野', '吉野', '飛鳥', '琉球', '首里', '平泉',
  '石見銀山', '三内丸山', '五稜郭', '知床', '白神', '屋久', '小笠原', '厳島',
  '姫路', '法隆寺', '古都奈良', '古都京都', '紀伊山地', '中尊寺',
  '北前船', '炭鉱', '明治日本', '百舌鳥', '九州・山口',
  '田園景観', '荒神谷', '出雲国',
]

const heritage = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/japan-heritage.json', 'utf-8'))
const heritageResult = heritage.map(s => {
  if (s.prefecture_code === 0) return { ...s, tier: 'A' }
  if (HERITAGE_A_KEYWORDS.some(k => s.name.includes(k))) return { ...s, tier: 'A' }
  return { ...s, tier: 'B' }
})
const hc = { S: 0, A: 0, B: 0, C: 0 }; heritageResult.forEach(s => hc[s.tier]++)
console.log('日本遺産 tier:', JSON.stringify(hc))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/japan-heritage.json', JSON.stringify(heritageResult, null, 2), 'utf-8')

console.log('全カテゴリ保存完了')
