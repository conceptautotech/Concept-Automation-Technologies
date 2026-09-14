const fs = require('fs');
const content = fs.readFileSync('src/data/catalog.ts', 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);
const p = products.find(x => (x.name + ' ' + (x.partNumber||'')).includes('1769-OF4CI'));

if (p) {
  console.log("ID:", p.id);
  console.log("Name:", p.name);
  console.log("PartNumber:", p.partNumber);
  console.log("Description:", p.description ? p.description.slice(0, 80) + '...' : '');
} else {
  console.log("Product not found");
}
