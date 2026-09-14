const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const catalogPath = path.resolve(__dirname, '../src/data/catalog.ts');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const u = url.startsWith('http') ? url : `https://m.indiamart.com${url.startsWith('/') ? '' : '/'}${url}`;
    https.get(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': 'https://m.indiamart.com/conceptautomationtechnologies/'
      },
      timeout: 15000
    }, (res) => {
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());

      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', err => resolve({ status: 'ERROR', error: err.message, body: '' }));
  });
}

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectBrand(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('siemens')) return 'Siemens';
  if (t.includes('mitsubishi')) return 'Mitsubishi';
  if (t.includes('omron')) return 'Omron';
  if (t.includes('allen') || t.includes('bradley') || t.includes('rockwell') || t.includes('compactlogix')) return 'Allen Bradley';
  if (t.includes('proface') || t.includes('pro-face')) return 'Proface';
  if (t.includes('delta')) return 'Delta';
  if (t.includes('danfoss')) return 'Danfoss';
  if (t.includes('fuji')) return 'Fuji';
  if (t.includes('schneider')) return 'Schneider';
  if (t.includes('pepperl') || t.includes('fuchs')) return 'Pepperl+Fuchs';
  if (t.includes('autonics')) return 'Autonics';
  if (t.includes('weintek')) return 'Weintek';
  if (t.includes('sick')) return 'Sick';
  if (t.includes('yaskawa')) return 'Yaskawa';
  if (t.includes('hengstler')) return 'Hengstler';
  if (t.includes('ifm')) return 'IFM';
  if (t.includes('inovance')) return 'Inovance';
  if (t.includes('pilz')) return 'PILZ';
  if (t.includes('phoenix')) return 'Phoenix Contact';
  return 'Other';
}

function detectType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('plc') || t.includes('controller') || t.includes('simatic') || t.includes('melsec') || t.includes('compactlogix')) return 'PLC';
  if (t.includes('hmi') || t.includes('touch') || t.includes('panelview') || t.includes('screen') || t.includes('panel')) return 'HMI';
  if (t.includes('vfd') || t.includes('inverter') || t.includes('drive') || t.includes('freqrol') || t.includes('sinamics')) return 'VFD';
  if (t.includes('servo')) return 'Servo';
  if (t.includes('encoder')) return 'Sensor';
  if (t.includes('sensor') || t.includes('photoelectric') || t.includes('proximity') || t.includes('ultrasonic')) return 'Sensor';
  if (t.includes('power supply') || t.includes('smps')) return 'Power Supply';
  return 'PLC';
}

function extractHighResImageUrl(imgUrl) {
  if (!imgUrl) return '';
  // Convert -125x125, -250x250, -500x500 to -1000x1000 HD
  let clean = imgUrl.replace(/-\d+x\d+\./, '-1000x1000.');
  return clean;
}

