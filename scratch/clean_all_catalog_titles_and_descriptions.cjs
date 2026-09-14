const fs = require('fs');

const content = fs.readFileSync('src/data/catalog.ts', 'utf8');
const startIdx = content.indexOf('export const PRODUCTS: Product[] = [');
const endIdx = content.indexOf(';\n\nexport const allProducts');
const jsonText = content.substring(startIdx + 'export const PRODUCTS: Product[] = '.length, endIdx).trim();

const products = JSON.parse(jsonText);

console.log(`Inspecting ${products.length} products for title & description cleanup...`);

let titleFixedCount = 0;

for (const p of products) {
  let title = p.title || p.name || '';

  // 1. Remove "Description:" or "Description :" prefix
  if (title.startsWith('Description:') || title.startsWith('Description :')) {
    title = title.replace(/^Description\s*:\s*/i, '').trim();
    titleFixedCount++;
  }

  // 2. Decode HTML entities like &ndash;, &amp;, &quot;, &lt;, &gt;, &nbsp;, &times;, &deg;
  title = title.replace(/&ndash;/gi, '-')
               .replace(/&mdash;/gi, '-')
               .replace(/&amp;/gi, '&')
               .replace(/&quot;/gi, '"')
               .replace(/&#39;/gi, "'")
               .replace(/&nbsp;/gi, ' ')
               .replace(/&times;/gi, '×')
               .replace(/&deg;/gi, '°');

  // 3. Remove SPECIFICATION / Manufacturer dump pasted onto the title
  if (title.includes('SPECIFICATION') || title.includes('Specification')) {
    title = title.split(/SPECIFICATION|Specification/i)[0].trim();
    titleFixedCount++;
  }

  // 4. Remove unspaced spec runs at the end (e.g. ManufacturerOMR... or Screen size10.4")
  if (title.includes('Manufacturer') || title.includes('Screen size') || title.includes('Display resolution')) {
    title = title.split(/Manufacturer|Screen size|Display resolution/i)[0].trim();
    titleFixedCount++;
  }

  // 5. If title is still excessively long (> 90 chars), extract model number or first clean sentence
  if (title.length > 90) {
    const modelMatch = title.match(/\b([A-Z0-9]{3,}[-\/][A-Z0-9\/-]+|[0-9][A-Z0-9]{5,})\b/i);
    const firstSentence = title.split('.')[0].split(',')[0].slice(0, 75).trim();
    if (modelMatch) {
      const model = modelMatch[1].toUpperCase();
      if (!firstSentence.toUpperCase().includes(model)) {
        title = `${p.brand} ${model} - ${firstSentence}`;
      } else {
        title = `${p.brand} ${firstSentence}`;
      }
    } else {
      title = `${p.brand} ${firstSentence}`;
    }
    titleFixedCount++;
  }

  // Clean trailing punctuation
  title = title.replace(/[,;-]+$/, '').trim();

  p.title = title;
  p.name = title;

  // Clean description HTML entities as well
  if (p.description) {
    let desc = p.description;
    desc = desc.replace(/^Description\s*:\s*/i, '')
               .replace(/&ndash;/gi, '-')
               .replace(/&mdash;/gi, '-')
               .replace(/&amp;/gi, '&')
               .replace(/&quot;/gi, '"')
               .replace(/&#39;/gi, "'")
               .replace(/&nbsp;/gi, ' ')
               .replace(/&times;/gi, '×')
               .replace(/&deg;/gi, '°')
               .replace(/SPECIFICATION[\s\S]*/i, '')
               .trim();
    p.description = desc;
  }
}

console.log(`Cleaned up ${titleFixedCount} product titles & descriptions.`);

// Re-write catalog.ts
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
console.log("Successfully updated src/data/catalog.ts!");
