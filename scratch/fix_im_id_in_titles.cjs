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
  const brand = (p.brand || '').trim();
  const category = (p.category || '').trim();

  // If name contains im- (case insensitive), replace with clean Brand + Category or model
  if (/im-\d+/i.test(name) || name.length < 4) {
    const cleanBrand = (brand && brand !== 'Industrial Automation') ? brand : 'Industrial';
    // Remove im- digits and clean up
    name = `${cleanBrand} ${category}`.trim();
    fixedCount++;
    console.log(`[${p.id}] -> "${name}"`);
  }

  // Remove duplicate brand prefix e.g. "Allen Bradley Allen Bradley"
  if (brand && brand !== 'Industrial Automation') {
    const bEsc = brand.replace('+', '\\+');
    const doubleRegex = new RegExp(`^(${bEsc})\\s+(${bEsc})\\s+`, 'i');
    name = name.replace(doubleRegex, '$1 ');
  }

  p.name = name;
  p.title = name;
});

console.log(`Cleaned ${fixedCount} product titles containing IM- IDs!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved pristine product names to src/data/catalog.ts!");
