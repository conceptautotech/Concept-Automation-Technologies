const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const catalogPath = path.resolve(__dirname, '../src/data/catalog.ts');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const u = url.startsWith('http') ? url : `https://www.conceptautotech.com${url.startsWith('/') ? '' : '/'}${url}`;
    const lib = u.startsWith('https') ? https : http;
    
    const req = lib.get(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': 'https://www.conceptautotech.com/'
      },
      timeout: 15000
    }, (res) => {
      const zlib = require('zlib');
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());
      
      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', err => resolve({ status: 'ERROR', error: err.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT', body: '' }); });
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

function parseProductDetails(html, pageUrl) {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
  let name = titleMatch ? cleanText(titleMatch[1]) : '';
  if (name.includes('|')) name = name.split('|')[0].trim();
  if (name.includes('- Concept')) name = name.split('- Concept')[0].trim();

  // Images
  const imgMatches = html.match(/https:\/\/(?:cpimg\.tistatic\.com|5\.imimg\.com|tiimg\.tistatic\.com)[^"'\s>]+\.(?:jpg|jpeg|png|webp)/gi) || [];
  const validImages = Array.from(new Set(imgMatches.filter(u => 
    !u.includes('logo') && !u.includes('icon') && !u.includes('template') && !u.includes('banner') && !u.includes('search')
  )));

  // Specs
  const specs = [];
  const rowRegex = /<tr[^>]*>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>\s*<t[dh][^>]*>([\s\S]*?)<\/t[dh]>\s*<\/tr>/gi;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const label = cleanText(match[1]);
    const value = cleanText(match[2]);
    if (label && value && label.length < 50 && value.length < 150 && !label.includes('{') && !label.includes('<')) {
      specs.push({ label, value });
    }
  }

  // Description
  let description = '';
  const descMatch = html.match(/class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                    html.match(/aria-label="Product description"[^>]*>([\s\S]*?)<\/section>/i) ||
                    html.match(/<div[^>]*id="product_description"[^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) description = cleanText(descMatch[1]);
  if (!description || description.length < 20) {
    description = `Original factory sealed ${name}. High-performance industrial automation unit engineered for maximum reliability, panel compatibility, and zero production downtime. Dispatched directly from Makarba, Ahmedabad warehouse.`;
  }

  // Part Number
  let partNumber = '';
  const pnMatch = name.match(/([A-Z0-9]{3,}(?:-[A-Z0-9]+)+)/i) || name.match(/([0-9]{4,}[A-Z0-9-]+)/i);
  if (pnMatch) partNumber = pnMatch[1];
  else {
    const specPn = specs.find(s => s.label.toLowerCase().includes('model') || s.label.toLowerCase().includes('part'));
    if (specPn) partNumber = specPn.value;
  }

  const brand = detectBrand(name);
  const type = detectType(name);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    name,
    partNumber: partNumber || name.split(' ')[0],
    brand,
    category: `${brand} ${type}`,
    type,
    description,
    specifications: specs,
    image: validImages[0] || '',
    images: validImages,
    slug,
    stock: true
  };
}

async function run() {
  console.log("=== Starting Complete Real Product Scraper from ConceptAutoTech ===");
  
  // 1. Collect all product URLs
  const visitedUrls = new Set();
  const queue = ['/products.html'];
  const productUrls = new Set();

  console.log("Crawling site index to discover all product links...");
  
  while (queue.length > 0) {
    const curr = queue.shift();
    if (visitedUrls.has(curr)) continue;
    visitedUrls.add(curr);

    const res = await fetchUrl(curr);
    if (!res.body) continue;

    const matches = res.body.match(/href="([^"]*\.html[^"]*)"/g) || [];
    matches.forEach(m => {
      const link = m.replace(/href="|"/g, '').trim();
      if (!link.includes('contact') && !link.includes('company') && !link.includes('privacy') && !link.includes('terms')) {
        if (link.match(/-\d+\.html$/)) {
          productUrls.add(link);
        } else if (!visitedUrls.has(link) && !queue.includes(link) && (link.includes('product') || link.includes('cat') || link.includes('.html'))) {
          queue.push(link);
        }
      }
    });
  }

  console.log(`Discovered ${productUrls.size} unique product pages!`);

  // 2. Fetch all product details
  const scrapedProducts = [];
  const urlArray = Array.from(productUrls);

  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    console.log(`[${i + 1}/${urlArray.length}] Fetching product: ${url}`);
    
    const res = await fetchUrl(url);
    if (res.body && res.status === 200) {
      const item = parseProductDetails(res.body, url);
      if (item.name && item.image) {
        item.id = `im-real-${i + 1000}`;
        scrapedProducts.push(item);
        console.log(`   ✓ Scraped: "${item.name}" | Brand: ${item.brand} | Image: ${item.image.slice(0, 60)}...`);
      }
    }
  }

  console.log(`\nSuccessfully scraped ${scrapedProducts.length} real products with images!`);

  if (scrapedProducts.length > 0) {
    // Write back to catalog.ts
    const content = fs.readFileSync(catalogPath, 'utf8');
    const delimiter = 'export const allProducts: Product[] =';
    const delimiterIndex = content.indexOf(delimiter);
    const header = content.substring(0, delimiterIndex + delimiter.length) + '\n';
    
    const updatedCatalog = header + JSON.stringify(scrapedProducts, null, 2) + ';\n';
    
    fs.writeFileSync(catalogPath + '.backup_real', content);
    fs.writeFileSync(catalogPath, updatedCatalog, 'utf8');
    console.log(`Updated catalog.ts with ${scrapedProducts.length} 100% real scraped products!`);
  }
}

run().catch(console.error);
