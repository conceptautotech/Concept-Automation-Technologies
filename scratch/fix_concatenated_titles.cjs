const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

// Regex or AST transform to parse PRODUCTS
const startMarker = 'export const PRODUCTS: Product[] = ';
const startIdx = content.indexOf(startMarker);
const endIdx = content.lastIndexOf('];\n\nexport const allProducts');

if (startIdx === -1) {
  console.log("Could not find PRODUCTS array start");
  process.exit(1);
}

const beforeProducts = content.slice(0, startIdx + startMarker.length);
const productsJsonStr = content.slice(startIdx + startMarker.length, content.indexOf('];\n\nexport const allProducts') + 1);
const afterProducts = content.slice(content.indexOf('];\n\nexport const allProducts'));

let products = eval('(' + productsJsonStr + ')');

console.log("Total products loaded:", products.length);

let cleanedCount = 0;

function cleanTitle(name, partNumber, brand) {
  let original = name;
  let str = name;

  // Fix unspaced concatenations like kWABB -> kW ABB, VABB -> V ABB, kWAC -> kW AC, etc.
  str = str.replace(/([a-z0-9])([A-Z][A-Z]+)/g, '$1 $2');
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Fix repeated brand prefixes or category heading dumps at the front
  // e.g. "ABB general purpose drives ACS560, 0.75 to 160 kW ABB ACS560 0.75KW..."
  // If there's a comma or range like "0.75 to 160 kW", cut the first category heading part if the second part repeats the model/brand!
  
  if (str.includes(',') && (str.includes(' to ') || str.includes(' kW') || str.includes(' V'))) {
    const parts = str.split(/(?<=kW|HP|V|Phase|drives|controllers|series),?\s+/i);
    if (parts.length > 1 && parts[1].toLowerCase().includes(brand.toLowerCase())) {
      str = parts.slice(1).join(' ').trim();
    }
  }

  // Remove duplicate brand prefix at start if repeated e.g. "ABB ABB ACS560..." -> "ABB ACS560..."
  const brandRegex = new RegExp(`^(${brand})\\s+(${brand})\\s+`, 'i');
  str = str.replace(brandRegex, '$1 ');

  // Fix "Pepperl+Fuchs Pepperl and Fuchs" -> "Pepperl+Fuchs"
  str = str.replace(/^Pepperl\+Fuchs Pepperl and Fuchs\s+/i, 'Pepperl+Fuchs ');

  // Fix "Siemens Siemens" -> "Siemens"
  str = str.replace(/^Siemens Siemens\s+/i, 'Siemens ');

  // Clean up extra spaces
  str = str.replace(/\s+/g, ' ').trim();

  if (str !== original) {
    cleanedCount++;
  }
  return str;
}

products.forEach(p => {
  const cleanedName = cleanTitle(p.name, p.partNumber, p.brand);
  p.name = cleanedName;
  p.title = cleanedName;
});

console.log(`Cleaned ${cleanedCount} product titles out of ${products.length}!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Updated src/data/catalog.ts successfully!");
