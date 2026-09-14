const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const beforeProducts = content.slice(0, bracketIdx);
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

let cleanedCount = 0;

function cleanProductTitle(p) {
  let name = p.name || p.title || '';
  let orig = name;

  // 1. Cut off category banner noise e.g. "ABB general purpose drives ACS560, 0.75 to 160 kWThe ACS580..."
  name = name.replace(/ABB general purpose drives.*$/i, '');
  name = name.replace(/0\.75 to \d+ kW.*$/i, '');
  name = name.replace(/The ACS\d+.*$/i, '');

  // 2. Cut off sentence boilerplate like "The 1783-US8T Ethernet switch is an..."
  name = name.replace(/is an unmanaged.*$/i, '');
  name = name.replace(/are part of the.*$/i, '');

  // 3. Cut off HTML / web tags / price dumps
  name = name.replace(/&[a-z]+;/gi, ' ');
  name = name.replace(/₹.*$/i, '');
  name = name.replace(/Get Latest Price.*$/i, '');
  name = name.replace(/Call Now.*$/i, '');
  name = name.replace(/Explore more categories.*$/i, '');

  // 4. Remove duplicate brand names at start e.g. "Abb ABB", "Siemens Siemens", "Pepperl+Fuchs Pepperl and Fuchs"
  name = name.replace(/^Abb ABB\s+/i, 'ABB ');
  name = name.replace(/^Siemens Siemens\s+/i, 'Siemens ');
  name = name.replace(/^Pepperl\+Fuchs Pepperl and Fuchs\s+/i, 'Pepperl+Fuchs ');
  name = name.replace(/^Allen Bradley Allen-Bradley\s+/i, 'Allen Bradley ');

  // 5. Clean multi-spaces & trailing punctuation
  name = name.replace(/\s+/g, ' ').replace(/[\s.,:;\/-]+$/, '').trim();

  // 6. If title is still too long (> 85 chars), trim to model code + core spec cleanly
  if (name.length > 85) {
    if (p.partNumber && name.toLowerCase().includes(p.partNumber.toLowerCase())) {
      const idx = name.toLowerCase().indexOf(p.partNumber.toLowerCase());
      const prefix = name.slice(0, idx + p.partNumber.length).trim();
      const rest = name.slice(idx + p.partNumber.length).split(',')[0].slice(0, 35).trim();
      name = `${prefix} ${rest}`.trim();
    } else {
      name = name.slice(0, 80).split(',')[0].trim();
    }
    name = name.replace(/[\s.,:;\/-]+$/, '').trim();
  }

  if (name !== orig) {
    cleanedCount++;
    console.log(`BEFORE: "${orig}"`);
    console.log(`AFTER:  "${name}"\n`);
  }

  return name;
}

products.forEach(p => {
  const cleanName = cleanProductTitle(p);
  p.name = cleanName;
  p.title = cleanName;
});

console.log(`Cleaned ${cleanedCount} titles out of ${products.length}!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Updated src/data/catalog.ts successfully!");
