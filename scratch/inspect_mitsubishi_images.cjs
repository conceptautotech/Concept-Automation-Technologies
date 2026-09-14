const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

const dupUrl = "https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg";

const affected = products.filter(p => p.image === dupUrl);

console.log("Products using default MELSEC image:", affected.length);

affected.forEach((p, idx) => {
  console.log(`\n[${idx+1}] ID: ${p.id} | Name: ${p.name}`);
  console.log(`     Main Image: ${p.image}`);
  console.log(`     Images Array (${(p.images||[]).length}):`, p.images);
});
