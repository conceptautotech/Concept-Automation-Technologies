const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function fetchUrl(url, isDesktop = false) {
  return new Promise((resolve) => {
    const userAgent = isDesktop
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      : 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

    const req = https.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 15000
    }, (res) => {
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());

      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', () => resolve({ status: 500, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 508, body: '' }); });
  });
}

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

async function mapConcurrent(items, limit, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      try {
        results[i] = await fn(items[i], i);
      } catch (err) {
        results[i] = null;
      }
    }
  }
  const workers = Array(Math.min(limit, items.length)).fill(0).map(() => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log("=== MERGING INDIAMART (465) + CONCEPTAUTOTECH SITEMAP ===");

  const catalogTs = fs.readFileSync('src/data/catalog.ts', 'utf8');
  const startIdx = catalogTs.indexOf('export const PRODUCTS: Product[] = [');
  const jsonText = catalogTs.substring(startIdx + 'export const PRODUCTS: Product[] = '.length, catalogTs.lastIndexOf(';') > catalogTs.lastIndexOf(']') ? catalogTs.lastIndexOf(';') : catalogTs.length).trim();
  
  const existingProducts = JSON.parse(jsonText);

  const catalogMap = new Map();
  for (const p of existingProducts) {
    const slug = slugify(p.title);
    catalogMap.set(slug, p);
  }

  console.log(`Starting with ${catalogMap.size} existing IndiaMart products.`);

  // Crawl conceptautotech sitemap using desktop headers
  const smRes = await fetchUrl('https://www.conceptautotech.com/sitemap.xml', true);
  if (smRes.body) {
    const urls = (smRes.body.match(/<loc>(.*?)<\/loc>/g) || []).map(u => u.replace(/<\/?loc>/g, ''));
    console.log(`Crawling ${urls.length} conceptautotech.com sitemap pages...`);

    let tistaticCount = 0;
    await mapConcurrent(urls, 25, async (pUrl) => {
      if (pUrl.includes('company-profile') || pUrl.includes('contact-us') || pUrl === 'https://www.conceptautotech.com/') return;

      const pRes = await fetchUrl(pUrl, true);
      if (!pRes.body) return;
      const html = pRes.body;

      const imgRegex = /<img[^>]+src="(https:\/\/[^"]*tistatic\.com\/[^"]+)"[^>]*alt="([^"]+)"/gi;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(html)) !== null) {
        const imgUrl = imgMatch[1];
        const rawAlt = cleanText(imgMatch[2]);

        if (imgUrl.includes('hamburger') || imgUrl.includes('whatsapp') || imgUrl.includes('trusted') || imgUrl.includes('logo')) continue;

        if (rawAlt.length > 3) {
          const slug = slugify(rawAlt);
          if (!catalogMap.has(slug)) {
            const brand = detectBrand(rawAlt);
            const category = detectCategory(rawAlt);
            const partNumber = extractPartNumber(rawAlt);

            tistaticCount++;
            catalogMap.set(slug, {
              id: slug,
              title: rawAlt,
              partNumber,
              brand,
              category,
              price: 'Contact for Price',
              priceNumeric: 0,
              description: `${brand} ${rawAlt} supplied with 100% quality guarantee and 12 months warranty by Concept Automation Technologies.`,
              specs: {
                "Brand": brand,
                "Model": partNumber,
                "Condition": "100% Genuine Original",
                "Availability": "In Stock",
                "Warranty": "12 Months Warranty"
              },
              image: imgUrl,
              inStock: true,
              rating: 4.9
            });
          }
        }
      }
    });

    console.log(`conceptautotech.com: Extracted ${tistaticCount} new products with authentic tistatic photos.`);
  }

  console.log(`\n=================================================`);
  console.log(`GRAND TOTAL COMBINED AUTHENTIC CATALOG SIZE: ${catalogMap.size}`);
  console.log(`=================================================`);

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
  console.log(`Successfully updated src/data/catalog.ts with ${productsList.length} total authentic products!`);
}

main();
