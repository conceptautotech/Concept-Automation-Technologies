const fs = require('fs');
const path = require('path');

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function detectBrand(title, text = '', specs = []) {
  let combined = `${title} ${text}`.toUpperCase();
  if (Array.isArray(specs)) {
    specs.forEach(s => combined += ` ${s.label} ${s.value}`.toUpperCase());
  }

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

function extractPartNumber(title, specs = []) {
  // Check specs for model
  if (Array.isArray(specs)) {
    for (const s of specs) {
      if (s.label && s.label.toLowerCase().includes('model')) {
        const val = cleanText(s.value);
        if (val.length > 2) return val.toUpperCase();
      }
    }
  }
  const match = title.match(/\b([A-Z0-9]{3,}[-\/][A-Z0-9\/-]+|[0-9][A-Z0-9]{5,})\b/i);
  if (match) return match[1].toUpperCase();
  return title.slice(0, 35);
}

function main() {
  console.log("=== PROCESSING SCRAPED_DATA.JSON (522 INDIAMART PRODUCTS) ===");
  const rawData = JSON.parse(fs.readFileSync('scratch/scraped_data.json', 'utf8'));

  const catalogMap = new Map();

  for (const key of Object.keys(rawData)) {
    const item = rawData[key];
    
    // Extract title from item or model name
    let title = '';
    if (item.title) title = item.title;
    else if (item.specifications) {
      const modelSpec = item.specifications.find(s => s.label && s.label.toLowerCase().includes('model'));
      if (modelSpec) title = modelSpec.value;
    }
    if (!title && item.description) {
      title = item.description.split('\n')[0];
    }
    title = cleanText(title);
    if (!title || title.length < 3) continue;

    // Extract image
    let image = '';
    if (Array.isArray(item.images) && item.images.length > 0) {
      const validImg = item.images.find(img => img.includes('.jpg') || img.includes('.jpeg') || img.includes('.png') || img.includes('.webp'));
      image = validImg || item.images[0];
    } else if (item.image) {
      image = item.image;
    }

    if (image.includes('imimg.com')) {
      image = image.replace(/-125x125\./g, '-1000x1000.').replace(/-250x250\./g, '-1000x1000.').replace(/-500x500\./g, '-1000x1000.');
    }

    if (!image || image.endsWith('.js') || image.endsWith('.css')) continue;

    const brand = detectBrand(title, item.description || '', item.specifications);
    const category = detectCategory(title, item.description || '');
    const partNumber = extractPartNumber(title, item.specifications);

    const priceStr = item.price ? cleanText(item.price) : 'Contact for Price';
    let priceNum = 0;
    if (priceStr.includes('₹')) {
      const digits = priceStr.replace(/[^0-9]/g, '');
      if (digits) priceNum = parseInt(digits, 10);
    }

    const specsObj = {};
    if (Array.isArray(item.specifications)) {
      item.specifications.forEach(s => {
        if (s.label && s.value) {
          specsObj[cleanText(s.label)] = cleanText(s.value);
        }
      });
    }
    if (!specsObj["Brand"]) specsObj["Brand"] = brand;
    if (!specsObj["Model"]) specsObj["Model"] = partNumber;
    if (!specsObj["Warranty"]) specsObj["Warranty"] = "12 Months Warranty";

    const slug = slugify(title);
    if (!catalogMap.has(slug)) {
      catalogMap.set(slug, {
        id: key,
        title,
        partNumber,
        brand,
        category,
        price: priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Contact for Price',
        priceNumeric: priceNum,
        description: cleanText(item.description) || `${brand} ${title} high quality industrial automation component supplied with full warranty and technical support by Concept Automation Technologies.`,
        specs: specsObj,
        image,
        inStock: true,
        rating: 4.8 + Math.round(Math.random() * 2) / 10
      });
    }
  }

  console.log(`Successfully converted ${catalogMap.size} products from scraped_data.json!`);

  // ALSO Merge any backup products from catalog.ts.backup_full_indiamart
  if (fs.existsSync('src/data/catalog.ts.backup_full_indiamart')) {
    const backupTxt = fs.readFileSync('src/data/catalog.ts.backup_full_indiamart', 'utf8');
    const jsonStr = backupTxt.substring(backupTxt.indexOf('['), backupTxt.lastIndexOf(']') + 1);
    try {
      const backupProducts = JSON.parse(jsonStr);
      console.log(`Merging ${backupProducts.length} items from backup_full_indiamart...`);
      let addedFromBackup = 0;
      for (const bp of backupProducts) {
        const slug = slugify(bp.title);
        if (!catalogMap.has(slug)) {
          addedFromBackup++;
          catalogMap.set(slug, bp);
        }
      }
      console.log(`Added ${addedFromBackup} unique products from backup.`);
    } catch (e) {
      console.log("Backup parse note:", e.message);
    }
  }

  const productsList = Array.from(catalogMap.values());
  console.log(`TOTAL MASTER CATALOG PRODUCTS: ${productsList.length}`);

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

main();
