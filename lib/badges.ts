import { PREFECTURES } from './prefectures'

export type Badge = {
  id: string
  emoji: string
  label: string
  description: string
  earned: boolean
}

const regionPrefectures = (region: string) =>
  PREFECTURES.filter((p) => p.region === region).map((p) => p.code)

export const calcBadges = (visitedCodes: Set<number>): Badge[] => {
  const count = visitedCodes.size

  const hasAll = (codes: number[]) => codes.every((c) => visitedCodes.has(c))

  return [
    {
      id: 'debut',
      emoji: '🎒',
      label: '旅デビュー',
      description: '初めての都道府県を記録',
      earned: count >= 1,
    },
    {
      id: 'local',
      emoji: '🚃',
      label: '普通列車',
      description: '10都道府県制覇',
      earned: count >= 10,
    },
    {
      id: 'bronze',
      emoji: '🥉',
      label: '急行ブロンズ',
      description: '20都道府県制覇',
      earned: count >= 20,
    },
    {
      id: 'silver',
      emoji: '🥈',
      label: '特急シルバー',
      description: '30都道府県制覇',
      earned: count >= 30,
    },
    {
      id: 'gold',
      emoji: '🥇',
      label: '新幹線ゴールド',
      description: '40都道府県制覇',
      earned: count >= 40,
    },
    {
      id: 'complete',
      emoji: '🏆',
      label: '全国制覇',
      description: '47都道府県すべて制覇',
      earned: count === 47,
    },
    {
      id: 'hokkaido',
      emoji: '🌿',
      label: '北海道マスター',
      description: '北海道を制覇',
      earned: hasAll(regionPrefectures('北海道')),
    },
    {
      id: 'tohoku',
      emoji: '❄️',
      label: '東北マスター',
      description: '東北6県をすべて制覇',
      earned: hasAll(regionPrefectures('東北')),
    },
    {
      id: 'kanto',
      emoji: '🌸',
      label: '関東マスター',
      description: '関東7県をすべて制覇',
      earned: hasAll(regionPrefectures('関東')),
    },
    {
      id: 'chubu',
      emoji: '🗻',
      label: '中部マスター',
      description: '中部9県をすべて制覇',
      earned: hasAll(regionPrefectures('中部')),
    },
    {
      id: 'kinki',
      emoji: '⛩️',
      label: '近畿マスター',
      description: '近畿7県をすべて制覇',
      earned: hasAll(regionPrefectures('近畿')),
    },
    {
      id: 'chugoku',
      emoji: '🌊',
      label: '中国マスター',
      description: '中国5県をすべて制覇',
      earned: hasAll(regionPrefectures('中国')),
    },
    {
      id: 'shikoku',
      emoji: '🍊',
      label: '四国マスター',
      description: '四国4県をすべて制覇',
      earned: hasAll(regionPrefectures('四国')),
    },
    {
      id: 'kyushu',
      emoji: '🌺',
      label: '九州マスター',
      description: '九州8県をすべて制覇',
      earned: hasAll(regionPrefectures('九州')),
    },
  ]
}
