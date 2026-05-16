import SpotPage from '@/app/spots/SpotPage'
import heritageData from '@/lib/spots/japan-heritage.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function JapanHeritagePage() {
  return <SpotPage categoryId="japan-heritage" label="日本遺産" icon="🏛️" spots={heritageData as Spot[]} />
}
