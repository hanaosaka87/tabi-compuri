import SpotPage from '@/app/spots/SpotPage'
import nationalParkData from '@/lib/spots/national-park.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function NationalParkPage() {
  return <SpotPage categoryId="national-park" label="国立公園" icon="🏔️" spots={nationalParkData as Spot[]} />
}
