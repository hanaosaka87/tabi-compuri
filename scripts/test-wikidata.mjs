// まず道の駅のQIDを確認
const sparql = `
SELECT ?item ?itemLabel ?coord WHERE {
  ?item wdt:P31/wdt:P279* wd:Q1058768.
  ?item wdt:P17 wd:Q17.
  OPTIONAL { ?item wdt:P625 ?coord. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}
LIMIT 5
`
const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql) + '&format=json'
const res = await fetch(url, {
  headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'tabi-compuri/1.0' }
})
console.log('status:', res.status)
const json = await res.json()
console.log(JSON.stringify(json.results?.bindings?.slice(0,3), null, 2))
