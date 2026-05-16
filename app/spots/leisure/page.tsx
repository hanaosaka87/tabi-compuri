import SpotPage from '@/app/spots/SpotPage'
import leisureData from '@/lib/spots/leisure.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function LeisurePage() {
  return <SpotPage categoryId="leisure" label="遊園地・テーマパーク" icon="🎡" spots={leisureData as Spot[]} />
}
