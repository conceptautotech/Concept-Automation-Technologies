const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startMarker = 'export const PRODUCTS: Product[] = [';
const startIdx = content.indexOf(startMarker);
const endMarker = '];\n\nexport const allProducts';
const endIdx = content.lastIndexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find PRODUCTS bounds");
  process.exit(1);
}

const beforeProducts = content.slice(0, startIdx + 'export const PRODUCTS: Product[] = '.length);
const productsJsonStr = content.slice(startIdx + 'export const PRODUCTS: Product[] = '.length, endIdx + 1);
const afterProducts = content.slice(endIdx + 1);

let products;
try {
  products = JSON.parse(productsJsonStr);
} catch(e) {
  console.log("JSON.parse error:", e.message);
  process.exit(1);
}

console.log("Total products loaded:", products.length);

let cleanedCount = 0;

function fixTitle(name, brand) {
  let original = name;
  let str = name;

  // 1. Remove category banner prefixes containing commas & range text e.g.:
  // "ABB general purpose drives ACS560, 0.75 to 160 kWABB ACS560 0.75KW 2.6A IP20 GENERAL PURPOSE DRIVE W/ CP ACS560-01-02A6-4 +J404"
  // Look for "kW", "HP", "V", "Phase" immediately glued to Brand name e.g. "kWABB" -> split at "kW" -> keep "ABB..."
  str = str.replace(/^(.*?)(kW|HP|V|Phase|drives|series|controllers|systems|models|units)([A-Z][a-zA-Z0-9\+\-]+)\s+/i, (m, g1, g2, g3) => {
    if (g3.toLowerCase().startsWith(brand.toLowerCase().slice(0, 3))) {
      return g3 + ' ';
    }
    return m;
  });

  // 2. If title contains brand multiple times e.g.
  // "ABB General Purpose Drives ACS560, 0.75 to 160 kW ABB ACS560..."
  if (str.includes(brand)) {
    const brandIdx = str.indexOf(brand);
    const secondBrandIdx = str.indexOf(brand, brandIdx + brand.length);
    if (secondBrandIdx > -1) {
      str = str.slice(secondBrandIdx);
    }
  }

  // 3. Remove repeated Brand name at start e.g. "Siemens Siemens S7-1200" -> "Siemens S7-1200"
  const doubleBrandRegex = new RegExp(`^(${brand.replace('+', '\\+')})\\s+\\1\\s+`, 'i');
  str = str.replace(doubleBrandRegex, '$1 ');

  // 4. Remove unwanted trailing web text like "Get Latest Price", "Call Now", "Explore more categories"
  str = str.replace(/\s*Get Latest Price.*$/i, '');
  str = str.replace(/\s*Call Now.*$/i, '');
  str = str.replace(/\s*Explore more categories.*$/i, '');

  str = str.replace(/\s+/g, ' ').trim();

  if (str !== original) {
    cleanedCount++;
    console.log(`BEFORE: "${original}"`);
    console.log(`AFTER:  "${str}"\n`);
  }

  return str;
}

products.forEach(p => {
  const fixed = fixTitle(p.name, p.brand);
  p.name = fixed;
  p.title = fixed;
});

console.log(`Cleaned ${cleanedCount} product titles out of ${products.length}!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Successfully saved cleaned titles to src/data/catalog.ts!");