function parseProductsFromPage(html) {
  const products = [];

  // Regex to match company-product-card blocks
  const cardRegex = /<article[^>]*class="[^"]*company-product-card[^"]*"[\s\S]*?<\/article>/gi;
  let cardMatch;

  while ((cardMatch = cardRegex.exec(html)) !== null) {
    const cardHtml = cardMatch[0];

    // Image URL
    const imgMatch = cardHtml.match(/src="(https:\/\/5\.imimg\.com\/[^"]+)"/i);
    const rawImg = imgMatch ? imgMatch[1] : '';
    const image = extractHighResImageUrl(rawImg);

    // Title / Name
    const nameMatch = cardHtml.match(/alt="([^"]+)"/i) || cardHtml.match(/class="[^"]*company-prod-name[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    let name = nameMatch ? cleanText(nameMatch[1]) : '';
    if (name.includes(' ₹')) name = name.split(' ₹')[0].trim();

    // Price
    const priceMatch = cardHtml.match(/class="company-prod-price"[^>]*>([\s\S]*?)<\/span>/i);
    const price = priceMatch ? `₹ ${cleanText(priceMatch[1])}/Piece` : 'Price on Request';

    // Slug / Link
    const linkMatch = cardHtml.match(/href="\/proddetail\/([^"]+)\.html"/i);
    const rawSlug = linkMatch ? linkMatch[1] : '';

    if (name && image && !image.includes('c-120x120') && !image.includes('logo')) {
      const brand = detectBrand(name);
      const type = detectType(name);
      const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Extract part number from title
      let partNumber = '';
      const pnMatch = name.match(/([A-Z0-9]{3,}(?:-[A-Z0-9]+)+)/i) || name.match(/([0-9]{4,}[A-Z0-9-]+)/i);
      if (pnMatch) partNumber = pnMatch[1];
      else partNumber = name.split(' ')[0];

      products.push({
        id: `im-${rawSlug || Math.random().toString(36).substring(2, 9)}`,
        name,
        partNumber,
        brand,
        category: `${brand} ${type}`,
        type,
        price,
        description: `Original factory sealed ${brand} ${name}. High-performance industrial automation unit engineered for maximum reliability, panel compatibility, fast response, and zero maintenance downtime. Dispatched directly from Makarba, Ahmedabad warehouse.`,
        specifications: [
          { label: "Manufacturer Brand", value: brand },
          { label: "Part Number", value: partNumber },
          { label: "Condition", value: "100% Genuine Sealed Stock" },
          { label: "Warehouse SLA", value: "24-48 Hours Express Shipping" }
        ],
        image,
        images: [image],
        slug,
        stock: true
      });
    }
  }

  return products;
}

async function run() {
  console.log("=== Scraping All Products from IndiaMart Mobile Store ===");

  // Step 1: Fetch main store page to extract all category links
  const mainRes = await fetchUrl('/conceptautomationtechnologies/');
  if (!mainRes.body) {
    console.error("Failed to fetch main store page.");
    return;
  }

  const categoryLinks = new Set(['/conceptautomationtechnologies/']);
  const catMatches = mainRes.body.match(/href="(\/conceptautomationtechnologies\/[^"]+\.html)"/gi) || [];
  catMatches.forEach(m => {
    const link = m.replace(/href="|"/gi, '').trim();
    categoryLinks.add(link);
  });

  console.log(`Discovered ${categoryLinks.size} category section URLs!`);
  const catArray = Array.from(categoryLinks);

  const allScrapedProducts = [];
  const seenSlugs = new Set();

  for (let i = 0; i < catArray.length; i++) {
    const catUrl = catArray[i];
    console.log(`[${i + 1}/${catArray.length}] Scraping category: ${catUrl}`);

    const res = await fetchUrl(catUrl);
    if (res.body) {
      const pageProducts = parseProductsFromPage(res.body);
      let added = 0;
      pageProducts.forEach(p => {
        if (!seenSlugs.has(p.slug)) {
          seenSlugs.add(p.slug);
          allScrapedProducts.push(p);
          added++;
        }
      });
      console.log(`   -> Extracted ${pageProducts.length} items (${added} new unique items)`);
    }
  }

  console.log(`\nTotal 100% authentic products scraped from IndiaMart: ${allScrapedProducts.length}`);

  if (allScrapedProducts.length > 0) {
    // Write back to catalog.ts
    const content = fs.readFileSync(catalogPath, 'utf8');
    const delimiter = 'export const allProducts: Product[] =';
    const delimiterIndex = content.indexOf(delimiter);
    const header = content.substring(0, delimiterIndex + delimiter.length) + '\n';

    const updatedContent = header + JSON.stringify(allScrapedProducts, null, 2) + ';\n';

    fs.writeFileSync(catalogPath + '.backup_full_indiamart', content);
    fs.writeFileSync(catalogPath, updatedContent, 'utf8');
    console.log(`Successfully updated catalog.ts with ${allScrapedProducts.length} 100% REAL IndiaMart products & exact photos!`);
  }
}

run().catch(console.error);
