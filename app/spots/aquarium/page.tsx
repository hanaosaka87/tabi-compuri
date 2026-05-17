import SpotPage from '@/app/spots/SpotPage'
import aquariumData from '@/lib/spots/aquarium.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function AquariumPage() {
  return <SpotPage categoryId="aquarium" label="水族館" icon="🐠" spots={aquariumData as Spot[]} />
}
