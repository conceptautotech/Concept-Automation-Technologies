const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

const imageCounts = {};
products.forEach(p => {
  if (p.image) {
    imageCounts[p.image] = (imageCounts[p.image] || 0) + 1;
  }
});

console.log("Total Products:", products.length);
console.log("Total Unique Main Images:", Object.keys(imageCounts).length);

const duplicatedImages = Object.entries(imageCounts).filter(([url, count]) => count > 1).sort((a,b) => b[1] - a[1]);

console.log("\nTop Duplicated Image URLs across catalog:");
duplicatedImages.slice(0, 10).forEach(([url, count]) => {
  console.log(`  Count: ${count} | URL: ${url}`);
});
