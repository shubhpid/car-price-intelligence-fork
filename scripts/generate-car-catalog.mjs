import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pyFile = readFileSync(resolve(__dirname, '../backend/car_catalog.py'), 'utf-8')

// Extract all {make, model, year} entries from the Python file
const entries = []
const regex = /\{"make":\s*'([^']+)',\s*"model":\s*'([^']+)',\s*"year":\s*(\d+)\}/g
let match
while ((match = regex.exec(pyFile)) !== null) {
  entries.push({ make: match[1], model: match[2], year: parseInt(match[3]) })
}

// Build nested structure: make -> model -> years[]
const catalog = {}
for (const { make, model, year } of entries) {
  if (!catalog[make]) catalog[make] = {}
  if (!catalog[make][model]) catalog[make][model] = []
  if (!catalog[make][model].includes(year)) {
    catalog[make][model].push(year)
  }
}

// Sort years descending for each model
for (const make of Object.keys(catalog)) {
  for (const model of Object.keys(catalog[make])) {
    catalog[make][model].sort((a, b) => b - a)
  }
}

const output = `// Auto-generated from backend/car_catalog.py - do not edit by hand
export const CAR_CATALOG: Record<string, Record<string, number[]>> = ${JSON.stringify(catalog, null, 2)}
`

writeFileSync(resolve(__dirname, '../lib/car-catalog.ts'), output)
console.log(`Generated car catalog with ${Object.keys(catalog).length} makes`)
