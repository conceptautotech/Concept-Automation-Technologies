const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const beforeProducts = content.slice(0, bracketIdx);
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

console.log("Processing products:", products.length);

let cleanedCount = 0;

function getPristineTitle(p) {
  let brand = (p.brand || '').trim();
  let partNumber = (p.partNumber || '').trim();
  let category = (p.category || '').trim();
  let name = (p.name || p.title || '').trim();

  // Clean part number if it contains garbage like "PART NUMBER:"
  partNumber = partNumber.replace(/^PART\s*NUMBER\s*:\s*/i, '').replace(/GET\s*LATEST\s*PRICE/i, '').trim();

  let orig = name;

  // 1. Cut off sentence verbs & English description starters:
  // "is ", "This ", "provides ", "offers ", "detects ", "represents ", "Datasheet ", "Standard product ", "Technical data "
  const sentenceCutoff = /\b(is|this|provides|offers|detects|represents|datasheet|standard product|technical data|we are|supplier|product description|complete controller|human-machine interface)\b.*/i;

  if (sentenceCutoff.test(name)) {
    name = name.split(sentenceCutoff)[0].trim();
  }

  // 2. Remove HTML entities, price info, web tags
  name = name.replace(/&[a-z]+;/gi, ' ');
  name = name.replace(/₹.*$/i, '');
  name = name.replace(/Get Latest Price.*$/i, '');
  name = name.replace(/Call Now.*$/i, '');

  // 3. Remove duplicated brand prefixes (e.g. "Allen Bradley Allen-Bradley", "ABB ABB")
  if (brand && brand !== 'Industrial Automation') {
    const bEsc = brand.replace('+', '\\+');
    const doubleRegex = new RegExp(`^(${bEsc})\\s+(${bEsc}|${bEsc.replace('-', ' ')})\\s+`, 'i');
    name = name.replace(doubleRegex, '$1 ');
  }

  // 4. Clean trailing symbols, punctuation, dashes
  name = name.replace(/[\s.,:;\/-]+$/, '').trim();

  // 5. If title is now too short (< 4 chars) or empty or just brand, construct from Brand + PartNumber + Category
  if (name.length < 5 || (brand && name.toLowerCase() === brand.toLowerCase())) {
    if (partNumber && /\d/.test(partNumber) && partNumber.length >= 4) {
      name = `${brand} ${partNumber}`;
    } else {
      name = `${brand} ${category}`;
    }
  }

  // 6. Ensure title starts with Brand if appropriate
  if (brand && brand !== 'Industrial Automation' && !name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = `${brand} ${name}`;
  }

  // 7. Limit max length to 60 characters so titles are short, elegant product names (not descriptions!)
  if (name.length > 60) {
    // If name contains part number, cut right after part number or first comma/semicolon
    if (partNumber && name.toUpperCase().includes(partNumber.toUpperCase())) {
      const pIdx = name.toUpperCase().indexOf(partNumber.toUpperCase());
      name = name.slice(0, pIdx + partNumber.length).trim();
    } else {
      name = name.slice(0, 55).split(',')[0].split(';')[0].trim();
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
  const pristine = getPristineTitle(p);
  p.name = pristine;
  p.title = pristine;
});

console.log(`Pristine cleaned ${cleanedCount} titles out of ${products.length}!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved pristine product names to src/data/catalog.ts!");
