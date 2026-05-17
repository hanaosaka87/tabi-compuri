import SpotPage from '@/app/spots/SpotPage'
import zooData from '@/lib/spots/zoo.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function ZooPage() {
  return <SpotPage categoryId="zoo" label="動物園" icon="🦁" spots={zooData as Spot[]} />
}
