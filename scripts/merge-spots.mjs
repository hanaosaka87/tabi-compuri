import { readFileSync, writeFileSync } from 'fs'

// 遊園地 + テーマパーク → leisure.json
const amusement = JSON.parse(readFileSync('lib/spots/amusement.json', 'utf-8'))
const themePark = JSON.parse(readFileSync('lib/spots/theme-park.json', 'utf-8'))
const seen = new Set()
const leisure = []
for (const s of [...amusement, ...themePark]) {
  // IDではなく名前で重複排除
  if (!seen.has(s.name)) { seen.add(s.name); leisure.push({ ...s, id: `leisure-${s.id}` }) }
}
writeFileSync('lib/spots/leisure.json', JSON.stringify(leisure, null, 2), 'utf-8')
console.log(`leisure.json: ${leisure.length}件`)

// 動物園 + 水族館 → zoo-aquarium.json
const zoo = JSON.parse(readFileSync('lib/spots/zoo.json', 'utf-8'))
const aquarium = JSON.parse(readFileSync('lib/spots/aquarium.json', 'utf-8'))
const seen2 = new Set()
const zooAq = []
for (const s of [...zoo, ...aquarium]) {
  if (!seen2.has(s.name)) { seen2.add(s.name); zooAq.push(s) }
}
writeFileSync('lib/spots/zoo-aquarium.json', JSON.stringify(zooAq, null, 2), 'utf-8')
console.log(`zoo-aquarium.json: ${zooAq.length}件`)
