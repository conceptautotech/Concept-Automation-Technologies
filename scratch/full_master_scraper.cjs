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
  if (combined.includes('MITSUBISHI')) return 'Mitsubishi';
  if (combined.includes('OMRON')) return 'Omron';
  if (combined.includes('DELTA')) return 'Delta';
  if (combined.includes('SCHNEIDER')) return 'Schneider';
  if (combined.includes('ALLEN BRADLEY') || combined.includes('ALLEN-BRADLEY') || combined.includes('AB ')) return 'Allen Bradley';
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
  if (combined.includes('plc') || combined.includes('programmable logic controller') || combined.includes('cpu module') || combined.includes('rack')) return 'PLC Systems';
  if (combined.includes('hmi') || combined.includes('touch panel') || combined.includes('display') || combined.includes('ipc') || combined.includes('industrial pc')) return 'HMI & Touch Panels';
  if (combined.includes('vfd') || combined.includes('ac drive') || combined.includes('inverter') || combined.includes('variable frequency') || combined.includes('servo drive') || combined.includes('drive')) return 'VFD & AC Drives';
  if (combined.includes('sensor') || combined.includes('photoelectric') || combined.includes('proximity') || combined.includes('encoder') || combined.includes('vibration') || combined.includes('temperature')) return 'Sensors & Encoders';
  if (combined.includes('module') || combined.includes('input') || combined.includes('output') || combined.includes('card') || combined.includes('smps') || combined.includes('power supply') || combined.includes('relay') || combined.includes('switch')) return 'Modules & Accessories';
  return 'PLC Systems';
}

function extractPartNumber(title) {
  const match = title.match(/\b([A-Z0-9]{3,}[-\/][A-Z0-9\/-]+|[0-9][A-Z0-9]{5,})\b/i);
  if (match) return match[1].toUpperCase();
  return title.slice(0, 30);
}

