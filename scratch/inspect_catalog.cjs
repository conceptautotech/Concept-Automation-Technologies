const fs = require('fs');

const content = fs.readFileSync('src/data/catalog.ts', 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] = [');
const endIdx = content.indexOf(';\n\nexport const allProducts');
const jsonText = content.substring(startIdx + 'export const PRODUCTS: Product[] = '.length, endIdx).trim();

try {
  const products = JSON.parse(jsonText);
  console.log(`Total Products in catalog.ts: ${products.length}`);

  const brandCounts = {};
  const categoryCounts = {};

  for (const p of products) {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  console.log("\nBrand Breakdown:", brandCounts);
  console.log("\nCategory Breakdown:", categoryCounts);
} catch (e) {
  console.error("JSON parse error:", e.message);
}
