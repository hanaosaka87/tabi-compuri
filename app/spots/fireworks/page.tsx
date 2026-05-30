import SpotPage from '@/app/spots/SpotPage'
import fireworksData from '@/lib/spots/fireworks.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function FireworksPage() {
  return <SpotPage categoryId="fireworks" label="花火大会" icon="🎆" spots={fireworksData as Spot[]} />
}
