const fs = require('fs');
const content = fs.readFileSync('src/data/catalog.ts', 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

const abb = products.filter(p => p.brand === 'ABB' || p.name.includes('ACS560'));

console.log("ABB Product Count:", abb.length);
abb.slice(0, 5).forEach((p, i) => {
  console.log(`\n[${i+1}] Name: "${p.name}"`);
  console.log(`    PartNumber: "${p.partNumber}"`);
});
