const fs = require('fs');
const path = require('path');

console.log("=== MERGING ALL SCRAPED JSON ARTIFACTS IN SCRATCH DIRECTORY ===");

const catalogMap = new Map();

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function detectBrand(title, text = '') {
  const combined = `${title} ${text}`.toUpperCase();
  if (combined.includes('SIEMENS')) return 'Siemens';
  if (combined.includes('MITSUBISHI') || combined.includes('MELSEC')) return 'Mitsubishi';
  if (combined.includes('OMRON')) return 'Omron';
  if (combined.includes('DELTA')) return 'Delta';
  if (combined.includes('SCHNEIDER')) return 'Schneider';
  if (combined.includes('ALLEN BRADLEY') || combined.includes('ALLEN-BRADLEY') || combined.includes('ROCKWELL') || combined.includes('AB ')) return 'Allen Bradley';
  if (combined.includes('ABB')) return 'ABB';
  if (combined.includes('PROFACE') || combined.includes('PRO-FACE')) return 'Proface';
  if (combined.includes('FUJI')) return 'Fuji';
  if (combined.includes('WEINTEK')) return 'Weintek';
  if (combined.includes('DANFOSS')) return 'Danfoss';
  if (combined.includes('YASKAWA')) return 'Yaskawa';
  if (combined.includes('SICK')) return 'SICK';
  if (combined.includes('IFM')) return 'IFM';
  if (combined.includes('PEPPERL') || combined.includes('P+F')) return 'Pepperl+Fuchs';
  if (combined.includes('PILZ')) return 'Pilz';
  if (combined.includes('AUTONICS')) return 'Autonics';
  if (combined.includes('INOVANCE')) return 'Inovance';
  if (combined.includes('PHOENIX')) return 'Phoenix Contact';
  return 'Industrial Automation';
}

function detectCategory(title, text = '') {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('plc') || combined.includes('programmable logic controller') || combined.includes('cpu') || combined.includes('rack')) return 'PLC Systems';
  if (combined.includes('hmi') || combined.includes('touch panel') || combined.includes('display') || combined.includes('ipc') || combined.includes('industrial pc')) return 'HMI & Touch Panels';
  if (combined.includes('vfd') || combined.includes('ac drive') || combined.includes('inverter') || combined.includes('variable frequency') || combined.includes('servo drive') || combined.includes('drive')) return 'VFD & AC Drives';
  if (combined.includes('sensor') || combined.includes('photoelectric') || combined.includes('proximity') || combined.includes('encoder') || combined.includes('vibration') || combined.includes('temperature')) return 'Sensors & Encoders';
  if (combined.includes('module') || combined.includes('input') || combined.includes('output') || combined.includes('card') || combined.includes('smps') || combined.includes('power supply') || combined.includes('relay') || combined.includes('switch')) return 'Modules & Accessories';
  return 'PLC Systems';
}

function extractPartNumber(title) {
  const match = title.match(/\b([A-Z0-9]{3,}[-\/][A-Z0-9\/-]+|[0-9][A-Z0-9]{5,})\b/i);
  if (match) return match[1].toUpperCase();
  return title.slice(0, 35);
}

function isValidImage(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.json')) return false;
  if (!url.startsWith('http')) return false;
  return true;
}

function addProduct(item) {
  if (!item || !item.title) return;
  const rawTitle = cleanText(item.title);
  if (rawTitle.length < 3) return;

  const slug = slugify(rawTitle);
  const prodId = item.id || slug;

  let img = item.image || item.imageUrl || item.imgUrl || '';
  if (img.includes('imimg.com')) {
    img = img.replace(/-125x125\./g, '-1000x1000.').replace(/-250x250\./g, '-1000x1000.').replace(/-500x500\./g, '-1000x1000.');
  }

  if (!isValidImage(img)) return;

  if (!catalogMap.has(slug) && !catalogMap.has(prodId)) {
    const brand = item.brand && item.brand !== 'Industrial Automation' ? item.brand : detectBrand(rawTitle);
    const category = item.category || detectCategory(rawTitle);
    const partNumber = item.partNumber || extractPartNumber(rawTitle);

    catalogMap.set(slug, {
      id: prodId,
      title: rawTitle,
      partNumber,
      brand,
      category,
      price: item.price || 'Contact for Price',
      priceNumeric: item.priceNumeric || 0,
      description: item.description || `${brand} ${rawTitle} industrial equipment. Genuine component supplied with full warranty and technical support by Concept Automation Technologies.`,
      specs: item.specs || {
        "Brand": brand,
        "Model": partNumber,
        "Condition": "100% Original Genuine",
        "Availability": "In Stock Ahmedabad",
        "Warranty": "12 Months Warranty"
      },
      image: img,
      inStock: true,
      rating: item.rating || 4.9,
      detailUrl: item.detailUrl || ''
    });
  }
}

// Read json files in scratch
const files = [
  'scratch/scraped_data.json',
  'scratch/discovered_products.json',
  'scratch/storefront_extracted_products.json',
  'src/data/catalog.ts.backup_full_indiamart',
  'src/data/catalog.ts.backup_real'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    console.log(`Reading ${f}...`);
    try {
      const content = fs.readFileSync(f, 'utf8');
      if (f.endsWith('.json')) {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          data.forEach(addProduct);
        } else if (data.products && Array.isArray(data.products)) {
          data.products.forEach(addProduct);
        }
      } else if (content.includes('PRODUCTS')) {
        const jsonText = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1);
        const data = JSON.parse(jsonText);
        if (Array.isArray(data)) data.forEach(addProduct);
      }
    } catch (err) {
      console.log(`Error parsing ${f}: ${err.message}`);
    }
  }
}

console.log(`Total merged authentic products from scratch files: ${catalogMap.size}`);

if (catalogMap.size > 0) {
  const productsList = Array.from(catalogMap.values());
  const catalogTsContent = `export interface Product {
  id: string;
  title: string;
  partNumber: string;
  brand: string;
  category: string;
  price: string;
  priceNumeric: number;
  description: string;
  specs: Record<string, string>;
  image: string;
  inStock: boolean;
  rating: number;
  featured?: boolean;
}

export const PRODUCTS: Product[] = ${JSON.stringify(productsList, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/data/catalog.ts'), catalogTsContent, 'utf8');
  console.log(`Successfully written ${productsList.length} products to src/data/catalog.ts!`);
}
