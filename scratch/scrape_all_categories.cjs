const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

// Category pages on conceptautomationtechnologies
const ALL_PAGES = [
  'mitsubishi-plc.html',
  'siemens-plc.html',
  'mitsubishi-programmable-logic-controller.html',
  'siemens-cpu.html',
  'proface-hmi.html',
  'fuji-ac-drive.html',
  'danfoss-vfd.html',
  'allen-bradley-vfd.html',
  'abb-vfd.html',
  'pepperl-and-fuchs-sensors.html',
  'siemens-hmi.html',
  'allen-bradley-plc.html',
  'mitsubishi-hmi.html',
  'schneider-drives.html',
  'siemens-vfd.html',
  'weintek-hmi.html',
  'omron-photoelectric-sensor.html',
  'omron-hmi.html',
  'ifm-sensor.html',
  'mitsubishi-servo-drives.html',
  'encoder.html',
  'delta-hmi.html',
  'phoenix-contact.html',
  'pilz-safety-relay.html',
  'ifm-temperature-sensor.html',
  'siemens-servo-drive.html',
  'phtoelectric-sensor.html',
  'omron-plc.html',
  'photoelectric-sensor.html',
  'fuji-drives.html',
  'sick-photoelectric-sensor.html',
  'fuji-hmi.html',
  'omron-vfd.html',
  'rotary-encoder.html',
  'autonics-rotary-encoder.html',
  'presage-vibration-sensor.html',
  'ifm-io-link-master.html',
  'schneider-plc.html',
  'shaft-encoder.html',
  'plc-hmi-vfd-programming-services.html',
  'mitsubishi-vfd.html',
  'delta-plc.html',
  'yaskawa-ac-drives.html',
  'allen-bradley-hmi.html',
  'schneider-vfd.html',
  'input-and-output-module.html',
  'inovance-vfd.html',
  'siemens-servo-motors.html',
  'siemens-ipc.html',
  'ethernet-switch.html',
  'sensor.html'
];

function fetchCategory(slug) {
  return new Promise((resolve) => {
    const url = `https://www.indiamart.com/conceptautomationtechnologies/${slug}`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      timeout: 15000
    };

    const req = https.get(url, options, (res) => {
      let stream = res;
      const encoding = res.headers['content-encoding'];
      if (encoding === 'br') stream = res.pipe(zlib.createBrotliDecompress());
      else if (encoding === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (encoding === 'deflate') stream = res.pipe(zlib.createInflate());

      const chunks = [];
      stream.on('data', c => chunks.push(c));
      stream.on('end', () => {
        const html = Buffer.concat(chunks).toString('utf8');
        
        // 1. Primary extraction: Inquiry JSON blocks
        const prodRegex = /&quot;productId&quot;:(\d+),&quot;productName&quot;:&quot;([^&]+)&quot;,&quot;productImage&quot;:&quot;([^&]+)&quot;/g;
        let pMatch;
        const prods = {};
        while ((pMatch = prodRegex.exec(html)) !== null) {
          const id = pMatch[1];
          const name = pMatch[2].trim();
          let img = pMatch[3].replace(/\\/g, '');
          // convert to 1000x1000
          const highRes = img.replace(/-500x500\./, '-1000x1000.').replace(/-250x250\./, '-1000x1000.').replace(/-125x125\./, '-1000x1000.');
          prods[id] = { id, name, img: highRes, fallbackImg: img, category: slug };
        }

        // 2. Secondary extraction: Look for gallery inputs like id="udg-ci-{id}-img-1"
        const galleryRegex = /id="udg-ci-(\d+)-img-\d+"[^>]*>[\s\S]*?<img\s+src="([^"]+)"/g;
        let gMatch;
        while ((gMatch = galleryRegex.exec(html)) !== null) {
          const id = gMatch[1];
          let img = gMatch[2];
          if (img && img.includes('imimg.com') && !img.includes('youtube')) {
            const highRes = img.replace(/-500x500\./, '-1000x1000.').replace(/-250x250\./, '-1000x1000.').replace(/-125x125\./, '-1000x1000.');
            if (!prods[id]) {
              prods[id] = { id, name: '', img: highRes, fallbackImg: img, category: slug };
            }
          }
        }

        resolve({ slug, statusCode: res.statusCode, products: Object.values(prods) });
      });
      stream.on('error', (err) => {
        resolve({ slug, statusCode: 500, error: err.message, products: [] });
      });
    });

    req.on('error', (err) => {
      resolve({ slug, statusCode: 500, error: err.message, products: [] });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ slug, statusCode: 408, error: 'timeout', products: [] });
    });
  });
}

async function scrapeAll() {
  console.log(`Starting crawl of ${ALL_PAGES.length} category pages...`);
  const allScraped = {};

  for (let i = 0; i < ALL_PAGES.length; i++) {
    const slug = ALL_PAGES[i];
    process.stdout.write(`[${i + 1}/${ALL_PAGES.length}] Fetching ${slug}... `);
    const res = await fetchCategory(slug);
    console.log(`Status ${res.statusCode}, found ${res.products.length} products`);

    res.products.forEach(p => {
      allScraped['im-' + p.id] = p;
    });

    // Save incremental progress
    fs.writeFileSync('scratch/all_category_products.json', JSON.stringify(allScraped, null, 2));

    // Polite delay (800ms)
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`\n========================================`);
  console.log(`CRAWL COMPLETE!`);
  console.log(`Total unique products discovered: ${Object.keys(allScraped).length}`);
  console.log(`Results saved to scratch/all_category_products.json`);

  // Compare with catalog.ts
  const catalogContent = fs.readFileSync('src/data/catalog.ts', 'utf8');
  const start = catalogContent.indexOf('export const PRODUCTS: Product[] =');
  const bracket = catalogContent.indexOf('[\n  {', start) !== -1 ? catalogContent.indexOf('[\n  {', start) : catalogContent.indexOf('[\r\n  {', start);
  const end = catalogContent.lastIndexOf('];');
  const catalog = JSON.parse(catalogContent.substring(bracket, end + 1));
  console.log(`Catalog total products: ${catalog.length}`);

  let matched = 0;
  let missing = [];
  catalog.forEach(p => {
    if (allScraped[p.id]) {
      matched++;
    } else {
      missing.push(p);
    }
  });

  console.log(`Catalog products matched with fresh accurate images: ${matched} / ${catalog.length} (${(matched/catalog.length*100).toFixed(1)}%)`);
  if (missing.length > 0) {
    console.log(`Unmatched products count: ${missing.length}`);
    console.log('Sample unmatched:', missing.slice(0, 10).map(m => `${m.id}: ${m.name} (${m.brand})`));
  }
}

scrapeAll().catch(console.error);
