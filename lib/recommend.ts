type Rec = { prefecture: string; code: number; reason: string; emoji: string }

// 都道府県の特徴
const PREF_INFO: Record<number, { name: string; emoji: string; tags: string[] }> = {
  1:  { name:'北海道',   emoji:'🦌', tags:['自然','グルメ','温泉'] },
  2:  { name:'青森県',   emoji:'🍎', tags:['グルメ','ねぶた','自然'] },
  3:  { name:'岩手県',   emoji:'🏯', tags:['世界遺産','自然','温泉'] },
  4:  { name:'宮城県',   emoji:'🦞', tags:['グルメ','歴史','温泉'] },
  5:  { name:'秋田県',   emoji:'🌾', tags:['温泉','自然','グルメ'] },
  6:  { name:'山形県',   emoji:'🍒', tags:['温泉','グルメ','自然'] },
  7:  { name:'福島県',   emoji:'🍑', tags:['温泉','自然','グルメ'] },
  8:  { name:'茨城県',   emoji:'🌊', tags:['自然','グルメ','歴史'] },
  9:  { name:'栃木県',   emoji:'🏯', tags:['世界遺産','温泉','自然'] },
  10: { name:'群馬県',   emoji:'♨️', tags:['温泉','自然','グルメ'] },
  11: { name:'埼玉県',   emoji:'🎎', tags:['歴史','グルメ','観光'] },
  12: { name:'千葉県',   emoji:'🌸', tags:['テーマパーク','グルメ','自然'] },
  13: { name:'東京都',   emoji:'🗼', tags:['グルメ','観光','歴史'] },
  14: { name:'神奈川県', emoji:'🗻', tags:['観光','グルメ','歴史'] },
  15: { name:'新潟県',   emoji:'🍚', tags:['グルメ','温泉','自然'] },
  16: { name:'富山県',   emoji:'🦀', tags:['グルメ','自然','温泉'] },
  17: { name:'石川県',   emoji:'🦞', tags:['グルメ','歴史','温泉'] },
  18: { name:'福井県',   emoji:'🦖', tags:['世界遺産','自然','グルメ'] },
  19: { name:'山梨県',   emoji:'🍇', tags:['自然','グルメ','温泉'] },
  20: { name:'長野県',   emoji:'🏔️', tags:['自然','温泉','グルメ'] },
  21: { name:'岐阜県',   emoji:'🏯', tags:['世界遺産','歴史','自然'] },
  22: { name:'静岡県',   emoji:'🗻', tags:['自然','グルメ','温泉'] },
  23: { name:'愛知県',   emoji:'🏯', tags:['歴史','グルメ','観光'] },
  24: { name:'三重県',   emoji:'⛩️', tags:['世界遺産','グルメ','自然'] },
  25: { name:'滋賀県',   emoji:'🏯', tags:['歴史','自然','観光'] },
  26: { name:'京都府',   emoji:'⛩️', tags:['歴史','世界遺産','グルメ'] },
  27: { name:'大阪府',   emoji:'🦭', tags:['グルメ','歴史','観光'] },
  28: { name:'兵庫県',   emoji:'🏯', tags:['歴史','グルメ','自然'] },
  29: { name:'奈良県',   emoji:'🦌', tags:['歴史','世界遺産','自然'] },
  30: { name:'和歌山県', emoji:'🌊', tags:['世界遺産','自然','温泉'] },
  31: { name:'鳥取県',   emoji:'🏜️', tags:['自然','グルメ','温泉'] },
  32: { name:'島根県',   emoji:'⛩️', tags:['歴史','世界遺産','自然'] },
  33: { name:'岡山県',   emoji:'🍑', tags:['グルメ','歴史','自然'] },
  34: { name:'広島県',   emoji:'⛩️', tags:['歴史','世界遺産','グルメ'] },
  35: { name:'山口県',   emoji:'⛩️', tags:['歴史','自然','観光'] },
  36: { name:'徳島県',   emoji:'💃', tags:['祭り','自然','グルメ'] },
  37: { name:'香川県',   emoji:'🍜', tags:['グルメ','歴史','自然'] },
  38: { name:'愛媛県',   emoji:'🍊', tags:['グルメ','温泉','歴史'] },
  39: { name:'高知県',   emoji:'🐟', tags:['グルメ','自然','歴史'] },
  40: { name:'福岡県',   emoji:'🍜', tags:['グルメ','歴史','観光'] },
  41: { name:'佐賀県',   emoji:'🏯', tags:['歴史','グルメ','自然'] },
  42: { name:'長崎県',   emoji:'⛪', tags:['歴史','グルメ','観光'] },
  43: { name:'熊本県',   emoji:'🏯', tags:['歴史','グルメ','自然'] },
  44: { name:'大分県',   emoji:'♨️', tags:['温泉','グルメ','自然'] },
  45: { name:'宮崎県',   emoji:'🌴', tags:['自然','グルメ','観光'] },
  46: { name:'鹿児島県', emoji:'🌋', tags:['自然','グルメ','温泉'] },
  47: { name:'沖縄県',   emoji:'🌺', tags:['自然','グルメ','観光'] },
}

