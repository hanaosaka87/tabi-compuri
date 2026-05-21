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
]

export const getCategoryById = (id: string) =>
  SPOT_CATEGORIES.find((c) => c.id === id)

export type SpotData = { id: string; name: string; prefecture_code: number }

export async function loadSpotData(jsonFile: string): Promise<SpotData[]> {
  const data = await import(`@/lib/spots/${jsonFile}.json`)
  return data.default as SpotData[]
}
