const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const beforeProducts = content.slice(0, bracketIdx);
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

console.log("Total Products to Sanitize:", products.length);

function decodeEntities(str) {
  if (!str) return '';
  return str.replace(/&trade;/gi, '')
            .replace(/&reg;/gi, '')
            .replace(/&ndash;/gi, '-')
            .replace(/&mdash;/gi, '-')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&nbsp;/gi, ' ')
            .replace(/&times;/gi, '×')
            .replace(/&deg;/gi, '°');
}

function cleanString(str) {
  if (!str) return '';
  return decodeEntities(str)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractModelCode(p) {
  const specs = p.specs || {};
  if (specs['Model Name/Number'] && !specs['Model Name/Number'].includes('PIECEGET') && !specs['Model Name/Number'].includes('GET LATEST')) {
    const val = cleanString(specs['Model Name/Number']);
    if (val.length >= 3 && !val.toLowerCase().includes('product')) return val;
  }
  if (specs['Model'] && !specs['Model'].includes('PIECEGET') && !specs['Model'].includes('GET LATEST')) {
    const val = cleanString(specs['Model']);
    if (val.length >= 3 && !val.toLowerCase().includes('product')) return val;
  }

  const pn = cleanString(p.partNumber || '').replace(/^PART\s*NUMBER\s*:\s*/i, '').replace(/GET\s*LATEST\s*PRICE.*/i, '');
  if (pn && !pn.startsWith('IM-') && !pn.includes('PIECEGET') && pn.length >= 3) {
    return pn;
  }

  // Regex extract model pattern from raw text
  const text = `${p.name || ''} ${p.title || ''} ${p.description || ''}`;
  const match = text.match(/\b([A-Z0-9]{3,}[-\/][A-Z0-9\/-]+|6ES7[0-9A-Z\/-]+|FX[0-9][A-Z0-9\/-]+|ACS[0-9]{3}[A-Z0-9\/-]+|17[0-9]{2}-[A-Z0-9]+|22F-[A-Z0-9]+|GP-[0-9]{4}[A-Z0-9]*|PFX[A-Z0-9]+|OB[DT][0-9]{3}[A-Z0-9\/-]+|E3Z-[A-Z0-9]+)\b/i);
  if (match && !match[1].startsWith('IM-')) {
    return match[1].trim();
  }

  return '';
}

let changedCount = 0;

products.forEach(p => {
  let orig = p.name || p.title || '';
  let brand = cleanString(p.brand || '');
  if (brand === 'Industrial Automation') brand = '';

  let name = cleanString(orig);

  // 1. Remove sentence boilerplate, overview headers, & noisy web dumps
  name = name.replace(/^(Description|Product Details|General Specifications|Technical Data|Overview|Features|Product Name)\s*:\s*/i, '');
  
  // Cut sentence connectors & description verbs
  const noiseCutoff = /\b(is an?|is compact|is a|are part of|offered by|supplied by|provides|offers|detects|represents|datasheet|standard product|technical data|we are|supplier|product description|complete controller|human-machine interface|onboard|power supply|program\/data|packing unit|colour code|screen size|resolution|get latest price|call now|explore more)\b.*/i;
  if (noiseCutoff.test(name)) {
    name = name.split(noiseCutoff)[0].trim();
  }

  // Remove price text
  name = name.replace(/₹.*$/i, '').replace(/\d+\/Piece.*/i, '');

  // 2. Remove duplicate brand names at start (e.g. "ABB ABB", "Siemens Siemens", "Allen Bradley Allen-Bradley")
  if (brand) {
    const bEsc = brand.replace('+', '\\+');
    const doubleBrand = new RegExp(`^(${bEsc})\\s+(${bEsc}|${bEsc.replace('-', ' ')})\\s+`, 'i');
    name = name.replace(doubleBrand, '$1 ');
  }

  // Clean trailing punctuation
  name = name.replace(/[\s.,:;\/-]+$/, '').trim();

  // 3. Extract exact model code
  const modelCode = extractModelCode(p);

  // Re-build clean name if current name is noisy or too long (> 55 chars) or generic
  if (name.length > 55 || name.length < 5 || (brand && name.toLowerCase() === brand.toLowerCase()) || name.toLowerCase().includes('product description')) {
    const shortCategory = p.category ? p.category.replace('&', 'and') : 'Product';
    if (modelCode) {
      name = `${brand} ${modelCode}`.trim();
    } else {
      name = `${brand} ${shortCategory}`.trim();
    }
  }

  // 4. Ensure Brand prefix is at start of title if brand exists
  if (brand && !name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = `${brand} ${name}`;
  }

  // 5. Final pass: ensure no leftover "is...", "module...", trailing dashes
  name = name.replace(/\b(is|this|provides|offers|detects)\b.*/i, '')
             .replace(/[\s.,:;\/-]+$/, '')
             .trim();

  if (name !== orig) {
    changedCount++;
    console.log(`[${p.id}] BEFORE: "${orig}"`);
    console.log(`          AFTER:  "${name}"\n`);
  }

  p.name = name;
  p.title = name;
});

console.log(`Sanitized ${changedCount} product titles out of ${products.length} total products!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved 100% pristine product names to src/data/catalog.ts!");
