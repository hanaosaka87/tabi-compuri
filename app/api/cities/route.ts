import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const pref = req.nextUrl.searchParams.get('pref')
  if (!pref) return NextResponse.json({ error: 'pref is required' }, { status: 400 })

  const code = String(pref).padStart(2, '0')
  try {
    const res = await fetch(
      `https://www.land.mlit.go.jp/webland/api/CitySearch?area=${code}`,
      { next: { revalidate: 86400 } }
    )
    const json = await res.json()
    return NextResponse.json(json.data ?? [])
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
