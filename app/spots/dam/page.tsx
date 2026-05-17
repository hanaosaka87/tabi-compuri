import SpotPage from '@/app/spots/SpotPage'
import damData from '@/lib/spots/dam.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function DamPage() {
  return <SpotPage categoryId="dam" label="ダム" icon="🏞️" spots={damData as Spot[]} />
}
