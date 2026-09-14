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
      stream.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (err) => resolve({ status: 500, error: err }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 508, error: 'timeout' }); });
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
  if (combined.includes('ALLEN BRADLEY') || combined.includes('ALLEN-BRADLEY') || combined.includes('ROCKWELL')) return 'Allen Bradley';
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

async function harvest() {
  const catalogMap = new Map(); // key = prodId or slug

  // Step 1: Harvest IndiaMart mobile category pages
  console.log("=== STEP 1: Harvesting IndiaMart mobile category pages ===");
  const psRes = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/products-and-services.html');
  const categoryUrls = new Set();
  
  if (psRes.body) {
    const matches = psRes.body.match(/href="([^"]+)"/g) || [];
    for (const m of matches) {
      const link = m.replace(/href="|"/g, '');
      if (link.includes('conceptautomationtechnologies') && link.endsWith('.html') && !link.includes('profile') && !link.includes('testimonial') && !link.includes('photos') && !link.includes('videos')) {
        const fullUrl = link.startsWith('http') ? link : `https://m.indiamart.com${link.startsWith('/') ? '' : '/'}${link}`;
        categoryUrls.add(fullUrl);
      }
    }
  }

  console.log(`Found ${categoryUrls.size} category URLs on IndiaMart.`);

  let catIdx = 0;
  for (const catUrl of categoryUrls) {
    catIdx++;
    console.log(`[Category ${catIdx}/${categoryUrls.size}] Fetching ${catUrl}`);
    const catRes = await fetchUrl(catUrl);
    if (!catRes.body) continue;
    const html = catRes.body;

    // Extract proddetail blocks
    // Pattern 1: proddetail links with inner HTML
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

        if (rawTitle.length > 3 && !catalogMap.has(prodId)) {
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
            description: `${brand} ${rawTitle} industrial component. Genuine item with technical support from Concept Automation Technologies.`,
            specs: {
              "Brand": brand,
              "Model": partNumber,
              "Condition": "100% Factory Sealed / Pre-tested",
              "Availability": "In Stock Ahmedabad",
              "Warranty": "12 Months Warranty"
            },
            image: imgUrl || 'https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg',
            inStock: true,
            rating: 4.8 + Math.round(Math.random() * 2) / 10,
            detailUrl: `https://m.indiamart.com${href}`
          });
        }
      }
    }

    // Pattern 2: Search for product titles inside <p id="prod_name_..."> or article cards
    const prodNameRegex = /id="prod_name_(\d+)"[^>]*>([\s\S]*?)<\/p>/gi;
    let nameMatch;
    while ((nameMatch = prodNameRegex.exec(html)) !== null) {
      const pid = nameMatch[1];
      const pTitle = cleanText(nameMatch[2]);
      if (pTitle.length > 3) {
        // find matching prodId in catalogMap or create
        const found = Array.from(catalogMap.values()).find(item => item.id.includes(pid) || item.title === pTitle);
        if (!found) {
          const slug = slugify(pTitle) + '-' + pid;
          const brand = detectBrand(pTitle);
          const category = detectCategory(pTitle);
          const partNumber = extractPartNumber(pTitle);

          catalogMap.set(slug, {
            id: slug,
            title: pTitle,
            partNumber,
            brand,
            category,
            price: 'Contact for Price',
            priceNumeric: 0,
            description: `${brand} ${pTitle} supplied by Concept Automation Technologies.`,
            specs: {
              "Brand": brand,
              "Model": partNumber,
              "Condition": "100% Genuine",
              "Availability": "In Stock",
              "Warranty": "12 Months Warranty"
            },
            image: 'https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg',
            inStock: true,
            rating: 4.9,
            detailUrl: `https://m.indiamart.com/proddetail/${slug}.html`
          });
        }
      }
    }
  }

  console.log(`Extracted ${catalogMap.size} products from IndiaMart.`);

  // Step 2: Harvest conceptautotech.com sitemap
  console.log("=== STEP 2: Harvesting conceptautotech.com sitemap ===");
  const smRes = await fetchUrl('https://www.conceptautotech.com/sitemap.xml');
  if (smRes.body) {
    const urls = (smRes.body.match(/<loc>(.*?)<\/loc>/g) || []).map(u => u.replace(/<\/?loc>/g, ''));
    console.log(`Processing ${urls.length} sitemap pages...`);

    let pageIdx = 0;
    for (const pUrl of urls) {
      pageIdx++;
      if (pageIdx % 30 === 0) console.log(`[conceptautotech ${pageIdx}/${urls.length}] Current unique catalog count: ${catalogMap.size}`);
      if (pUrl.includes('company-profile') || pUrl.includes('contact-us') || pUrl === 'https://www.conceptautotech.com/') continue;

      const pRes = await fetchUrl(pUrl);
      if (!pRes.body) continue;
      const pHtml = pRes.body;

      // Extract image & title from page
      const titleMatch = pHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || pHtml.match(/<title>([\s\S]*?)<\/title>/i);
      const imgMatch = pHtml.match(/src="(https:\/\/[^"]*tistatic\.com\/[^"]+)"/i) || pHtml.match(/src="(https:\/\/[^"]*imimg\.com\/[^"]+)"/i);

      if (titleMatch && imgMatch) {
        let t = cleanText(titleMatch[1]).split('|')[0].split('-')[0].trim();
        let img = imgMatch[1];

        if (t.length > 4) {
          const brand = detectBrand(t);
          const category = detectCategory(t);
          const partNumber = extractPartNumber(t);
          const slug = slugify(t);

          // Check if already in catalogMap by title similarity or slug
          let exists = false;
          for (const item of catalogMap.values()) {
            if (item.title.toLowerCase() === t.toLowerCase() || item.id === slug) {
              exists = true;
              break;
            }
          }

          if (!exists) {
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
    }
  }

  console.log(`=== HARVESTING COMPLETE ===`);
  console.log(`Total harvested unique products: ${catalogMap.size}`);

  const items = Array.from(catalogMap.values());
  fs.writeFileSync('scratch/full_harvested_catalog.json', JSON.stringify(items, null, 2));
  console.log("Saved scratch/full_harvested_catalog.json");
}

harvest();
