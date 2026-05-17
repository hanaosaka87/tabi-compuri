import SpotPage from '@/app/spots/SpotPage'
import amusementData from '@/lib/spots/amusement.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function AmusementPage() {
  return <SpotPage categoryId="amusement" label="遊園地" icon="🎡" spots={amusementData as Spot[]} />
}
