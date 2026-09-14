const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

console.log("Total Products in Catalog:", products.length);

let longTitles = 0;
let noisyTitles = 0;
let emptyTitles = 0;

const sampleByBrand = {};

products.forEach(p => {
  const name = p.name || '';
  if (!name || name.length < 3) emptyTitles++;
  if (name.length > 60) longTitles++;
  if (/\b(is|this|provides|offers|detects|represents|datasheet|standard product|technical data|we are|supplier|product description|pieceget|get latest price)\b/i.test(name)) {
    noisyTitles++;
    console.log(`NOISY ITEM [${p.id}]: "${name}"`);
  }

  if (!sampleByBrand[p.brand]) {
    sampleByBrand[p.brand] = [];
  }
  if (sampleByBrand[p.brand].length < 3) {
    sampleByBrand[p.brand].push(name);
  }
});

console.log("\n--- AUDIT SUMMARY ---");
console.log("Empty or Too Short Titles:", emptyTitles);
console.log("Long Titles (>60 chars):", longTitles);
console.log("Noisy Sentence Titles:", noisyTitles);

console.log("\n--- SAMPLE TITLES BY BRAND ---");
for (const [brand, titles] of Object.entries(sampleByBrand)) {
  console.log(`\nBrand: ${brand}`);
  titles.forEach(t => console.log(`  - "${t}"`));
}
