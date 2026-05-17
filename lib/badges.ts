import { PREFECTURES } from './prefectures'

export type Badge = {
  id: string
  emoji: string
  label: string
  description: string
  earned: boolean
  category: 'pref' | 'spot'
}

type SpotCounts = Record<string, number>

const regionPrefectures = (region: string) =>
  PREFECTURES.filter((p) => p.region === region).map((p) => p.code)

export const calcBadges = (visitedCodes: Set<number>, spotCounts: SpotCounts = {}): Badge[] => {
  const count = visitedCodes.size
  const hasAll = (codes: number[]) => codes.every((c) => visitedCodes.has(c))
  const spot = (id: string) => spotCounts[id] ?? 0
  const totalSpots = Object.values(spotCounts).reduce((a, b) => a + b, 0)

  return [
    // ── 都道府県制覇系 ──
    { id: 'debut',    emoji: '🎒', label: '旅デビュー',     description: '初めての都道府県を記録',      earned: count >= 1,  category: 'pref' },
    { id: 'local',    emoji: '🚃', label: '普通列車',        description: '10都道府県制覇',               earned: count >= 10, category: 'pref' },
    { id: 'bronze',   emoji: '🥉', label: '急行ブロンズ',    description: '20都道府県制覇',               earned: count >= 20, category: 'pref' },
    { id: 'silver',   emoji: '🥈', label: '特急シルバー',    description: '30都道府県制覇',               earned: count >= 30, category: 'pref' },
    { id: 'gold',     emoji: '🥇', label: '新幹線ゴールド',  description: '40都道府県制覇',               earned: count >= 40, category: 'pref' },
    { id: 'complete', emoji: '🏆', label: '全国制覇',        description: '47都道府県すべて制覇',         earned: count === 47, category: 'pref' },
    { id: 'hokkaido', emoji: '🌿', label: '北海道マスター',  description: '北海道を制覇',                 earned: hasAll(regionPrefectures('北海道')), category: 'pref' },
    { id: 'tohoku',   emoji: '❄️', label: '東北マスター',    description: '東北6県をすべて制覇',          earned: hasAll(regionPrefectures('東北')),   category: 'pref' },
    { id: 'kanto',    emoji: '🌸', label: '関東マスター',    description: '関東7県をすべて制覇',          earned: hasAll(regionPrefectures('関東')),   category: 'pref' },
    { id: 'chubu',    emoji: '🗻', label: '中部マスター',    description: '中部9県をすべて制覇',          earned: hasAll(regionPrefectures('中部')),   category: 'pref' },
    { id: 'kinki',    emoji: '⛩️', label: '近畿マスター',    description: '近畿7県をすべて制覇',          earned: hasAll(regionPrefectures('近畿')),   category: 'pref' },
    { id: 'chugoku',  emoji: '🌊', label: '中国マスター',    description: '中国5県をすべて制覇',          earned: hasAll(regionPrefectures('中国')),   category: 'pref' },
    { id: 'shikoku',  emoji: '🍊', label: '四国マスター',    description: '四国4県をすべて制覇',          earned: hasAll(regionPrefectures('四国')),   category: 'pref' },
    { id: 'kyushu',   emoji: '🌺', label: '九州マスター',    description: '九州8県をすべて制覇',          earned: hasAll(regionPrefectures('九州')),   category: 'pref' },

    // ── スポット総合 ──
    { id: 'spot-10',  emoji: '📍', label: 'スポット探索者',  description: 'スポットを10か所記録',         earned: totalSpots >= 10,  category: 'spot' },
    { id: 'spot-50',  emoji: '🗺️', label: 'スポットハンター', description: 'スポットを50か所記録',        earned: totalSpots >= 50,  category: 'spot' },
    { id: 'spot-100', emoji: '🌟', label: 'スポットマスター', description: 'スポットを100か所記録',       earned: totalSpots >= 100, category: 'spot' },
    { id: 'spot-500', emoji: '👑', label: 'スポット王',       description: 'スポットを500か所記録',       earned: totalSpots >= 500, category: 'spot' },

    // ── 世界遺産 ──
    { id: 'wh-1',     emoji: '🌍', label: '世界遺産探訪',    description: '世界遺産を1か所記録',          earned: spot('world-heritage') >= 1,  category: 'spot' },
    { id: 'wh-all',   emoji: '🌐', label: '世界遺産制覇',    description: '日本の世界遺産26か所をコンプリート', earned: spot('world-heritage') >= 26, category: 'spot' },

    // ── 国立公園 ──
    { id: 'np-1',     emoji: '🏔️', label: '国立公園デビュー', description: '国立公園を1か所記録',         earned: spot('national-park') >= 1,  category: 'spot' },
    { id: 'np-all',   emoji: '🏞️', label: '国立公園制覇',    description: '全国34か所の国立公園を制覇',  earned: spot('national-park') >= 34, category: 'spot' },

    // ── お城 ──
    { id: 'castle-5',  emoji: '🏯', label: 'お城めぐり',     description: 'お城を5か所記録',              earned: spot('castle') >= 5,   category: 'spot' },
    { id: 'castle-50', emoji: '⚔️', label: '城主',           description: 'お城を50か所記録',             earned: spot('castle') >= 50,  category: 'spot' },

    // ── 温泉 ──
    { id: 'onsen-5',  emoji: '♨️', label: '温泉好き',        description: '温泉を5か所記録',              earned: spot('onsen') >= 5,   category: 'spot' },
    { id: 'onsen-30', emoji: '🛁', label: '湯めぐり達人',    description: '温泉を30か所記録',             earned: spot('onsen') >= 30,  category: 'spot' },

    // ── 道の駅 ──
    { id: 'michi-10', emoji: '🚗', label: '道の駅スタンプラリー', description: '道の駅を10か所記録',    earned: spot('michi-no-eki') >= 10,  category: 'spot' },
    { id: 'michi-50', emoji: '🛣️', label: '道の駅マスター', description: '道の駅を50か所記録',           earned: spot('michi-no-eki') >= 50,  category: 'spot' },

    // ── 動物園・水族館 ──
    { id: 'zoo-5',    emoji: '🦁', label: '動物好き',        description: '動物園を5か所記録',            earned: spot('zoo') >= 5,       category: 'spot' },
    { id: 'aqua-5',   emoji: '🐠', label: '水族館好き',      description: '水族館を5か所記録',            earned: spot('aquarium') >= 5,  category: 'spot' },

    // ── 神社 ──
    { id: 'shrine-10', emoji: '⛩️', label: '参拝者',         description: '神社を10か所記録',             earned: spot('shrine') >= 10,  category: 'spot' },
  ]
}
