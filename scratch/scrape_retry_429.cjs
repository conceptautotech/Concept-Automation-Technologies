/**
 * Retry scraper with longer delays (8-12 seconds) for products that failed with 429.
 * Only processes products that have error: "HTTP 429" in correct_images.json
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const RESULTS_FILE = 'scratch/correct_images.json';
const CATALOG_PATH = 'src/data/catalog.ts';

let results = {};
if (fs.existsSync(RESULTS_FILE)) {
  results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
  console.log(`Loaded ${Object.keys(results).length} existing results`);
}

function loadProducts() {
  const content = fs.readFileSync(CATALOG_PATH, 'utf8');
  const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
  const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 
    ? content.indexOf('[\n  {', startIdx) 
    : content.indexOf('[\r\n  {', startIdx);
  const endIdx = content.lastIndexOf('];');
  const jsonText = content.substring(bracketIdx, endIdx + 1).trim();
  return JSON.parse(jsonText);
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.110 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 20000,
    };

    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : `https://www.indiamart.com${res.headers.location}`;
        res.resume();
        return fetchPage(redirectUrl).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractImages(html) {
  const images = [];
  
  const ogMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogMatch) images.push(ogMatch[1]);

  const imgRegex = /(?:data-src|src)=["'](https?:\/\/\d+\.imimg\.com\/[^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (!url.includes('c-68x68') && !url.includes('c-120x120') && !url.includes('logo') && !url.includes('c-150x150')) {
      if (!images.includes(url)) images.push(url);
    }
  }

  const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      try {
        const jsonContent = block.replace(/<\/?script[^>]*>/gi, '');
        const data = JSON.parse(jsonContent);
        if (data.image) {
          const imgUrls = Array.isArray(data.image) ? data.image : [data.image];
          for (const u of imgUrls) {
            if (typeof u === 'string' && u.includes('imimg.com') && !images.includes(u)) images.push(u);
          }
        }
      } catch (e) {}
    }
  }

  return [...new Set(images.map(url => url.replace(/-\d+x\d+\./, '-1000x1000.')))];
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function saveResults() { fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2)); }

async function main() {
  const products = loadProducts();
  
  // Find products that need retry (429 errors or no scraped data yet)
  const needRetry = products.filter(p => {
    if (!results[p.id]) return true;
    if (results[p.id].error && results[p.id].error.includes('429')) return true;
    if (results[p.id].error && results[p.id].error.includes('404')) return false; // Skip 404s
    if (!results[p.id].mainImage) return true;
    return false;
  });

  console.log(`Products needing retry: ${needRetry.length} out of ${products.length}`);
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < needRetry.length; i++) {
    const p = needRetry[i];
    const numericId = p.id.replace('im-', '');
    const url = `https://www.indiamart.com/proddetail/${numericId}.html`;

    try {
      console.log(`[${i+1}/${needRetry.length}] ${p.name} (${p.id})...`);
      const html = await fetchPage(url);
      const images = extractImages(html);

      if (images.length > 0) {
        results[p.id] = { name: p.name, brand: p.brand, mainImage: images[0], images, url };
        successCount++;
        console.log(`  ✓ ${images.length} image(s): ${images[0].substring(images[0].lastIndexOf('/') + 1)}`);
      } else {
        results[p.id] = { name: p.name, brand: p.brand, mainImage: null, images: [], url, error: 'No images found' };
        failCount++;
        console.log(`  ✗ No images found`);
      }
    } catch (err) {
      results[p.id] = { name: p.name, brand: p.brand, mainImage: null, images: [], url, error: err.message };
      failCount++;
      console.log(`  ✗ ${err.message}`);
      
      // If 429, wait extra long
      if (err.message.includes('429')) {
        console.log(`  ⏳ Rate limited! Waiting 30 seconds...`);
        await delay(30000);
      }
    }

    saveResults();

    // Longer delay: 8-12 seconds between requests
    const waitMs = 8000 + Math.random() * 4000;
    await delay(waitMs);
  }

  console.log(`\n=== RETRY SUMMARY ===`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
  
  // Final stats
  const allKeys = Object.keys(results);
  const withImages = Object.values(results).filter(d => d.mainImage).length;
  console.log(`Total scraped: ${allKeys.length} | With images: ${withImages}`);
}

main().catch(err => { console.error('Fatal:', err); saveResults(); process.exit(1); });
