const https = require('https');
const http = require('http');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 12000
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
    req.on('error', (err) => resolve({ status: 500, body: '' }));
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

function isValidImage(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.json')) return false;
  if (!url.startsWith('http')) return false;
  const lower = url.toLowerCase();
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp') || lower.includes('5.imimg.com') || lower.includes('tistatic.com')) {
    return true;
  }
  return false;
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
  console.log("=== REBUILDING MASTER CATALOG WITH HIGH-RES VALIDATED IMAGES ===");
  const catalogMap = new Map();

  // 1. IndiaMart Mobile Category Pages
  const psRes = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/products-and-services.html');
  const catUrls = new Set(['https://m.indiamart.com/conceptautomationtechnologies/products-and-services.html']);

  if (psRes.body) {
    const matches = psRes.body.match(/href="([^"]+)"/g) || [];
    for (const m of matches) {
      const link = m.replace(/href="|"/g, '');
      if (link.includes('conceptautomationtechnologies') && link.endsWith('.html') && !link.includes('profile') && !link.includes('testimonial') && !link.includes('photos') && !link.includes('videos')) {
        const fullUrl = link.startsWith('http') ? link : `https://m.indiamart.com${link.startsWith('/') ? '' : '/'}${link}`;
        catUrls.add(fullUrl);
      }
    }
  }

  const categoryList = Array.from(catUrls);
  console.log(`Processing ${categoryList.length} IndiaMart mobile category pages...`);

  await mapConcurrent(categoryList, 15, async (url) => {
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

        if (rawTitle.length > 3 && isValidImage(imgUrl) && !catalogMap.has(prodId)) {
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
            description: `${brand} ${rawTitle} industrial component. Genuine equipment supplied with full warranty and technical support by Concept Automation Technologies.`,
            specs: {
              "Brand": brand,
              "Model": partNumber,
              "Condition": "100% Genuine Original",
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

  console.log(`IndiaMart: ${catalogMap.size} products parsed.`);

  // 2. conceptautotech.com sitemap
  console.log("Scraping conceptautotech.com sitemap...");
  const smRes = await fetchUrl('https://www.conceptautotech.com/sitemap.xml');
  if (smRes.body) {
    const urls = (smRes.body.match(/<loc>(.*?)<\/loc>/g) || []).map(u => u.replace(/<\/?loc>/g, ''));

    await mapConcurrent(urls, 25, async (pUrl) => {
      if (pUrl.includes('company-profile') || pUrl.includes('contact-us') || pUrl === 'https://www.conceptautotech.com/') return;

      const pRes = await fetchUrl(pUrl);
      if (!pRes.body) return;
      const html = pRes.body;

      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
      
      // Match image tag specifically
      const imgTags = html.match(/<img[^>]+src="([^"]+)"[^>]*>/gi) || [];
      let img = '';
      for (const tag of imgTags) {
        const srcMatch = tag.match(/src="([^"]+)"/i);
        if (srcMatch && isValidImage(srcMatch[1]) && !srcMatch[1].includes('logo') && !srcMatch[1].includes('banner')) {
          img = srcMatch[1];
          if (img.startsWith('//')) img = `https:${img}`;
          break;
        }
      }

      if (titleMatch && img) {
        let t = cleanText(titleMatch[1]).split('|')[0].split('-')[0].trim();

        if (t.length > 4) {
          const slug = slugify(t);
          if (!catalogMap.has(slug)) {
            const brand = detectBrand(t);
            const category = detectCategory(t);
            const partNumber = extractPartNumber(t);

            catalogMap.set(slug, {
              id: slug,
              title: t,
              partNumber,
              brand,
              category,
              price: 'Contact for Price',
              priceNumeric: 0,
              description: `${brand} ${t} supplied with complete warranty and technical support by Concept Automation Technologies.`,
              specs: {
                "Brand": brand,
                "Model": partNumber,
                "Condition": "100% Genuine Original",
                "Availability": "In Stock",
                "Warranty": "12 Months Warranty"
              },
              image: img,
              inStock: true,
              rating: 4.9,
              detailUrl: pUrl
            });
          }
        }
      }
    });
  }

  console.log(`Final Validated Master Catalog Size: ${catalogMap.size}`);

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

main();
