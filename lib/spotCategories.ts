import onsenData from './spots/onsen.json'
import castleData from './spots/castle.json'
import michiNoEkiData from './spots/michi-no-eki.json'
import serviceAreaData from './spots/service-area.json'
import shrineTempleData from './spots/shrine-temple.json'
import japanHeritageData from './spots/japan-heritage.json'
import damData from './spots/dam.json'
import leisureData from './spots/leisure.json'
import zooAquariumData from './spots/zoo-aquarium.json'
import worldHeritageData from './spots/world-heritage.json'
import nationalParkData from './spots/national-park.json'
import themeParkData from './spots/theme-park.json'
import amusementData from './spots/amusement.json'
import zooData from './spots/zoo.json'
import aquariumData from './spots/aquarium.json'
import superSentoData from './spots/super-sento.json'
import gameCenterData from './spots/game-center.json'

export type SpotCategory = {
  id: string
  label: string
  icon: string
  jsonFile: string
}

export const SPOT_CATEGORIES: SpotCategory[] = [
  { id: 'onsen',         label: '温泉',          icon: '♨️',  jsonFile: 'onsen' },
  { id: 'castle',        label: 'お城',          icon: '🏯',  jsonFile: 'castle' },
  { id: 'michi-no-eki',  label: '道の駅',        icon: '🛣️', jsonFile: 'michi-no-eki' },
  { id: 'service-area',  label: 'サービスエリア', icon: '⛽',  jsonFile: 'service-area' },
  { id: 'shrine',        label: '神社',          icon: '⛩️', jsonFile: 'shrine-temple' },
  { id: 'japan-heritage',label: '日本遺産',      icon: '🏛️', jsonFile: 'japan-heritage' },
  { id: 'dam',           label: 'ダム',          icon: '🏞️', jsonFile: 'dam' },
  { id: 'leisure',       label: '遊園地',        icon: '🎢',  jsonFile: 'leisure' },
  { id: 'zoo-aquarium',  label: '動物園・水族館', icon: '🐼',  jsonFile: 'zoo-aquarium' },
  { id: 'world-heritage',label: '世界遺産',      icon: '🌍',  jsonFile: 'world-heritage' },
  { id: 'national-park', label: '国立公園',      icon: '🏔️', jsonFile: 'national-park' },
  { id: 'theme-park',    label: 'テーマパーク',   icon: '🎠',  jsonFile: 'theme-park' },
  { id: 'amusement',     label: '遊園地(旧)',    icon: '🎡',  jsonFile: 'amusement' },
  { id: 'zoo',           label: '動物園',        icon: '🦁',  jsonFile: 'zoo' },
  { id: 'aquarium',      label: '水族館',        icon: '🐠',  jsonFile: 'aquarium' },
  { id: 'super-sento',   label: 'スーパー銭湯',  icon: '🛁',  jsonFile: 'super-sento' },
  { id: 'festival',      label: 'お祭り',        icon: '🏮',  jsonFile: 'festival' },
  { id: 'fireworks',     label: '花火大会',      icon: '🎆',  jsonFile: 'fireworks' },
  { id: 'game-center',   label: 'ゲームセンター', icon: '🕹️',  jsonFile: 'game-center' },
]

export const getCategoryById = (id: string) =>
  SPOT_CATEGORIES.find((c) => c.id === id)

export type SpotData = { id: string; name: string; prefecture_code: number }

// festival・fireworksはSupabase（events テーブル）由来のためここには含めない
const JSON_DATA_BY_FILE: Record<string, SpotData[]> = {
  onsen: onsenData as SpotData[],
  castle: castleData as SpotData[],
  'michi-no-eki': michiNoEkiData as SpotData[],
  'service-area': serviceAreaData as SpotData[],
  'shrine-temple': shrineTempleData as SpotData[],
  'japan-heritage': japanHeritageData as SpotData[],
  dam: damData as SpotData[],
  leisure: leisureData as SpotData[],
  'zoo-aquarium': zooAquariumData as SpotData[],
  'world-heritage': worldHeritageData as SpotData[],
  'national-park': nationalParkData as SpotData[],
  'theme-park': themeParkData as SpotData[],
  amusement: amusementData as SpotData[],
  zoo: zooData as SpotData[],
  aquarium: aquariumData as SpotData[],
  'super-sento': superSentoData as SpotData[],
  'game-center': gameCenterData as SpotData[],
}

// サーバー専用（スポット詳細ページのgenerateStaticParams/サーバーコンポーネントから使用）。
// 静的importで既にビルド済みJSのためネットワーク取得は発生しない。クライアントコンポーネントから呼ばないこと。
export function getSpotData(jsonFile: string): SpotData[] {
  return JSON_DATA_BY_FILE[jsonFile] ?? []
}

export function getAllJsonBackedParams(): { category: string; id: string }[] {
  const params: { category: string; id: string }[] = []
  for (const cat of SPOT_CATEGORIES) {
    const data = JSON_DATA_BY_FILE[cat.jsonFile]
    if (!data) continue
    for (const spot of data) {
      params.push({ category: cat.id, id: spot.id })
    }
  }
  return params
}
