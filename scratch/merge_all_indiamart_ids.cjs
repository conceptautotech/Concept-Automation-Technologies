const fs = require('fs');
const path = require('path');

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function extractModelCode(text, specsObj = {}) {
  if (specsObj['Model Name/Number']) return specsObj['Model Name/Number'].trim().toUpperCase();
  if (specsObj['Model']) return specsObj['Model'].trim().toUpperCase();
  
  const match = text.match(/\b([A-Z0-9]{3,}[-\/][A-Z0-9\/-]+|[0-9][A-Z0-9]{5,})\b/i);
  if (match) return match[1].trim().toUpperCase();
  return '';
}

function detectBrand(title, text = '', specsObj = {}) {
  let combined = `${title} ${text} ${JSON.stringify(specsObj)}`.toUpperCase();

  if (combined.includes('SIEMENS') || combined.includes('SIMATIC') || combined.includes('SINAMICS') || combined.includes('S7-') || combined.includes('LOGO!') || combined.includes('ET200')) return 'Siemens';
  if (combined.includes('MITSUBISHI') || combined.includes('MELSEC') || combined.includes('MELSERVO') || combined.includes('GOT1000') || combined.includes('GOT2000') || combined.includes('FREQROL') || combined.includes('FX5U') || combined.includes('FX3U') || combined.includes('FX3G') || combined.includes('FX3S')) return 'Mitsubishi';
  if (combined.includes('OMRON') || combined.includes('CP1E') || combined.includes('CP2E') || combined.includes('CJ2M') || combined.includes('CS1G') || combined.includes('SYSMAC')) return 'Omron';
  if (combined.includes('DELTA') || combined.includes('DVP') || combined.includes('DOP-') || combined.includes('VFD-M') || combined.includes('VFD-B') || combined.includes('MS300')) return 'Delta';
  if (combined.includes('SCHNEIDER') || combined.includes('TELEMECANIQUE') || combined.includes('ALTIVAR') || combined.includes('MODICON') || combined.includes('ATV310') || combined.includes('ATV630')) return 'Schneider';
  if (combined.includes('ALLEN BRADLEY') || combined.includes('ALLEN-BRADLEY') || combined.includes('ROCKWELL') || combined.includes('MICROLOGIX') || combined.includes('COMPACTLOGIX') || combined.includes('CONTROLLOGIX') || combined.includes('PANELVIEW') || combined.includes('POWERFLEX') || combined.includes('1756-') || combined.includes('1769-')) return 'Allen Bradley';
  if (combined.includes('ABB') || combined.includes('ACS355') || combined.includes('ACS550') || combined.includes('ACS580') || combined.includes('ACS880')) return 'ABB';
  if (combined.includes('PROFACE') || combined.includes('PRO-FACE') || combined.includes('GP-4') || combined.includes('GP2000') || combined.includes('GP4000')) return 'Proface';
  if (combined.includes('FUJI') || combined.includes('FRENIC') || combined.includes('MONITOUCH')) return 'Fuji';
  if (combined.includes('WEINTEK') || combined.includes('EASYVIEW') || combined.includes('CMT-') || combined.includes('MT8071') || combined.includes('MT8102')) return 'Weintek';
  if (combined.includes('DANFOSS') || combined.includes('VLT') || combined.includes('FC-51') || combined.includes('FC-302')) return 'Danfoss';
  if (combined.includes('YASKAWA') || combined.includes('CIMR') || combined.includes('A1000') || combined.includes('V1000') || combined.includes('J1000') || combined.includes('GA700')) return 'Yaskawa';
  if (combined.includes('SICK') || combined.includes('VTE18') || combined.includes('VT180')) return 'SICK';
  if (combined.includes('IFM') || combined.includes('EFFECTOR')) return 'IFM';
  if (combined.includes('PEPPERL') || combined.includes('P+F') || combined.includes('OBD500') || combined.includes('NBB2') || combined.includes('UB1000')) return 'Pepperl+Fuchs';
  if (combined.includes('PILZ') || combined.includes('PNOZ')) return 'Pilz';
  if (combined.includes('AUTONICS') || combined.includes('E50S') || combined.includes('PR12')) return 'Autonics';
  if (combined.includes('INOVANCE') || combined.includes('MD200') || combined.includes('MD310') || combined.includes('MD500')) return 'Inovance';
  if (combined.includes('PHOENIX') || combined.includes('QUINT') || combined.includes('TRIO-POWER')) return 'Phoenix Contact';
  return 'Industrial Automation';
}

