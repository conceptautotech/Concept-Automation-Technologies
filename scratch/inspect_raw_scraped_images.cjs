const fs = require('fs');

const scrapedData = JSON.parse(fs.readFileSync('scratch/scraped_data.json', 'utf8'));
const catalogContent = fs.readFileSync('src/data/catalog.ts', 'utf8');

const startIdx = catalogContent.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = catalogContent.indexOf('[\n  {', startIdx) !== -1 ? catalogContent.indexOf('[\n  {', startIdx) : catalogContent.indexOf('[\r\n  {', startIdx);
const endIdx = catalogContent.lastIndexOf('];');
const jsonText = catalogContent.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

const dupUrl = "https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg";
const affected = products.filter(p => p.image === dupUrl);

console.log("Affected Products:", affected.length);

let foundDistinctCount = 0;

affected.forEach(p => {
  const match = scrapedData[p.id];
  if (match && match.images && match.images.length > 0) {
    const distinctImg = match.images.find(img => img !== dupUrl && !img.includes('PDFImage'));
    if (distinctImg) {
      foundDistinctCount++;
      console.log(`[${p.id}] ${p.name} -> DISTINCT IMAGE: ${distinctImg}`);
    } else {
      console.log(`[${p.id}] ${p.name} -> ONLY HAS DUP IMAGE ON INDIAMART: ${match.images[0]}`);
    }
  } else {
    console.log(`[${p.id}] ${p.name} -> NO SCRAPED DATA FOUND`);
  }
});

console.log(`Found distinct original images for ${foundDistinctCount} out of ${affected.length} products!`);
