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

function cleanPartNumber(pn) {
  if (!pn) return '';
  return pn.replace(/^PART\s*NUMBER\s*:\s*/i, '')
           .replace(/GET\s*LATEST\s*PRICE.*/i, '')
           .replace(/000\/PIECEGET.*/i, '')
           .trim();
}

function getShortCleanTitle(p) {
  const brand = (p.brand || '').trim();
  const pn = cleanPartNumber(p.partNumber || (p.specs ? (p.specs.Model || p.specs['Model Name/Number']) : ''));
  const category = (p.category || '').trim();
  let name = (p.name || p.title || '').trim();

  // Remove HTML entities, price info, web tags
  name = name.replace(/&[a-z]+;/gi, ' ');
  name = name.replace(/₹.*$/i, '');
  name = name.replace(/Get Latest Price.*$/i, '');
  name = name.replace(/Call Now.*$/i, '');

  // Cut off description sentences at first period, semicolon, comma, or sentence connector:
  // "is ", "this ", "provides ", "offers ", "detects ", "represents ", "datasheet", "standard product", "technical data", "with ", "onboard", "power supply", "program/data"
  const cutoff = /\b(is|this|provides|offers|detects|represents|datasheet|standard product|technical data|we are|supplier|product description|complete controller|human-machine interface|onboard|power supply|program\/data|packing unit|colour code)\b.*/i;
  if (cutoff.test(name)) {
    name = name.split(cutoff)[0].trim();
  }

  // Remove duplicated brand prefixes (e.g. "Allen Bradley Allen-Bradley", "Siemens Siemens")
  if (brand && brand !== 'Industrial Automation') {
    const bEsc = brand.replace('+', '\\+');
    const doubleRegex = new RegExp(`^(${bEsc})\\s+(${bEsc}|${bEsc.replace('-', ' ')})\\s+`, 'i');
    name = name.replace(doubleRegex, '$1 ');
  }

  // Clean trailing punctuation
  name = name.replace(/[\s.,:;\/-]+$/, '').trim();

  // If we have a crisp part number (e.g. "1769-OF4CI", "6ES7511-1AK02-0AB0", "ACS560-01-02A6-4"), verify if name includes it
  if (pn && /\d/.test(pn) && pn.length >= 4 && !pn.includes('PIECEGET')) {
    // If name doesn't contain partNumber or is too noisy, construct concise title!
    const cleanBrand = brand !== 'Industrial Automation' ? brand : '';
    const categoryWord = category.split(' ')[0];
    
    // Check if name is already crisp (< 50 chars and contains pn)
    if (name.length <= 50 && name.toLowerCase().includes(pn.toLowerCase())) {
      // Good as is
    } else {
      // Rebuild clean title: e.g. "Allen Bradley 1769-OF4CI" or "Siemens 6ES7511-1AK02-0AB0"
      name = `${cleanBrand} ${pn}`.trim();
    }
  } else {
    // No model code: limit to first 4-5 words (max 45 chars)
    if (name.length > 45) {
      name = name.slice(0, 42).split(',')[0].split(';')[0].trim();
      name = name.replace(/[\s.,:;\/-]+$/, '').trim();
    }
  }

  // Ensure title starts with brand
  if (brand && brand !== 'Industrial Automation' && !name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = `${brand} ${name}`;
  }

  return name.trim();
}

products.forEach(p => {
  const shortTitle = getShortCleanTitle(p);
  if (p.name !== shortTitle) {
    cleanedCount++;
    console.log(`[${p.id}] BEFORE: "${p.name}" -> AFTER: "${shortTitle}"`);
  }
  p.name = shortTitle;
  p.title = shortTitle;
});

console.log(`Reformatted ${cleanedCount} titles out of ${products.length}!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved short crisp product names to src/data/catalog.ts!");
