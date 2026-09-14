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
  const brand = (p.brand || '').trim();
  const category = (p.category || '').trim();
  const cleanBrand = (brand && brand !== 'Industrial Automation') ? brand : '';

  if (name.includes('PIECEGET') || name.includes('PieceGet') || name.includes('PIECE GET') || name.includes('000/')) {
    // Extract real model if available in specs or description
    const text = `${p.description || ''} ${JSON.stringify(p.specs || {})}`;
    const m = text.match(/\b(FX[0-9][A-Z0-9\/-]+|6ES7[0-9A-Z\/-]+|ACS[0-9]{3}[A-Z0-9\/-]+|17[0-9]{2}-[A-Z0-9]+|22F-[A-Z0-9]+|GP-[0-9]{4}[A-Z0-9]*|PFX[A-Z0-9]+|E3Z-[A-Z0-9]+)\b/i);
    
    if (m) {
      name = `${cleanBrand} ${m[1]}`.trim();
    } else {
      name = `${cleanBrand} ${category}`.trim();
    }
    fixed++;
    console.log(`[${p.id}] FIXED PIECEGET -> "${name}"`);
  }

  p.name = name;
  p.title = name;
});

console.log(`Fixed ${fixed} titles with PIECEGET noise!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved pristine catalog to src/data/catalog.ts!");
