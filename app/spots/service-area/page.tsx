import SpotPage from '@/app/spots/SpotPage'
import serviceAreaData from '@/lib/spots/service-area.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function ServiceAreaPage() {
  return <SpotPage categoryId="service-area" label="サービスエリア" icon="⛽" spots={serviceAreaData as Spot[]} />
}
