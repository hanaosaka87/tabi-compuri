import SpotPage from '@/app/spots/SpotPage'
import shrineData from '@/lib/spots/shrine-temple.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function ShrinePage() {
  return <SpotPage categoryId="shrine" label="神社" icon="⛩️" spots={shrineData as Spot[]} />
}
