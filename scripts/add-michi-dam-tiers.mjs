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

// ─── 道の駅 ────────────────────────────────────────────────────────────
const MICHI_S = [
  // 道の駅グランプリ上位・観光地化・メディア露出
  { name: '流氷街道網走', pref: 1 }, { name: 'しかべ間歇泉公園', pref: 1 },
  { name: 'なかさつない', pref: 1 }, { name: '摩周温泉', pref: 1 },
  { name: 'とわだ', pref: 2 }, { name: '奥入瀬', pref: 2 },
  { name: '三陸', pref: 3 },
  { name: 'あ・ら・伊達な道の駅', pref: 4 },
  { name: '象潟', pref: 5 }, { name: '十文字', pref: 5 },
  { name: '庄内みかわ', pref: 6 },
  { name: 'ばんだい', pref: 7 },
  { name: '常陸大宮', pref: 8 },
  { name: 'にしかた', pref: 9 },
  { name: '富士川楽座', pref: 22 }, { name: '朝霧高原', pref: 22 },
  { name: '伊豆ゲートウェイ函南', pref: 22 },
  { name: '大王わさび農場', pref: 20 }, { name: '信州新野千石平', pref: 20 },
  { name: '飛騨古川', pref: 21 }, { name: '奥飛騨温泉郷上宝', pref: 21 },
  { name: 'すばしり', pref: 22 },
  { name: 'しもきた', pref: 2 },
  { name: 'おかべ', pref: 11 },
  { name: '龍神', pref: 30 }, { name: '熊野・板屋九郎兵衛の里', pref: 24 },
  { name: '宍道湖しんじ湖温泉', pref: 32 }, { name: '奥大山', pref: 31 },
  { name: '舞鶴港とれとれセンター', pref: 26 },
  { name: '阿蘇', pref: 43 }, { name: '波野', pref: 43 },
  { name: '佐多岬', pref: 46 },
]

const MICHI_A = [
  // 各都道府県の人気上位
  { name: '三笠', pref: 1 }, { name: 'あびら', pref: 1 }, { name: '花ロードえにわ', pref: 1 },
  { name: 'しらぬか恋問', pref: 1 }, { name: 'むかわ四季の館', pref: 1 },
  { name: '南三陸', pref: 4 }, { name: '大谷海岸', pref: 4 },
  { name: '種山ヶ原', pref: 3 }, { name: '遠野風の丘', pref: 3 },
  { name: '二ツ井', pref: 5 }, { name: '大館能代空港', pref: 5 },
  { name: '庄内あさひ', pref: 6 }, { name: '月山', pref: 6 },
  { name: 'つるた', pref: 2 }, { name: '虹の湖', pref: 2 },
  { name: 'たじま', pref: 7 }, { name: '喜多の郷', pref: 7 },
  { name: 'まくらがの里こが', pref: 8 }, { name: '日立おさかなセンター', pref: 8 },
  { name: 'にしかた', pref: 9 }, { name: '思川', pref: 9 },
  { name: '箱根峠', pref: 14 }, { name: '足柄', pref: 14 },
  { name: '南魚沼', pref: 15 }, { name: '良寛の里わしま', pref: 15 },
  { name: '細入', pref: 16 }, { name: 'ウェーブパークなめりかわ', pref: 16 },
  { name: '輪島', pref: 17 }, { name: '千枚田ポケットパーク', pref: 17 },
  { name: '河野', pref: 18 }, { name: '越前', pref: 18 },
  { name: '富士吉田', pref: 19 }, { name: 'なるさわ', pref: 19 },
  { name: '木曽福島', pref: 20 }, { name: '平谷', pref: 20 },
  { name: '日義木曽駒高原', pref: 20 },
  { name: 'クレール平田', pref: 21 }, { name: '茶の里野原', pref: 21 },
  { name: '宇津ノ谷峠', pref: 22 }, { name: '天城越え', pref: 22 },
  { name: '特産物直売所豊根グリーンポート宮嶋', pref: 23 },
  { name: '伊勢志摩', pref: 24 }, { name: 'パーク七里御浜', pref: 24 },
  { name: '塩津海道あぢかまの里', pref: 25 }, { name: '妹子の郷', pref: 25 },
  { name: '美山ふれあい広場', pref: 26 }, { name: '丹後王国', pref: 26 },
  { name: '淡路', pref: 28 }, { name: '但馬のまほろば', pref: 28 },
  { name: '葛城高原ロッジ', pref: 29 }, { name: 'たかの', pref: 29 },
  { name: '根来さくらの里', pref: 30 }, { name: '椿はなの湯', pref: 30 },
  { name: '大山', pref: 31 }, { name: 'ポート赤碕', pref: 31 },
  { name: 'キラリ多伎', pref: 32 }, { name: '仁摩サンドミュージアム', pref: 32 },
  { name: '蒜山高原', pref: 33 }, { name: '笠岡ベイファーム', pref: 33 },
  { name: 'クロスロードみつぎ', pref: 34 }, { name: '田原本', pref: 34 },
  { name: '萩往還', pref: 35 }, { name: 'ソレーネ周南', pref: 35 },
  { name: '温泉の里神山', pref: 36 }, { name: '貞光ゆうゆう館', pref: 36 },
  { name: 'ことなみ', pref: 37 }, { name: '小豆島オリーブ公園', pref: 37 },
  { name: '今治湯ノ浦温泉', pref: 38 }, { name: '内子フレッシュパークからり', pref: 38 },
  { name: '大月', pref: 39 }, { name: 'あぐり窪川', pref: 39 },
  { name: '小石原', pref: 40 }, { name: '原鶴', pref: 40 },
  { name: '鹿島', pref: 41 }, { name: '伊万里', pref: 41 },
  { name: '夕陽が丘そとめ', pref: 42 }, { name: '川棚の杜', pref: 42 },
  { name: '鯛生金山', pref: 44 }, { name: 'ゆふいん', pref: 44 },
  { name: '高千穂', pref: 45 }, { name: 'フェニックス', pref: 45 },
  { name: '指宿', pref: 46 }, { name: 'たるみず', pref: 46 },
  { name: 'かでな', pref: 47 }, { name: '糸満', pref: 47 },
]

