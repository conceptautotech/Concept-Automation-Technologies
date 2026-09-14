const fs = require('fs');
const path = require('path');

const https = require('https');
const http = require('http');
const zlib = require('zlib');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const parsed = new URL(url);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        return fetchUrl(redirectUrl).then(resolve);
      }
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

async function run() {
  const catalogMap = new Map();

  const imCategoryPaths = [
    '/conceptautomationtechnologies/mitsubishi-plc.html',
    '/conceptautomationtechnologies/siemens-plc.html',
    '/conceptautomationtechnologies/mitsubishi-programmable-logic-controller.html',
    '/conceptautomationtechnologies/siemens-cpu.html',
    '/conceptautomationtechnologies/proface-hmi.html',
    '/conceptautomationtechnologies/fuji-ac-drive.html',
    '/conceptautomationtechnologies/danfoss-vfd.html',
    '/conceptautomationtechnologies/allen-bradley-vfd.html',
    '/conceptautomationtechnologies/abb-vfd.html',
    '/conceptautomationtechnologies/pepperl-and-fuchs-sensors.html',
    '/conceptautomationtechnologies/siemens-hmi.html',
    '/conceptautomationtechnologies/allen-bradley-plc.html',
    '/conceptautomationtechnologies/mitsubishi-hmi.html',
    '/conceptautomationtechnologies/schneider-drives.html',
    '/conceptautomationtechnologies/siemens-vfd.html',
    '/conceptautomationtechnologies/weintek-hmi.html',
    '/conceptautomationtechnologies/omron-photoelectric-sensor.html',
    '/conceptautomationtechnologies/omron-hmi.html',
    '/conceptautomationtechnologies/ifm-sensor.html',
    '/conceptautomationtechnologies/mitsubishi-servo-drives.html',
    '/conceptautomationtechnologies/encoder.html',
    '/conceptautomationtechnologies/delta-hmi.html',
    '/conceptautomationtechnologies/phoenix-contact.html',
    '/conceptautomationtechnologies/pilz-safety-relay.html',
    '/conceptautomationtechnologies/ifm-temperature-sensor.html',
    '/conceptautomationtechnologies/siemens-servo-drive.html',
    '/conceptautomationtechnologies/phtoelectric-sensor.html',
    '/conceptautomationtechnologies/omron-plc.html',
    '/conceptautomationtechnologies/photoelectric-sensor.html',
    '/conceptautomationtechnologies/fuji-drives.html',
    '/conceptautomationtechnologies/sick-photoelectric-sensor.html',
    '/conceptautomationtechnologies/fuji-hmi.html',
    '/conceptautomationtechnologies/omron-vfd.html',
    '/conceptautomationtechnologies/rotary-encoder.html',
    '/conceptautomationtechnologies/autonics-rotary-encoder.html',
    '/conceptautomationtechnologies/presage-vibration-sensor.html',
    '/conceptautomationtechnologies/ifm-io-link-master.html',
    '/conceptautomationtechnologies/schneider-plc.html',
    '/conceptautomationtechnologies/shaft-encoder.html',
    '/conceptautomationtechnologies/mitsubishi-vfd.html',
    '/conceptautomationtechnologies/delta-plc.html',
    '/conceptautomationtechnologies/yaskawa-ac-drives.html',
    '/conceptautomationtechnologies/allen-bradley-hmi.html',
    '/conceptautomationtechnologies/schneider-vfd.html',
    '/conceptautomationtechnologies/input-and-output-module.html',
    '/conceptautomationtechnologies/inovance-vfd.html',
    '/conceptautomationtechnologies/siemens-servo-motors.html',
    '/conceptautomationtechnologies/siemens-ipc.html',
    '/conceptautomationtechnologies/ethernet-switch.html',
    '/conceptautomationtechnologies/sensor.html'
  ];

  console.log(`Scraping ${imCategoryPaths.length} IndiaMart mobile category pages...`);
  await mapConcurrent(imCategoryPaths, 15, async (catPath) => {
    const url = `https://m.indiamart.com${catPath}`;
    const res = await fetchUrl(url);
    if (!res.body) return;
    const html = res.body;

    const detailRegex = /<a[^>]*href="(\/proddetail\/([^"]+)\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = detailRegex.exec(html)) !== null) {
      const href = match[1];
      const prodId = match[2];
      const innerHtml = match[3];

      const altMatch = innerHtml.match(/alt="([^"]+)"/i);
      const imgMatch = innerHtml.match(/src="([^"]+)"/i);

      if (altMatch && altMatch[1]) {
        let rawTitle = cleanText(altMatch[1]);
        if (rawTitle.includes('₹')) rawTitle = rawTitle.split('₹')[0].trim();

        let priceNum = 0;
        if (altMatch[1].includes('₹')) {
          const digits = altMatch[1].split('₹')[1].replace(/[^0-9]/g, '');
          if (digits) priceNum = parseInt(digits, 10);
        }

        let imgUrl = imgMatch ? imgMatch[1] : '';
        if (imgUrl.includes('imimg.com')) {
          imgUrl = imgUrl.replace(/-125x125\./g, '-1000x1000.').replace(/-250x250\./g, '-1000x1000.').replace(/-500x500\./g, '-1000x1000.');
        }

        if (rawTitle.length > 3 && imgUrl && !catalogMap.has(prodId)) {
          const brand = detectBrand(rawTitle);
          const category = detectCategory(rawTitle);
          const partNumber = extractPartNumber(rawTitle);

          catalogMap.set(prodId, {
            id: prodId,
            title: rawTitle,
            partNumber,
            brand,
            category,
            price: priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Contact for Price',
            priceNumeric: priceNum,
            description: `${brand} ${rawTitle} industrial equipment. Genuine factory-sealed component supplied with full warranty and technical support by Concept Automation Technologies.`,
            specs: {
              "Brand": brand,
              "Model": partNumber,
              "Condition": "100% Original Genuine",
              "Availability": "In Stock Ahmedabad",
              "Warranty": "12 Months Warranty"
            },
            image: imgUrl,
            inStock: true,
            rating: 4.8 + Math.round(Math.random() * 2) / 10,
            detailUrl: `https://m.indiamart.com${href}`
          });
        }
      }
    }
  });

  console.log(`IndiaMart Extracted: ${catalogMap.size} unique products.`);

  console.log("Scraping conceptautotech.com sitemap...");
  const smRes = await fetchUrl('https://www.conceptautotech.com/sitemap.xml');
  if (smRes.body) {
    const urls = (smRes.body.match(/<loc>(.*?)<\/loc>/g) || []).map(u => u.replace(/<\/?loc>/g, ''));
    console.log(`Processing ${urls.length} sitemap pages...`);

    let tistaticCount = 0;
    await mapConcurrent(urls, 25, async (pUrl) => {
      if (pUrl.includes('company-profile') || pUrl.includes('contact-us') || pUrl === 'https://www.conceptautotech.com/') return;

      const pRes = await fetchUrl(pUrl);
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
              rating: 4.9,
              detailUrl: pUrl
            });
          }
        }
      }
    });
    console.log(`conceptautotech: Extracted ${tistaticCount} products with authentic tistatic photos.`);
  }

  console.log(`\n=================================================`);
  console.log(`GRAND TOTAL AUTHENTIC CATALOG SIZE: ${catalogMap.size}`);
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
  console.log(`Successfully updated src/data/catalog.ts with ${productsList.length} authentic products!`);
}

run();
