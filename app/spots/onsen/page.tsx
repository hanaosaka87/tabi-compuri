import SpotPage from '@/app/spots/SpotPage'
import onsenData from '@/lib/spots/onsen.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function OnsenPage() {
  return <SpotPage categoryId="onsen" label="温泉" icon="♨️" spots={onsenData as Spot[]} />
}