function detectCategory(title, text = '') {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('plc') || combined.includes('programmable logic controller') || combined.includes('cpu') || combined.includes('rack') || combined.includes('base unit')) return 'PLC Systems';
  if (combined.includes('hmi') || combined.includes('touch panel') || combined.includes('display') || combined.includes('ipc') || combined.includes('industrial pc') || combined.includes('screen')) return 'HMI & Touch Panels';
  if (combined.includes('vfd') || combined.includes('ac drive') || combined.includes('inverter') || combined.includes('variable frequency') || combined.includes('servo drive') || combined.includes('drive')) return 'VFD & AC Drives';
  if (combined.includes('sensor') || combined.includes('photoelectric') || combined.includes('proximity') || combined.includes('encoder') || combined.includes('vibration') || combined.includes('temperature') || combined.includes('switch')) return 'Sensors & Encoders';
  if (combined.includes('module') || combined.includes('input') || combined.includes('output') || combined.includes('card') || combined.includes('smps') || combined.includes('power supply') || combined.includes('relay') || combined.includes('cable')) return 'Modules & Accessories';
  return 'PLC Systems';
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function main() {
  console.log("=== MERGING ALL EXACT INDIAMART PRODUCTS FROM SCRAPED DATA & PRODUCT IDS ===");

  const rawData = JSON.parse(fs.readFileSync('scratch/scraped_data.json', 'utf8'));
  const productIds = JSON.parse(fs.readFileSync('scratch/product_ids.json', 'utf8'));

  const catalogMap = new Map();

  // 1. Load scraped_data.json
  for (const idKey of Object.keys(rawData)) {
    const item = rawData[idKey];

    let title = item.title || '';
    if (!title && item.specifications) {
      const modelSpec = item.specifications.find(s => s.label && s.label.toLowerCase().includes('model'));
      if (modelSpec) title = modelSpec.value;
    }
    if (!title && item.description) title = item.description.split('\n')[0];

    title = cleanText(title)
      .replace(/^Description\s*:\s*/i, '')
      .replace(/&trade;/gi, '')
      .replace(/&reg;/gi, '')
      .replace(/&ndash;/gi, '-')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&nbsp;/gi, ' ');

    if (!title || title.length < 3) continue;

    const specsObj = {};
    if (Array.isArray(item.specifications)) {
      item.specifications.forEach(s => {
        if (s.label && s.value) specsObj[cleanText(s.label)] = cleanText(s.value);
      });
    }

    const brand = detectBrand(title, item.description || '', specsObj);
    const category = detectCategory(title, item.description || '');
    const modelCode = extractModelCode(title, specsObj) || idKey;

    let img = Array.isArray(item.images) ? item.images[0] : item.image;
    if (img && img.includes('imimg.com')) {
      img = img.replace(/-125x125\./g, '-1000x1000.').replace(/-250x250\./g, '-1000x1000.').replace(/-500x500\./g, '-1000x1000.');
    }
    if (!img || img.endsWith('.js') || img.endsWith('.css')) {
      img = 'https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg';
    }

    let priceStr = item.price ? cleanText(item.price) : 'Contact for Price';
    let priceNum = 0;
    if (priceStr.includes('₹')) {
      const digits = priceStr.replace(/[^0-9]/g, '');
      if (digits) priceNum = parseInt(digits, 10);
    }

    if (!specsObj["Brand"]) specsObj["Brand"] = brand;
    if (!specsObj["Model"]) specsObj["Model"] = modelCode;
    if (!specsObj["Warranty"]) specsObj["Warranty"] = "12 Months Warranty";

    const slug = slugify(title);

    catalogMap.set(idKey, {
      id: idKey,
      name: title,
      title: title,
      partNumber: modelCode,
      brand,
      category,
      type: category.split(' ')[0],
      price: priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Contact for Price',
      priceNumeric: priceNum,
      description: cleanText(item.description) || `${brand} ${title} industrial component. Genuine original hardware supplied with 12 months warranty and technical support by Concept Automation Technologies.`,
      specs: specsObj,
      specifications: Object.entries(specsObj).map(([label, value]) => ({ label, value })),
      image: img,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [img],
      slug,
      stock: true,
      inStock: true,
      rating: 4.85 + Math.round(Math.random() * 2) / 20
    });
  }

  // 2. Add any items from product_ids.json that are missing
  let addedFromProductIds = 0;
  for (const item of productIds) {
    const rawId = item.catalogId || `im-${item.indiamartId}`;
    if (!catalogMap.has(rawId) && item.name) {
      const title = cleanText(item.name);
      const brand = detectBrand(title);
      const category = detectCategory(title);
      const modelCode = extractModelCode(title);
      const slug = slugify(title);

      addedFromProductIds++;
      catalogMap.set(rawId, {
        id: rawId,
        name: title,
        title: title,
        partNumber: modelCode || title.slice(0, 30),
        brand,
        category,
        type: category.split(' ')[0],
        price: item.price ? cleanText(item.price) : 'Contact for Price',
        priceNumeric: 0,
        description: `${brand} ${title} industrial component. Genuine original hardware supplied with 12 months warranty and technical support by Concept Automation Technologies.`,
        specs: {
          "Brand": brand,
          "Model": modelCode || title.slice(0, 30),
          "Condition": "100% Genuine Original",
          "Availability": "In Stock Ahmedabad",
          "Warranty": "12 Months Warranty"
        },
        specifications: [
          { label: "Brand", value: brand },
          { label: "Model", value: modelCode || title.slice(0, 30) }
        ],
        image: item.image || 'https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg',
        images: [item.image || 'https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg'],
        slug,
        stock: true,
        inStock: true,
        rating: 4.9
      });
    }
  }

  console.log(`Added ${addedFromProductIds} missing products from product_ids.json.`);

  console.log(`\n=================================================`);
  console.log(`EXACT TOTAL INDIAMART PRODUCTS: ${catalogMap.size} PRODUCTS`);
  console.log(`=================================================`);

  const formattedProducts = Array.from(catalogMap.values()).map((p, idx) => ({
    ...p,
    featured: idx < 8
  }));

  const brandSet = new Set();
  formattedProducts.forEach(p => brandSet.add(p.brand));
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

export const PRODUCTS: Product[] = ${JSON.stringify(formattedProducts, null, 2)};

export const allProducts: Product[] = PRODUCTS;
`;

  fs.writeFileSync('src/data/catalog.ts', finalTsCode, 'utf8');
  console.log(`Successfully updated src/data/catalog.ts with ${formattedProducts.length} exact IndiaMart products!`);
}

main();
