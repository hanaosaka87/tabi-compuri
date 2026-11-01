import { writeFileSync } from 'fs'

// 47都道府県のおおよその中心座標（最寄り県判定用の簡易ヒューリスティック）
const PREF_CENTROIDS = [
  { code: 1, lat: 43.42, lon: 142.86 }, { code: 2, lat: 40.68, lon: 140.87 },
  { code: 3, lat: 39.70, lon: 141.15 }, { code: 4, lat: 38.44, lon: 141.00 },
  { code: 5, lat: 39.67, lon: 140.30 }, { code: 6, lat: 38.44, lon: 140.10 },
  { code: 7, lat: 37.42, lon: 140.30 }, { code: 8, lat: 36.25, lon: 140.30 },
  { code: 9, lat: 36.60, lon: 139.80 }, { code: 10, lat: 36.50, lon: 139.00 },
  { code: 11, lat: 35.90, lon: 139.30 }, { code: 12, lat: 35.55, lon: 140.20 },
  { code: 13, lat: 35.68, lon: 139.65 }, { code: 14, lat: 35.35, lon: 139.35 },
  { code: 15, lat: 37.55, lon: 138.90 }, { code: 16, lat: 36.65, lon: 137.20 },
  { code: 17, lat: 36.70, lon: 136.80 }, { code: 18, lat: 36.00, lon: 136.20 },
  { code: 19, lat: 35.60, lon: 138.55 }, { code: 20, lat: 36.30, lon: 138.10 },
  { code: 21, lat: 35.60, lon: 137.00 }, { code: 22, lat: 34.90, lon: 138.10 },
  { code: 23, lat: 35.10, lon: 137.00 }, { code: 24, lat: 34.55, lon: 136.40 },
  { code: 25, lat: 35.15, lon: 136.10 }, { code: 26, lat: 35.10, lon: 135.55 },
  { code: 27, lat: 34.60, lon: 135.50 }, { code: 28, lat: 34.90, lon: 134.80 },
  { code: 29, lat: 34.55, lon: 135.80 }, { code: 30, lat: 33.95, lon: 135.50 },
  { code: 31, lat: 35.40, lon: 133.90 }, { code: 32, lat: 35.15, lon: 132.80 },
  { code: 33, lat: 34.80, lon: 133.80 }, { code: 34, lat: 34.55, lon: 132.75 },
  { code: 35, lat: 34.20, lon: 131.60 }, { code: 36, lat: 34.00, lon: 134.40 },
  { code: 37, lat: 34.30, lon: 134.00 }, { code: 38, lat: 33.75, lon: 132.75 },
  { code: 39, lat: 33.55, lon: 133.35 }, { code: 40, lat: 33.55, lon: 130.55 },
  { code: 41, lat: 33.30, lon: 130.10 }, { code: 42, lat: 33.00, lon: 129.85 },
  { code: 43, lat: 32.65, lon: 130.75 }, { code: 44, lat: 33.15, lon: 131.55 },
  { code: 45, lat: 32.00, lon: 131.30 }, { code: 46, lat: 31.30, lon: 130.55 },
  { code: 47, lat: 26.30, lon: 127.85 },
]

function nearestPref(lat, lon) {
  let best = null, bestD = Infinity
  for (const p of PREF_CENTROIDS) {
    const d = (p.lat - lat) ** 2 + (p.lon - lon) ** 2
    if (d < bestD) { bestD = d; best = p.code }
  }
  return best
}

const CHAIN_PATTERNS = [
  /GiGO|ギーゴ/i, /ラウンドワン|ROUND\s*1|ROUND1/i, /タイトーステーション|TAITO STATION/i,
  /namco|ナムコ/i, /アドアーズ|ADORES/i, /モーリーファンタジー|MOLLY FANTASY/i,
  /アミパラ|AMI\s*PARA/i, /回遊館/i, /ゲームパニック/i, /ジョイポリス/i,
]

function tierFor(name) {
  return CHAIN_PATTERNS.some(re => re.test(name)) ? 'S' : 'C'
}

// OSM側で leisure=amusement_arcade が誤ってパチンコ・カラオケ等に付与されているケースがあり、
// ユーザーから「ゲームセンター一覧に違う店舗がある」と報告があったため除外する（2026-09-22）。
const EXCLUDE_PATTERNS = [
  /パチンコ|スロット|パーラー/i,
  /カラオケ|KARAOKE/i,
  /ボウリング|BOWLING/i,
]
function isExcluded(name) {
  return EXCLUDE_PATTERNS.some(re => re.test(name))
}

