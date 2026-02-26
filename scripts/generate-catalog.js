import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const ROOT = "/vercel/share/v0-project";

console.log("Starting script...");

const text = readFileSync(`${ROOT}/backend/car_catalog.py`, 'utf-8');
console.log(`Read ${text.length} chars from car_catalog.py`);

const pattern = /\{"make":\s*['"]([^'"]+)['"],\s*"model":\s*['"]([^'"]+)['"],\s*"year":\s*(\d+)\}/g;
const catalog = {};
let match;
let count = 0;

while ((match = pattern.exec(text)) !== null) {
  const [, make, model, yearStr] = match;
  const year = parseInt(yearStr, 10);
  if (!catalog[make.trim()]) catalog[make.trim()] = {};
  if (!catalog[make.trim()][model.trim()]) catalog[make.trim()][model.trim()] = [];
  if (!catalog[make.trim()][model.trim()].includes(year)) {
    catalog[make.trim()][model.trim()].push(year);
  }
  count++;
}

console.log(`Parsed ${count} entries`);

// Sort
const sorted = {};
for (const make of Object.keys(catalog).sort()) {
  sorted[make] = {};
  for (const model of Object.keys(catalog[make]).sort()) {
    sorted[make][model] = catalog[make][model].sort((a, b) => b - a);
  }
}

mkdirSync(`${ROOT}/lib`, { recursive: true });

const output = `// Auto-generated from backend/car_catalog.py -- do not edit by hand
export const CAR_CATALOG: Record<string, Record<string, number[]>> = ${JSON.stringify(sorted, null, 2)};
`;

writeFileSync(`${ROOT}/lib/car-catalog.ts`, output);
console.log(`Wrote lib/car-catalog.ts with ${Object.keys(sorted).length} makes`);
