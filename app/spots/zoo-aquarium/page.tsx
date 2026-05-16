import SpotPage from '@/app/spots/SpotPage'
import zooAqData from '@/lib/spots/zoo-aquarium.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function ZooAquariumPage() {
  return <SpotPage categoryId="zoo-aquarium" label="動物園・水族館" icon="🦁" spots={zooAqData as Spot[]} />
}
