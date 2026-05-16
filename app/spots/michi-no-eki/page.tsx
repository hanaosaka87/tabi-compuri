import SpotPage from '@/app/spots/SpotPage'
import michiNoEkiData from '@/lib/spots/michi-no-eki.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function MichiNoEkiPage() {
  return <SpotPage categoryId="michi-no-eki" label="道の駅" icon="🚗" spots={michiNoEkiData as Spot[]} />
}
