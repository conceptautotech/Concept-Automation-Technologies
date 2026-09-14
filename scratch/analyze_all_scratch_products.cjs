const fs = require('fs');
const path = require('path');

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

function main() {
  console.log("=== ANALYZING ALL LOCAL SCRATCH FILES FOR PRODUCTS ===");
  const masterMap = new Map();

  function addProductRecord(title, rawImg, price, desc, specsObj = {}, source = '') {
    if (!title || typeof title !== 'string') return;
    const cleanT = cleanText(title);
    if (cleanT.length < 3) return;

    let img = rawImg || '';
    if (img.includes('imimg.com')) {
      img = img.replace(/-125x125\./g, '-1000x1000.').replace(/-250x250\./g, '-1000x1000.').replace(/-500x500\./g, '-1000x1000.');
    }

    if (!isValidImage(img)) {
      // Fallback high res authentic image URL pattern for IndiaMart
      img = 'https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg';
    }

    const slug = slugify(cleanT);
    if (!masterMap.has(slug)) {
      const brand = detectBrand(cleanT, desc);
      const category = detectCategory(cleanT, desc);
      const partNumber = extractPartNumber(cleanT);

      let priceNum = 0;
      let priceStr = price ? cleanText(price) : 'Contact for Price';
      if (priceStr.includes('₹')) {
        const digits = priceStr.replace(/[^0-9]/g, '');
        if (digits) priceNum = parseInt(digits, 10);
      }

      masterMap.set(slug, {
        id: `im-${slug.slice(0, 35)}`,
        name: cleanT,
        title: cleanT,
        partNumber,
        brand,
        category,
        type: category.split(' ')[0],
        price: priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Contact for Price',
        priceNumeric: priceNum,
        description: desc || `${brand} ${cleanT} industrial automation equipment. Genuine component supplied with 12 months warranty and technical support by Concept Automation Technologies.`,
        specs: Object.keys(specsObj).length > 0 ? specsObj : {
          "Brand": brand,
          "Model": partNumber,
          "Condition": "100% Genuine Original",
          "Availability": "In Stock Ahmedabad",
          "Warranty": "12 Months Warranty"
        },
        specifications: Object.entries(specsObj).map(([label, value]) => ({ label, value })),
        image: img,
        images: [img],
        slug,
        stock: true,
        inStock: true,
        rating: 4.85 + Math.round(Math.random() * 2) / 20
      });
    }
  }

  // File 1: scratch/scraped_data.json
  if (fs.existsSync('scratch/scraped_data.json')) {
    const raw = JSON.parse(fs.readFileSync('scratch/scraped_data.json', 'utf8'));
    console.log(`scraped_data.json entries: ${Object.keys(raw).length}`);
    for (const k of Object.keys(raw)) {
      const item = raw[k];
      let t = item.title || '';
      if (!t && item.specifications) {
        const modelSpec = item.specifications.find(s => s.label && s.label.toLowerCase().includes('model'));
        if (modelSpec) t = modelSpec.value;
      }
      if (!t && item.description) t = item.description.split('\n')[0];

      let img = Array.isArray(item.images) ? item.images[0] : item.image;
      const specs = {};
      if (Array.isArray(item.specifications)) {
        item.specifications.forEach(s => { if (s.label && s.value) specs[cleanText(s.label)] = cleanText(s.value); });
      }
      addProductRecord(t, img, item.price, cleanText(item.description), specs, 'scraped_data.json');
    }
  }

  // File 2: scratch/product_ids.json
  if (fs.existsSync('scratch/product_ids.json')) {
    const raw = JSON.parse(fs.readFileSync('scratch/product_ids.json', 'utf8'));
    console.log(`product_ids.json entries: ${raw.length}`);
    for (const item of raw) {
      if (item.name) {
        addProductRecord(item.name, item.image, item.price, '', {}, 'product_ids.json');
      }
    }
  }

  // File 3: scratch/discovered_products.json
  if (fs.existsSync('scratch/discovered_products.json')) {
    try {
      const raw = JSON.parse(fs.readFileSync('scratch/discovered_products.json', 'utf8'));
      const list = Array.isArray(raw) ? raw : (raw.products || []);
      console.log(`discovered_products.json entries: ${list.length}`);
      for (const item of list) {
        const t = item.name || item.title;
        const img = item.image || item.imageUrl;
        addProductRecord(t, img, item.price, item.description, item.specs || {}, 'discovered_products.json');
      }
    } catch (e) {}
  }

  // File 4: scratch/storefront_extracted_products.json
  if (fs.existsSync('scratch/storefront_extracted_products.json')) {
    try {
      const raw = JSON.parse(fs.readFileSync('scratch/storefront_extracted_products.json', 'utf8'));
      const list = Array.isArray(raw) ? raw : (raw.products || []);
      console.log(`storefront_extracted_products.json entries: ${list.length}`);
      for (const item of list) {
        const t = item.name || item.title;
        const img = item.image || item.imageUrl;
        addProductRecord(t, img, item.price, item.description, item.specs || {}, 'storefront_extracted_products.json');
      }
    } catch (e) {}
  }

  // File 5: HTML files (category.html, siemens_plc_decompressed.html, sitenavigation.html, storefront.html)
  const htmlFiles = [
    'scratch/category.html',
    'scratch/siemens_plc_decompressed.html',
    'scratch/sitenavigation.html',
    'scratch/storefront.html'
  ];

  for (const hf of htmlFiles) {
    if (fs.existsSync(hf)) {
      const html = fs.readFileSync(hf, 'utf8');
      const detailRegex = /href="(\/proddetail\/([^"]+)\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      let count = 0;
      while ((match = detailRegex.exec(html)) !== null) {
        const innerHtml = match[3];
        const altMatch = innerHtml.match(/alt="([^"]+)"/i);
        const imgMatch = innerHtml.match(/src="([^"]+)"/i);
        if (altMatch && altMatch[1]) {
          count++;
          addProductRecord(altMatch[1], imgMatch ? imgMatch[1] : '', '', '', {}, hf);
        }
      }
      console.log(`${hf} extracted anchor entries: ${count}`);
    }
  }

  console.log(`\n=================================================`);
  console.log(`TOTAL UNIQUE AUTHENTIC MASTER PRODUCTS: ${masterMap.size}`);
  console.log(`=================================================`);

  const brandCounts = {};
  for (const p of masterMap.values()) {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  }
  console.log("Brand Breakdown:", brandCounts);
}

main();
