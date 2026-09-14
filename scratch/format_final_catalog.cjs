const fs = require('fs');

const content = fs.readFileSync('src/data/catalog.ts', 'utf8');
const startIdx = content.indexOf('export const PRODUCTS: Product[] = [');
const endIdx = content.indexOf(';\n\nexport const allProducts');

let jsonText = '';
if (endIdx > startIdx) {
  jsonText = content.substring(startIdx + 'export const PRODUCTS: Product[] = '.length, endIdx).trim();
} else {
  jsonText = content.substring(startIdx + 'export const PRODUCTS: Product[] = '.length, content.lastIndexOf(']') + 1).trim();
}

const rawProducts = JSON.parse(jsonText);

console.log(`Formatting ${rawProducts.length} products for full TypeScript & Component compatibility...`);

const brandSet = new Set();

const formattedProducts = rawProducts.map((p, idx) => {
  if (p.brand) brandSet.add(p.brand);

  const title = p.title || p.name || 'Industrial Component';
  const slug = p.slug || p.id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const specsObj = p.specs || {};
  const specsArr = Object.entries(specsObj).map(([label, value]) => ({ label, value }));

  return {
    id: p.id || `prod-${idx}`,
    name: title,
    title: title,
    partNumber: p.partNumber || title.slice(0, 30),
    brand: p.brand || 'Industrial Automation',
    category: p.category || 'PLC Systems',
    type: p.category ? p.category.split(' ')[0] : 'PLC',
    price: p.price || 'Contact for Price',
    priceNumeric: p.priceNumeric || 0,
    description: p.description || '',
    specs: specsObj,
    specifications: specsArr,
    image: p.image,
    images: [p.image],
    slug: slug,
    stock: p.inStock !== false,
    inStock: p.inStock !== false,
    rating: p.rating || 4.9,
    featured: idx < 8
  };
});

const brandsList = ["All", ...Array.from(brandSet).sort()];

let companyObj = {
  "name": "Concept Automation Technologies",
  "proprietor": "Mr. Gaurang Mahendrabhai Chavda",
  "gst": "24ASYPC3254A1Z0",
  "address": "D-303, Titanium Business Park, Makarba Road, Makarba, Ahmedabad - 380051, Gujarat, India",
  "phone": "+91 87994 47337",
  "phoneRaw": "+918799447337",
  "whatsapp": "+918799447337",
  "email": "sales@concept-auto-tech.com"
};

let categoriesList = [];

if (fs.existsSync('src/data/catalog.ts.backup_real')) {
  const backupTxt = fs.readFileSync('src/data/catalog.ts.backup_real', 'utf8');
  const catMatch = backupTxt.match(/export const categories = (\[[\s\S]*?\]) as const;/i) || backupTxt.match(/export const categories = (\[[\s\S]*?\]);/i);
  if (catMatch) {
    try {
      categoriesList = JSON.parse(catMatch[1]);
    } catch (e) {}
  }
}

if (categoriesList.length === 0) {
  categoriesList = [
    { name: "Mitsubishi PLC", slug: "mitsubishi-plc", brand: "Mitsubishi", type: "PLC" },
    { name: "Siemens PLC", slug: "siemens-plc", brand: "Siemens", type: "PLC" },
    { name: "Proface HMI", slug: "proface-hmi", brand: "Proface", type: "HMI" },
    { name: "Fuji VFD", slug: "fuji-vfd", brand: "Fuji", type: "VFD" },
    { name: "Danfoss VFD", slug: "danfoss-vfd", brand: "Danfoss", type: "VFD" },
    { name: "Allen Bradley PLC", slug: "allen-bradley-plc", brand: "Allen Bradley", type: "PLC" },
    { name: "Omron Sensor", slug: "omron-sensor", brand: "Omron", type: "Sensor" },
    { name: "Pepperl+Fuchs Sensor", slug: "pepperl-fuchs-sensor", brand: "Pepperl+Fuchs", type: "Sensor" }
  ];
}

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

export const PRODUCTS: Product[] = ${JSON.stringify(formattedProducts, null, 2)};

export const allProducts: Product[] = PRODUCTS;
`;

fs.writeFileSync('src/data/catalog.ts', finalTsCode, 'utf8');
console.log(`Successfully updated src/data/catalog.ts with company, categories, brands, and ${formattedProducts.length} authentic products!`);