// 地方グループ
const REGIONS: number[][] = [
  [1],                          // 北海道
  [2,3,4,5,6,7],               // 東北
  [8,9,10,11,12,13,14],        // 関東
  [15,16,17,18,19,20,21,22,23], // 中部
  [24,25,26,27,28,29,30],      // 近畿
  [31,32,33,34,35],            // 中国
  [36,37,38,39],               // 四国
  [40,41,42,43,44,45,46,47],   // 九州・沖縄
]

// 隣接都道府県
const ADJACENT: Record<number, number[]> = {
  1:[2],2:[1,3,5],3:[2,4,5,6],4:[3,5,6,7],5:[2,3,4,6],6:[3,4,5,7],7:[4,6,8,9,10,15],
  8:[7,9,11,12],9:[7,8,10,11],10:[7,9,11,15,20],11:[8,9,10,12,13,14,19],12:[8,11,13],
  13:[11,12,14,19],14:[11,13,19,22],15:[7,10,16,20],16:[15,17,20,21],17:[16,18,21],
  18:[17,21,25,26],19:[11,13,14,20,22],20:[10,15,16,19,21,22,23],21:[16,17,18,20,22,23,24,25],
  22:[14,19,20,21,23],23:[20,21,22,24],24:[21,23,25,26,27,29],25:[18,21,24,26,29],
  26:[18,24,25,27,28,29],27:[24,26,28,29,30],28:[26,27,29,30,31,33],
  29:[24,25,26,27,28,30],30:[24,27,28,29],31:[28,32,33,35],32:[31,33,34,35],
  33:[28,31,32,34,37],34:[32,33,35,38],35:[31,32,34],36:[37,38,39],37:[33,36,38],
  38:[32,34,36,37,39],39:[36,37,38],40:[35,41,42,43,44],41:[40,42],42:[40,41],
  43:[40,44,45,46],44:[40,43,45],45:[43,44,46],46:[43,45],47:[],
}

function buildReason(code: number, isAdjacent: boolean, regionProgress: number): string {
  const info = PREF_INFO[code]
  if (!info) return 'おすすめのスポット'
  const tag = info.tags[0]
  if (isAdjacent) return `隣の県！${tag}も楽しめる`
  if (regionProgress > 0.5) return `この地方あと少しで制覇！`
  if (tag === '世界遺産') return '世界遺産がある注目スポット'
  if (tag === '温泉') return '名湯が多い温泉の名所'
  if (tag === 'グルメ') return 'ご当地グルメが絶品'
  if (tag === '歴史') return '歴史・城めぐりに最適'
  if (tag === '自然') return '大自然を満喫できる'
  return 'まだ未訪問のおすすめ地域'
}

export function getRecommendations(visitedCodes: number[]): Rec[] {
  const visited = new Set(visitedCodes)
  const unvisited = Object.keys(PREF_INFO)
    .map(Number)
    .filter((c) => !visited.has(c))

  if (unvisited.length === 0) return []

  // スコアリング
  const scored = unvisited.map((code) => {
    let score = 0
    const isAdjacent = (ADJACENT[code] ?? []).some((n) => visited.has(n))
    if (isAdjacent) score += 30

    const region = REGIONS.find((r) => r.includes(code)) ?? []
    const visitedInRegion = region.filter((c) => visited.has(c)).length
    const regionProgress = region.length > 0 ? visitedInRegion / region.length : 0
    if (regionProgress > 0 && regionProgress < 1) score += Math.round(regionProgress * 20)

    // 世界遺産ボーナス
    if (PREF_INFO[code]?.tags.includes('世界遺産')) score += 5

    // ランダム性（毎回少し変わる）
    score += Math.random() * 10

    return { code, score, isAdjacent, regionProgress }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map(({ code, isAdjacent, regionProgress }) => {
    const info = PREF_INFO[code]
    return {
      code,
      prefecture: info.name,
      emoji: info.emoji,
      reason: buildReason(code, isAdjacent, regionProgress),
    }
  })
}
