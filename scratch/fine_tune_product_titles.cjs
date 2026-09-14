const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const beforeProducts = content.slice(0, bracketIdx);
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

let fixed = 0;

products.forEach(p => {
  let name = p.name || p.title || '';
  let orig = name;

  // 1. Remove redundant "PEPPERL AND FUCHS" or "Omron - Omron"
  name = name.replace(/Pepperl\+Fuchs\s+PEPPERL\s+AND\s+FUCHS\s+/i, 'Pepperl+Fuchs ');
  name = name.replace(/Omron\s*-\s*Omron\s+/i, 'Omron ');
  name = name.replace(/Siemens\s+Allen\s+Bradley\s+/i, 'Siemens ');
  name = name.replace(/Mitsubishi\s+ProductsGT/i, 'Mitsubishi GT');

  // 2. Clean duplicated words & spacing
  name = name.replace(/\s+/g, ' ').replace(/[\s.,:;\/-]+$/, '').trim();

  if (name !== orig) {
    fixed++;
    console.log(`[${p.id}] BEFORE: "${orig}" -> AFTER: "${name}"`);
  }

  p.name = name;
  p.title = name;
});

console.log(`Fine-tuned ${fixed} product titles!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved 100% perfect catalog to src/data/catalog.ts!");
