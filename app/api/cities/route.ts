import { NextRequest, NextResponse } from 'next/server'
import { getPrefectureFullName } from '@/lib/prefectures'

export async function GET(req: NextRequest) {
  const pref = req.nextUrl.searchParams.get('pref')
  if (!pref) return NextResponse.json({ error: 'pref is required' }, { status: 400 })

  const prefName = getPrefectureFullName(Number(pref))
  if (!prefName) return NextResponse.json([], { status: 400 })

  try {
    const res = await fetch(
      `https://geoapi.heartrails.com/api/json?method=getCities&prefecture=${encodeURIComponent(prefName)}`,
      { next: { revalidate: 86400 } }
    )
    const json = await res.json()
    const cities = (json?.response?.location ?? []).map(
      (item: { city: string }) => ({
        id: `${pref}_${item.city}`,
        name: item.city,
      })
    )
    return NextResponse.json(cities)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
