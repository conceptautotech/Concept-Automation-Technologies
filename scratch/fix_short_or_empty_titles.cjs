const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const beforeProducts = content.slice(0, bracketIdx);
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

let fixedCount = 0;

products.forEach(p => {
  let name = p.name || '';
  const brand = p.brand || '';
  const category = p.category || '';
  const partNumber = p.partNumber || (p.specs ? p.specs.Model || p.specs['Model Name/Number'] : '') || '';

  // Check if title is generic, short, or equal to just brand name
  if (name.length < 15 || name.trim().toLowerCase() === brand.toLowerCase() || name.includes('Get Latest Price') || name.toLowerCase().includes('product description')) {
    let cleanPart = partNumber.replace(/^PART\s*NUMBER\s*:\s*/i, '').replace(/GET\s*LATEST\s*PRICE/i, '').trim();
    if (cleanPart && cleanPart !== '000/PIECEGET') {
      name = `${brand} ${cleanPart} ${category.split(' ')[0]}`.trim();
    } else {
      name = `${brand} ${category}`.trim();
    }
    fixedCount++;
    console.log(`REBUILT TITLE for ID ${p.id}: "${name}"`);
  }

  // Ensure title starts with brand
  if (brand && brand !== 'Industrial Automation' && !name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = `${brand} ${name}`;
  }

  p.name = name;
  p.title = name;
});

console.log(`Fixed/rebuilt ${fixedCount} titles!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved cleaned titles to src/data/catalog.ts!");
