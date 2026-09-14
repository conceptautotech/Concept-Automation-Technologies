/**
 * Scrape correct product images from individual IndiaMart product pages.
 * 
 * Each product in our catalog has an IndiaMart ID like "im-2855095454433".
 * The individual product page URL is:
 *   https://www.indiamart.com/proddetail/{numeric_id}.html
 * 
 * This script:
 * 1. Reads all product IDs from catalog.ts
 * 2. Fetches each product's individual IndiaMart page
 * 3. Extracts the correct product image(s)
 * 4. Saves results to scratch/correct_images.json incrementally
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const RESULTS_FILE = 'scratch/correct_images.json';
const CATALOG_PATH = 'src/data/catalog.ts';

// Load existing results if any (for resume capability)
let results = {};
if (fs.existsSync(RESULTS_FILE)) {
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(results).length} existing results from ${RESULTS_FILE}`);
  } catch (e) {
    results = {};
  }
}

// Load catalog products
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

// Fetch a URL and return the HTML body
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      timeout: 15000,
    };

    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : `https://www.indiamart.com${res.headers.location}`;
        res.resume();
        return fetchPage(redirectUrl).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
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

// Extract product images from HTML
function extractImages(html, productId) {
  const images = [];
  
  // Pattern 1: og:image meta tag (most reliable - the main product image)
  const ogMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogMatch) {
    images.push(ogMatch[1]);
  }

  // Pattern 2: data-src or src in product image containers with imimg.com URLs
  const imgRegex = /(?:data-src|src)=["'](https?:\/\/\d+\.imimg\.com\/[^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    // Skip tiny thumbnails (c-68x68, c-120x120) and logos
    if (!url.includes('c-68x68') && !url.includes('c-120x120') && !url.includes('logo') && !url.includes('c-150x150')) {
      if (!images.includes(url)) {
        images.push(url);
      }
    }
  }

  // Pattern 3: JSON-LD structured data
  const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      try {
        const jsonContent = block.replace(/<\/?script[^>]*>/gi, '');
        const data = JSON.parse(jsonContent);
        if (data.image) {
          const imgUrls = Array.isArray(data.image) ? data.image : [data.image];
          for (const u of imgUrls) {
            if (typeof u === 'string' && u.includes('imimg.com') && !images.includes(u)) {
              images.push(u);
            }
          }
        }
      } catch (e) { /* skip invalid JSON-LD */ }
    }
  }

  // Prefer 1000x1000 versions
  const highRes = images.map(url => {
    return url.replace(/-\d+x\d+\./, '-1000x1000.');
  });

  return [...new Set(highRes)];
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Save results incrementally
function saveResults() {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

// Main scraping function
async function scrapeByBrand(products, brand) {
  const brandProducts = products.filter(p => p.brand === brand);
  console.log(`\n=== Scraping ${brand}: ${brandProducts.length} products ===`);

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < brandProducts.length; i++) {
    const p = brandProducts[i];
    const numericId = p.id.replace('im-', '');

    // Skip if already scraped
    if (results[p.id] && results[p.id].images && results[p.id].images.length > 0) {
      skipCount++;
      continue;
    }

    const url = `https://www.indiamart.com/proddetail/${numericId}.html`;
    
    try {
      console.log(`  [${i+1}/${brandProducts.length}] Fetching ${p.name} (${p.id})...`);
      const html = await fetchPage(url);
      const images = extractImages(html, p.id);

      if (images.length > 0) {
        results[p.id] = {
          name: p.name,
          brand: p.brand,
          mainImage: images[0],
          images: images,
          url: url,
        };
        successCount++;
        console.log(`    ✓ Found ${images.length} image(s): ${images[0].substring(images[0].lastIndexOf('/') + 1)}`);
      } else {
        results[p.id] = {
          name: p.name,
          brand: p.brand,
          mainImage: null,
          images: [],
          url: url,
          error: 'No images found in HTML',
        };
        failCount++;
        console.log(`    ✗ No images found`);
      }
    } catch (err) {
      results[p.id] = {
        name: p.name,
        brand: p.brand,
        mainImage: null,
        images: [],
        url: url,
        error: err.message,
      };
      failCount++;
      console.log(`    ✗ Error: ${err.message}`);
    }

    // Save progress after every product
    saveResults();

    // Rate limit: wait 2-4 seconds between requests
    const waitMs = 2000 + Math.random() * 2000;
    await delay(waitMs);
  }

  console.log(`  ${brand} complete: ${successCount} success, ${failCount} failed, ${skipCount} skipped`);
  return { successCount, failCount, skipCount };
}

// Entry point
async function main() {
  const products = loadProducts();
  console.log(`Total products in catalog: ${products.length}`);

  // Get brand to scrape from command line arg, or scrape all
  const targetBrand = process.argv[2] || null;

  // Get unique brands
  const brands = [...new Set(products.map(p => p.brand))].sort();
  console.log(`Brands: ${brands.join(', ')}`);

  const brandsToScrape = targetBrand ? [targetBrand] : brands;

  let totalSuccess = 0;
  let totalFail = 0;
  let totalSkip = 0;

  for (const brand of brandsToScrape) {
    const { successCount, failCount, skipCount } = await scrapeByBrand(products, brand);
    totalSuccess += successCount;
    totalFail += failCount;
    totalSkip += skipCount;
  }

  console.log(`\n=== FINAL SUMMARY ===`);
  console.log(`Total: ${totalSuccess} success, ${totalFail} failed, ${totalSkip} skipped`);
  console.log(`Results saved to ${RESULTS_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  saveResults();
  process.exit(1);
});
