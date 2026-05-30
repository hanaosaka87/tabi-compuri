import SpotPage from '@/app/spots/SpotPage'
import festivalData from '@/lib/spots/festival.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function FestivalPage() {
  return <SpotPage categoryId="festival" label="お祭り" icon="🏮" spots={festivalData as Spot[]} />
}
