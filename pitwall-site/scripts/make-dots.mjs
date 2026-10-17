// Builds src/data/dots.json: a dot-matrix of land points for the circuit map.
// Run once with: node scripts/make-dots.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { geoContains } from 'd3-geo'
import { feature } from 'topojson-client'

const topo = JSON.parse(readFileSync(new URL('../src/data/land-110m.json', import.meta.url)))
const land = feature(topo, topo.objects.land)
const STEP = 1.6
const dots = []
for (let lat = 78; lat >= -56; lat -= STEP) {
  for (let lon = -170; lon <= 180; lon += STEP) {
    if (geoContains(land, [lon, lat])) dots.push([+lon.toFixed(1), +lat.toFixed(1)])
  }
}
writeFileSync(new URL('../src/data/dots.json', import.meta.url), JSON.stringify(dots))
console.log('dots', dots.length)
