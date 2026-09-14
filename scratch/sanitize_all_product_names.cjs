const fs = require('fs');
const path = require('path');

function decodeEntities(str) {
  if (!str) return '';
  return str.replace(/&trade;/gi, '™')
            .replace(/&reg;/gi, '®')
            .replace(/&ndash;/gi, '-')
            .replace(/&mdash;/gi, '-')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&nbsp;/gi, ' ')
            .replace(/&times;/gi, '×')
            .replace(/&deg;/gi, '°');
}

function cleanText(str) {
  if (!str) return '';
  return decodeEntities(str)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractModelCode(text, specsObj = {}) {
  if (specsObj['Model Name/Number']) return specsObj['Model Name/Number'].trim();
  if (specsObj['Model']) return specsObj['Model'].trim();
  
  const match = text.match(/\b([A-Z0-9]{3,}[-\/][A-Z0-9\/-]+|[0-9][A-Z0-9]{5,})\b/i);
  if (match) return match[1].trim();
  return '';
}

function sanitizeTitle(rawTitle, brand, category, specsObj = {}, desc = '') {
  let t = cleanText(rawTitle);

  // 1. Remove prefixes like "Description:", "Product Details:", "General Specifications:", "Technical Data:"
  t = t.replace(/^(Description|Product Details|General Specifications|Technical Data|Overview|Features|Product Name)\s*:\s*/i, '').trim();

  // 2. Remove duplicate brand mentions at the beginning (e.g. "ABB Abb ACS560...", "Siemens Siemens...")
  const brandLower = (brand || '').toLowerCase();
  if (brandLower) {
    // Check if starts with brand twice (e.g. "ABB Abb", "Siemens Siemens")
    const doubleBrandRegex = new RegExp(`^(${brand})\\s+(${brand})\\b`, 'i');
    t = t.replace(doubleBrandRegex, '$1');
  }

  // 3. Handle sentence-like titles (e.g. "The 1783-US8T Ethernet switch is an unmanaged...", "CompactLogix 5370 Controllers are part of...")
  if (t.includes(' is an ') || t.includes(' is a ') || t.includes(' are part of ') || t.includes(' offered by ') || t.includes(' supplied by ')) {
    const parts = t.split(/\b(is an|is a|are part of|offered by|supplied by)\b/i);
    t = parts[0].trim();
  }

  // Remove "The " prefix if title starts with "The <Model> ..."
  if (t.startsWith('The ') || t.startsWith('the ')) {
    t = t.replace(/^The\s+/i, '');
  }

  // 4. Handle generic titles like "Product Details:" or empty/short titles
  if (t.length < 4 || t.toLowerCase() === 'product details' || t.toLowerCase() === 'general specifications' || t.toLowerCase() === 'technical data') {
    const modelCode = extractModelCode(rawTitle + ' ' + desc, specsObj);
    if (modelCode) {
      t = `${brand} ${modelCode} ${category.split(' ')[0]}`;
    } else {
      t = `${brand} ${category}`;
    }
  }

  // 5. Clean duplicated model names or brand endings (e.g. "ACS560-01-293A-4ABB" -> "ACS560-01-293A-4 ABB")
  t = t.replace(/([0-9])(ABB|SIEMENS|MITSUBISHI|OMRON|DELTA)/gi, '$1 $2');

  // 6. Clean trailing noise like ". VFD", ", VFD", "- VFD", trailing dots, hyphens, colons
  t = t.replace(/[\s.,\/-]+VFD$/i, ' VFD')
       .replace(/[\s.,\/-]+PLC$/i, ' PLC')
       .replace(/[\s.,\/-]+HMI$/i, ' HMI')
       .replace(/[\s.,:;\/-]+$/, '')
       .trim();

  // 7. If title does not start with Brand, prepend Brand if appropriate
  if (brand && brand !== 'Industrial Automation' && !t.toLowerCase().startsWith(brand.toLowerCase())) {
    t = `${brand} ${t}`;
  }

  // 8. Final character limit cleanup (max 85 chars for pristine card layout)
  if (t.length > 85) {
    const modelCode = extractModelCode(t, specsObj);
    if (modelCode && t.toUpperCase().includes(modelCode.toUpperCase())) {
      const idx = t.toUpperCase().indexOf(modelCode.toUpperCase());
      const prefix = t.slice(0, idx + modelCode.length).trim();
      const remainder = t.slice(idx + modelCode.length).split('.')[0].split(',')[0].slice(0, 40).trim();
      t = `${prefix} ${remainder}`.trim();
    } else {
      t = t.slice(0, 80).trim();
    }
    t = t.replace(/[\s.,:;\/-]+$/, '').trim();
  }

  return t;
}

function sanitizeDescription(rawDesc) {
  if (!rawDesc) return '';
  let d = cleanText(rawDesc);
  d = d.replace(/^(Description|Product Details|General Specifications|Technical Data)\s*:\s*/i, '')
       .replace(/SPECIFICATION[\s\S]*/i, '')
       .trim();
  return d;
}

function main() {
  console.log("=== SANITIZING ALL 968 PRODUCT NAMES & DESCRIPTIONS ===");

  const content = fs.readFileSync('src/data/catalog.ts', 'utf8');
  const startIdx = content.indexOf('export const PRODUCTS: Product[] = [');
  const endIdx = content.indexOf(';\n\nexport const allProducts');
  const jsonText = content.substring(startIdx + 'export const PRODUCTS: Product[] = '.length, endIdx).trim();

  const products = JSON.parse(jsonText);
  let sanitizedCount = 0;

  for (const p of products) {
    const oldTitle = p.title;
    const newTitle = sanitizeTitle(p.title || p.name, p.brand, p.category, p.specs || {}, p.description || '');

    if (oldTitle !== newTitle) {
      sanitizedCount++;
    }

    p.title = newTitle;
    p.name = newTitle;
    p.description = sanitizeDescription(p.description);

    // Ensure part number is clean and uppercase
    if (p.partNumber) {
      p.partNumber = cleanText(p.partNumber).toUpperCase().replace(/^PART\s*NUMBER\s*:\s*/i, '');
    }
  }

  console.log(`Sanitized ${sanitizedCount} product names out of ${products.length} total products!`);

  // Write updated catalog.ts
  const brandSet = new Set();
  products.forEach(p => brandSet.add(p.brand));
  const brandsList = ["All", ...Array.from(brandSet).sort()];

  const companyObj = {
    "name": "Concept Automation Technologies",
    "proprietor": "Mr. Gaurang Mahendrabhai Chavda",
    "gst": "24ASYPC3254A1Z0",
    "address": "D-303, Titanium Business Park, Makarba Road, Makarba, Ahmedabad - 380051, Gujarat, India",
    "phone": "+91 87994 47337",
    "phoneRaw": "+918799447337",
    "whatsapp": "+918799447337",
    "email": "sales@concept-auto-tech.com"
  };

  const categoriesList = [
    { name: "Mitsubishi PLC", slug: "mitsubishi-plc", brand: "Mitsubishi", type: "PLC" },
    { name: "Siemens PLC", slug: "siemens-plc", brand: "Siemens", type: "PLC" },
    { name: "Allen Bradley PLC", slug: "allen-bradley-plc", brand: "Allen Bradley", type: "PLC" },
    { name: "Proface HMI", slug: "proface-hmi", brand: "Proface", type: "HMI" },
    { name: "Siemens HMI", slug: "siemens-hmi", brand: "Siemens", type: "HMI" },
    { name: "Fuji VFD", slug: "fuji-vfd", brand: "Fuji", type: "VFD" },
    { name: "Danfoss VFD", slug: "danfoss-vfd", brand: "Danfoss", type: "VFD" },
    { name: "Pepperl+Fuchs Sensor", slug: "pepperl-fuchs-sensor", brand: "Pepperl+Fuchs", type: "Sensor" },
    { name: "Omron Sensor", slug: "omron-sensor", brand: "Omron", type: "Sensor" }
  ];

  const finalTsCode = `export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  title: string;
  partNumber: string;
  brand: string;
  category: string;
  type?: string;
  price: string;
  priceNumeric: number;
  description: string;
  specs: Record<string, string>;
  specifications: ProductSpec[];
  image: string;
  images?: string[];
  slug: string;
  stock: boolean;
  inStock: boolean;
  rating: number;
  featured?: boolean;
}

export interface Category {
  name: string;
  slug: string;
  brand: string;
  type: string;
  image?: string;
  blurb?: string;
}

export const company = ${JSON.stringify(companyObj, null, 2)};

export const brands = ${JSON.stringify(brandsList, null, 2)};

export const categories: Category[] = ${JSON.stringify(categoriesList, null, 2)};

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};

export const allProducts: Product[] = PRODUCTS;
`;

  fs.writeFileSync('src/data/catalog.ts', finalTsCode, 'utf8');
  console.log("Successfully written pristine sanitized product names to src/data/catalog.ts!");
}

main();