// 「国名でarea検索」は公開Overpassサーバーで非常に重くタイムアウトするため、
// 日本全域を覆うbbox（沖縄〜北海道）で代替する（2026-09-20、クレゲー側と同じ対策）。
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]
const BBOX = '24,122,46,146'
const QUERY = `
[out:json][timeout:120];
(
  node["leisure"="amusement_arcade"](${BBOX});
  way["leisure"="amusement_arcade"](${BBOX});
);
out center tags;
`

// bboxには韓国南部・中国東北部の一部が含まれるため除外する。
// 沖縄・奄美（緯度30度未満）は経度が低くても日本の正規領域なので除外しない。
function isLikelyOutsideJapan(lat, lon) {
  return lat >= 30 && lon < 129.5
}

async function fetchOverpass() {
  let lastErr
  for (const url of OVERPASS_MIRRORS) {
    try {
      console.log(`Overpassへ問い合わせ中: ${url}`)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'User-Agent': 'tabi-compuri/1.0 (game-center collection)' },
        body: QUERY,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      return await res.json()
    } catch (e) {
      console.error(`  失敗（次のミラーを試します）: ${e.message}`)
      lastErr = e
    }
  }
  throw lastErr
}

async function main() {
  const data = await fetchOverpass()
  const elements = data.elements ?? []
  console.log(`取得件数（生データ）: ${elements.length}`)

  // 「GiGO」「タイトーステーション」等ブランド名のみのnameタグだと、ユーザーがどの支店か
  // 判別できない問題への対策。OSMのbranchタグ（支店名）→住所（市区町村）の優先順で
  // 判別用の情報を名前に付加する。両方無ければブランド名のみのまま（判別情報がOSM側に無い）。
  function displayName(name, tags) {
    const branch = tags.branch?.trim()
    if (branch && !name.includes(branch)) return `${name} ${branch}`
    const areaParts = [tags['addr:city'], tags['addr:suburb'], tags['addr:quarter']].filter(Boolean)
    if (areaParts.length > 0) return `${name}（${areaParts.join('')}）`
    return name
  }

  const seen = new Set()
  const spots = []
  for (const el of elements) {
    const rawName = el.tags?.name ?? el.tags?.['name:ja']
    if (!rawName) continue
    if (isExcluded(rawName)) continue
    const lat = el.type === 'node' ? el.lat : el.center?.lat
    const lon = el.type === 'node' ? el.lon : el.center?.lon
    if (lat == null || lon == null) continue
    if (isLikelyOutsideJapan(lat, lon)) continue
    const prefecture_code = nearestPref(lat, lon)
    const id = `game-center-${el.type}-${el.id}`
    if (seen.has(id)) continue
    seen.add(id)
    const tier = tierFor(rawName)
    const name = displayName(rawName, el.tags || {})
    spots.push({ id, name, rawName, prefecture_code, lat, lon, tier })
  }

  // OSM側にbranchも住所タグも無く、大手チェーンのブランド名のみのままの地点だけ
  // Nominatim逆ジオコーディングで市区町村名を補完する（利用規約により1req/秒に制限）。
  // 独自の店名を持つ個人経営アーケード等は元々判別可能なので対象外にする。
  const needsGeocode = spots.filter(s => s.name === s.rawName && s.tier === 'S')
  console.log(`ブランド名のみで判別不能: ${needsGeocode.length}件 → 逆ジオコーディングで補完します`)
  for (const s of needsGeocode) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${s.lat}&lon=${s.lon}&zoom=14&accept-language=ja`
      const res = await fetch(url, { headers: { 'User-Agent': 'tabi-compuri/1.0 (game-center geocoding; contact: hanaosaka87@gmail.com)' } })
      if (res.ok) {
        const j = await res.json()
        const a = j.address || {}
        const area = a.city || a.town || a.village || a.suburb || a.county
        if (area) s.name = `${s.rawName}（${area}）`
      }
    } catch { /* 失敗時はブランド名のみのまま */ }
    await new Promise(r => setTimeout(r, 1100))
  }

  for (const s of spots) delete s.rawName

  spots.sort((a, b) => a.prefecture_code - b.prefecture_code || a.name.localeCompare(b.name, 'ja'))

  console.log(`重複除去後: ${spots.length}件`)
  console.log(`Sティア（大手チェーン）: ${spots.filter(s => s.tier === 'S').length}件`)

  writeFileSync('lib/spots/game-center.json', JSON.stringify(spots, null, 2), 'utf-8')
  console.log('lib/spots/game-center.json 保存完了')
}

main().catch(err => { console.error(err); process.exit(1) })
