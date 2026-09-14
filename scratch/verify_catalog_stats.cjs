const fs = require('fs');

const content = fs.readFileSync('src/data/catalog.ts', 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] = [');
const endIdx = content.lastIndexOf('];');

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not locate PRODUCTS bounds");
  process.exit(1);
}

const jsonStr = content.slice(startIdx + 'export const PRODUCTS: Product[] = '.length, endIdx + 1);

let products;
try {
  products = eval('(' + jsonStr + ')');
} catch(err) {
  console.log("Eval error:", err.message);
  process.exit(1);
}

console.log("Total Products:", products.length);

const categories = {};
const brands = {};
let imimgImages = 0;
let missingImages = 0;
const uniqueImages = new Set();

products.forEach(p => {
  categories[p.category] = (categories[p.category] || 0) + 1;
  brands[p.brand] = (brands[p.brand] || 0) + 1;
  
  if (p.image) {
    if (p.image.includes('imimg.com')) imimgImages++;
    uniqueImages.add(p.image);
  } else {
    missingImages++;
  }
});

console.log("\n--- Categories Breakdown ---");
console.table(categories);

console.log("\n--- Brands Breakdown ---");
console.table(brands);

console.log("\n--- Image Statistics ---");
console.log("Total Products:", products.length);
console.log("IndiaMart Images (imimg.com):", imimgImages, `(${((imimgImages/products.length)*100).toFixed(1)}%)`);
console.log("Unique Image URLs:", uniqueImages.size);
console.log("Missing Images:", missingImages);
