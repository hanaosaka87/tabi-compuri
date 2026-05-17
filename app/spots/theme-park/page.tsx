import SpotPage from '@/app/spots/SpotPage'
import themeParkData from '@/lib/spots/theme-park.json'

type Spot = { id: string; name: string; prefecture_code: number }

export default function ThemeParkPage() {
  return <SpotPage categoryId="theme-park" label="テーマパーク" icon="🎢" spots={themeParkData as Spot[]} />
}
