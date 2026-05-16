import SpotPage from '@/app/spots/SpotPage'
import castleData from '@/lib/spots/castle.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function CastlePage() {
  return <SpotPage categoryId="castle" label="お城" icon="🏯" spots={castleData as Spot[]} />
}
