// 北海道全域でテスト。タグを複数試す
const query = '[out:json][timeout:60];(node["amenity"="roadside_station"](42,140,45,146);node["highway"="rest_area"]["name"~"道の駅"](42,140,45,146););out body;'
const res = await fetch('https://overpass.kumi.systems/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'test/1.0' },
  body: 'data=' + encodeURIComponent(query),
})
console.log('status:', res.status)
const text = await res.text()
console.log(text.slice(0, 500))