// ─── ダム ────────────────────────────────────────────────────────────
const DAM_S = [
  // 日本を代表する有名ダム・観光ダム
  { name: '黒部ダム', pref: 16 },         // 日本最高の重力式アーチダム
  { name: '宮ヶ瀬ダム', pref: 14 },       // 首都圏最大
  { name: '奥只見ダム', pref: 7 },        // 有効貯水量日本一
  { name: '田子倉ダム', pref: 7 },
  { name: '矢木沢ダム', pref: 10 },
  { name: '奈良俣ダム', pref: 10 },
  { name: '浦山ダム', pref: 11 },
  { name: '徳山ダム', pref: 21 },         // 総貯水量日本一
  { name: '御母衣ダム', pref: 21 },       // ロックフィルダム日本一
  { name: '早明浦ダム', pref: 39 },       // 四国の水がめ
  { name: '池原ダム', pref: 29 },
  { name: '七色ダム', pref: 30 },
  { name: '二瀬ダム', pref: 11 },
  { name: '奈川渡ダム', pref: 20 },
  { name: '高瀬ダム', pref: 20 },         // 日本最高の重力式コンクリートダム
]

const DAM_A = [
  { name: '旭川ダム', pref: 33 }, { name: '苫田ダム', pref: 33 },
  { name: '温井ダム', pref: 34 }, { name: '弥栄ダム', pref: 34 },
  { name: '島地川ダム', pref: 35 },
  { name: '椹野川', pref: 35 },
  { name: '三成ダム', pref: 32 }, { name: '志津見ダム', pref: 32 },
  { name: '布部ダム', pref: 1 }, { name: '桂沢ダム', pref: 1 },
  { name: '大雪ダム', pref: 1 },
  { name: '岩洞ダム', pref: 3 }, { name: '石淵ダム', pref: 3 },
  { name: '鳴子ダム', pref: 4 },
  { name: '玉川ダム', pref: 5 },
  { name: '寒河江ダム', pref: 6 },
  { name: '摺上川ダム', pref: 7 },
  { name: '藤井川ダム', pref: 8 }, { name: '高柴ダム', pref: 8 },
  { name: '塩原ダム', pref: 9 }, { name: '五十里ダム', pref: 9 },
  { name: '相俣ダム', pref: 10 },
  { name: '荒川ダム', pref: 11 },
  { name: '亀山ダム', pref: 12 },
  { name: '城山ダム', pref: 14 }, { name: '津久井湖', pref: 14 },
  { name: '大倉ダム', pref: 4 },
  { name: 'ダム湖', pref: 20 }, { name: '牧尾ダム', pref: 20 },
  { name: '阿木川ダム', pref: 21 },
  { name: '横山ダム', pref: 21 },
  { name: '佐久間ダム', pref: 22 }, { name: '秋葉ダム', pref: 22 },
  { name: '宮川ダム', pref: 24 },
  { name: '青蓮寺ダム', pref: 24 },
  { name: '天ヶ瀬ダム', pref: 26 },
  { name: '大野ダム', pref: 26 },
  { name: '布目ダム', pref: 29 },
  { name: '高野ダム', pref: 30 },
  { name: '殿ダム', pref: 31 },
  { name: '土師ダム', pref: 34 },
  { name: '三滝ダム', pref: 34 },
  { name: '横瀬ダム', pref: 38 },
  { name: '野村ダム', pref: 38 },
  { name: '合川ダム', pref: 39 },
  { name: '山鳥坂ダム', pref: 38 },
  { name: '三成ダム', pref: 32 },
  { name: '国東', pref: 44 },
  { name: '大渡ダム', pref: 39 },
]

function applyTiers(data, tierS, tierA) {
  return data.map(item => {
    if (matchTier(item, tierS)) return { ...item, tier: 'S' }
    if (matchTier(item, tierA)) return { ...item, tier: 'A' }
    return { ...item, tier: 'C' }
  })
}

// 道の駅
const michi = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/michi-no-eki.json', 'utf-8'))
const michiResult = michi.map(s => {
  if (matchTier(s, MICHI_S)) return { ...s, tier: 'S' }
  if (matchTier(s, MICHI_A)) return { ...s, tier: 'A' }
  return { ...s, tier: 'C' }
})
const mc = { S: 0, A: 0, B: 0, C: 0 }; michiResult.forEach(s => mc[s.tier]++)
console.log('道の駅 tier:', JSON.stringify(mc))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/michi-no-eki.json', JSON.stringify(michiResult, null, 2), 'utf-8')

// ダム
const dam = JSON.parse(readFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/dam.json', 'utf-8'))
const damResult = dam.map(s => {
  if (matchTier(s, DAM_S)) return { ...s, tier: 'S' }
  if (matchTier(s, DAM_A)) return { ...s, tier: 'A' }
  return { ...s, tier: 'C' }
})
const dc = { S: 0, A: 0, B: 0, C: 0 }; damResult.forEach(s => dc[s.tier]++)
console.log('ダム tier:', JSON.stringify(dc))
console.log('S:', damResult.filter(s => s.tier === 'S').map(s => s.name))
writeFileSync('C:/Users/info/dev/tabi-compuri/lib/spots/dam.json', JSON.stringify(damResult, null, 2), 'utf-8')

console.log('道の駅・ダム 保存完了')