async function scrapeMasterCatalog() {
  const productsMap = new Map(); // key = slug or title

  // 1. Scrape IndiaMart Mobile Site Categories
  console.log("=== SCRAPING INDIAMART MOBILE SITE ===");
  const homeRes = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/products-and-services.html');
  const catLinks = new Set();
  
  if (homeRes.body) {
    const matches = homeRes.body.match(/href="([^"]+)"/g) || [];
    for (const m of matches) {
      const href = m.replace(/href="|"/g, '');
      if (href.includes('conceptautomationtechnologies') && href.endsWith('.html') && !href.includes('profile') && !href.includes('testimonial') && !href.includes('photos') && !href.includes('videos')) {
        const fullUrl = href.startsWith('http') ? href : `https://m.indiamart.com${href.startsWith('/') ? '' : '/'}${href}`;
        catLinks.add(fullUrl);
      }
    }
  }
  
  console.log(`Found ${catLinks.size} IndiaMart category pages.`);

  let catCount = 0;
  for (const catUrl of catLinks) {
    catCount++;
    console.log(`[IndiaMart ${catCount}/${catLinks.size}] Fetching ${catUrl}...`);
    const res = await fetchUrl(catUrl);
    if (!res.body) continue;

    const html = res.body;

    // Extract product cards from mobile listing
    // Structure: <article class="company-product-card..."><a ... href="/proddetail/..."><img ... src="..." alt="..." /></a>...<p id="prod_name_..." ...>Name</p>...<span class="company-prod-price">...</span></article>
    // OR regex for images and titles
    const cardRegex = /<article[^>]*company-product-card[\s\S]*?<\/article>/gi;
    let cardMatch;
    while ((cardMatch = cardRegex.exec(html)) !== null) {
      const cardHtml = cardMatch[0];

      // Image
      const imgMatch = cardHtml.match(/src="(https:\/\/[^"]+imimg\.com\/[^"]+)"/i);
      let imgUrl = imgMatch ? imgMatch[1] : '';
      if (imgUrl) {
        // convert to high res 1000x1000 if 125x125 or 500x500
        imgUrl = imgUrl.replace(/-125x125\./g, '-1000x1000.').replace(/-500x500\./g, '-1000x1000.').replace(/-250x250\./g, '-1000x1000.');
      }

      // Title
      const nameMatch = cardHtml.match(/id="prod_name_[^"]*"[^>]*>([\s\S]*?)<\/p>/i) || cardHtml.match(/alt="([^"]+)"/i);
      let title = nameMatch ? cleanText(nameMatch[1]) : '';
      if (title.includes('₹')) {
        title = title.split('₹')[0].trim();
      }
      if (!title || title.length < 3) continue;

      // Price
      const priceMatch = cardHtml.match(/class="company-prod-price"[^>]*>([\s\S]*?)<\/span>/i);
      let priceStr = priceMatch ? cleanText(priceMatch[1]) : 'Contact for Price';
      let priceNum = 0;
      if (priceStr.includes('₹')) {
        const digits = priceStr.replace(/[^0-9]/g, '');
        if (digits) priceNum = parseInt(digits, 10);
      }

      // Product link
      const hrefMatch = cardHtml.match(/href="(\/proddetail\/[^"]+\.html)"/i);
      const prodDetailUrl = hrefMatch ? `https://m.indiamart.com${hrefMatch[1]}` : '';

      const slug = slugify(title);
      if (!productsMap.has(slug)) {
        const brand = detectBrand(title);
        const category = detectCategory(title);
        const partNumber = extractPartNumber(title);

        productsMap.set(slug, {
          id: `im-${slug.slice(0, 40)}-${Math.floor(Math.random()*1000)}`,
          title,
          partNumber,
          brand,
          category,
          price: priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Contact for Price',
          priceNumeric: priceNum,
          description: `${brand} ${title} high quality industrial automation component supplied with full technical support and warranty by Concept Automation Technologies.`,
          specs: {
            "Brand": brand,
            "Model": partNumber,
            "Condition": "100% Brand New / Refurbished Tested",
            "Availability": "In Stock Ahmedabad",
            "Warranty": "12 Months"
          },
          image: imgUrl || 'https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg',
          inStock: true,
          rating: 4.8 + Math.round(Math.random() * 2) / 10,
          source: 'indiamart',
          detailUrl: prodDetailUrl
        });
      }
    }
  }

  console.log(`Extracted ${productsMap.size} unique products from IndiaMart.`);

  // 2. Scrape conceptautotech.com sitemap URLs
  console.log("=== SCRAPING CONCEPTAUTOTECH.COM SITEMAP ===");
  const sitemapRes = await fetchUrl('https://www.conceptautotech.com/sitemap.xml');
  if (sitemapRes.body) {
    const urls = (sitemapRes.body.match(/<loc>(.*?)<\/loc>/g) || []).map(u => u.replace(/<\/?loc>/g, ''));
    console.log(`Found ${urls.length} sitemap URLs from conceptautotech.com.`);
    
    let urlCount = 0;
    for (const pageUrl of urls) {
      urlCount++;
      if (urlCount % 20 === 0) console.log(`[conceptautotech ${urlCount}/${urls.length}] Crawled... Current product total: ${productsMap.size}`);
      
      // Skip non-product pages
      if (pageUrl.includes('company-profile') || pageUrl.includes('contact-us') || pageUrl === 'https://www.conceptautotech.com/') continue;

      const pageRes = await fetchUrl(pageUrl);
      if (!pageRes.body) continue;

      const html = pageRes.body;

      // Extract products listed on the page
      // Regex for product image / title / specs on conceptautotech
      const imgMatches = html.match(/src="(https:\/\/[^"]*tistatic\.com\/[^"]+)"/gi) || html.match(/src="([^"]*\.(?:jpg|png|jpeg))"/gi) || [];
      const titleMatches = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) || [];

      // Also look for product blocks or tables
      const itemBlockRegex = /<div[^>]*class="[^"]*(?:product|prd|item)[^"]*"[\s\S]*?<\/div>/gi;
      let blockMatch;
      let foundInBlock = false;
      while ((blockMatch = itemBlockRegex.exec(html)) !== null) {
        const blockHtml = blockMatch[0];
        const blockImg = blockHtml.match(/src="([^"]+)"/i);
        const blockTitle = blockHtml.match(/<a[^>]*>([\s\S]*?)<\/a>/i) || blockHtml.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);

        if (blockTitle && blockImg) {
          const t = cleanText(blockTitle[1]);
          let img = blockImg[1];
          if (img.startsWith('//')) img = `https:${img}`;
          else if (img.startsWith('/')) img = `https://www.conceptautotech.com${img}`;

          if (t.length > 5 && (img.includes('tistatic') || img.includes('imimg') || img.includes('products') || img.includes('images'))) {
            const slug = slugify(t);
            if (!productsMap.has(slug)) {
              foundInBlock = true;
              const brand = detectBrand(t);
              const category = detectCategory(t);
              const partNumber = extractPartNumber(t);

              productsMap.set(slug, {
                id: `ca-${slug.slice(0, 40)}-${Math.floor(Math.random()*1000)}`,
                title: t,
                partNumber,
                brand,
                category,
                price: 'Contact for Price',
                priceNumeric: 0,
                description: `${brand} ${t} supplied with full technical support by Concept Automation Technologies.`,
                specs: {
                  "Brand": brand,
                  "Model": partNumber,
                  "Condition": "100% Genuine",
                  "Availability": "In Stock",
                  "Warranty": "12 Months"
                },
                image: img,
                inStock: true,
                rating: 4.9,
                source: 'conceptautotech'
              });
            }
          }
        }
      }

      // If no item blocks matched, try main page title and images
      if (!foundInBlock) {
        const pageTitleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
        const pageImgMatch = html.match(/src="(https:\/\/[^"]*tistatic\.com\/[^"]+)"/i) || html.match(/src="(https:\/\/[^"]*imimg\.com\/[^"]+)"/i);

        if (pageTitleMatch && pageImgMatch) {
          let t = cleanText(pageTitleMatch[1]).split('|')[0].split('-')[0].trim();
          let img = pageImgMatch[1];
          if (t.length > 5) {
            const slug = slugify(t);
            if (!productsMap.has(slug)) {
              const brand = detectBrand(t);
              const category = detectCategory(t);
              const partNumber = extractPartNumber(t);

              productsMap.set(slug, {
                id: `ca-${slug.slice(0, 40)}-${Math.floor(Math.random()*1000)}`,
                title: t,
                partNumber,
                brand,
                category,
                price: 'Contact for Price',
                priceNumeric: 0,
                description: `${brand} ${t} supplied with full technical support by Concept Automation Technologies.`,
                specs: {
                  "Brand": brand,
                  "Model": partNumber,
                  "Condition": "100% Genuine",
                  "Availability": "In Stock",
                  "Warranty": "12 Months"
                },
                image: img,
                inStock: true,
                rating: 4.9,
                source: 'conceptautotech'
              });
            }
          }
        }
      }
    }
  }

  console.log(`=== SCRAPING COMPLETE ===`);
  console.log(`Total Master Products Extracted: ${productsMap.size}`);

  const allProducts = Array.from(productsMap.values());
  fs.writeFileSync(path.join(__dirname, 'master_scraped_products.json'), JSON.stringify(allProducts, null, 2));
  console.log("Saved to scratch/master_scraped_products.json");
}

scrapeMasterCatalog();
