/**
 * SLOW SCRAPER for IndiaMart Product Details
 * 
 * Uses a 3-second delay between requests to avoid rate limiting.
 * Scrapes: descriptions, specifications, images, and prices.
 * 
 * Usage:
 *   node scratch/slow_scraper.cjs              # Full scrape (all products)
 *   node scratch/slow_scraper.cjs --batch 0    # Scrape products 0-49
 *   node scratch/slow_scraper.cjs --batch 1    # Scrape products 50-99
 *   node scratch/slow_scraper.cjs --resume     # Resume from last checkpoint
 */

const fs = require('fs');
const http = require('https');
const path = require('path');

const catalogPath = path.resolve('src/data/catalog.ts');
const resultsPath = path.resolve('scratch/scraped_data.json');
const checkpointPath = path.resolve('scratch/scrape_checkpoint.json');

const DELAY_MS = 1500; // 1.5 seconds between requests
const BATCH_SIZE = 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchHtml(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Referer': 'https://www.google.com/'
      },
      timeout: 15000
    };
    const req = http.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    });
    req.on('error', (e) => resolve({ status: 'ERROR', error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
  });
}

function parseProductPage(html) {
  const result = {
    description: '',
    images: [],
    specifications: [],
    price: ''
  };

  // Extract LD+JSON data
  const scriptRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      if (json['@type'] === 'ImageGallery' && json.associatedMedia) {
        result.images = json.associatedMedia
          .map(m => m.contentUrl)
          .filter(url => url && url.startsWith('http'));
      }
      if (json['@type'] === 'Product') {
        if (json.description) result.description = json.description.trim();
        if (json.offers && json.offers.price) {
          result.price = `₹ ${json.offers.price}/${json.offers.unitText || 'Piece'}`;
        }
      }
    } catch (e) {}
  }

  // Extract specs from table
  const rowRegex = /<tr[^>]*>\s*<td class="tdwdt\s*">([\s\S]*?)<\/td>\s*<td class="tdwdt1\s*[^"]*">\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/td>\s*<\/tr>/gi;
  while ((match = rowRegex.exec(html)) !== null) {
    const label = match[1].replace(/<[^>]*>/g, '').trim();
    const value = match[2].replace(/<[^>]*>/g, '').trim();
    if (label && value) {
      result.specifications.push({ label, value });
    }
  }

  // Fallback specs extraction
  if (result.specifications.length === 0) {
    const tableRegex = /<table[^>]*class="[^"]*isq-table[^"]*"[\s\S]*?<\/table>/gi;
    const tableMatch = html.match(tableRegex);
    if (tableMatch) {
      const rows = tableMatch[0].match(/<tr[\s\S]*?<\/tr>/gi);
      if (rows) {
        rows.forEach(row => {
          const cols = row.match(/<td[\s\S]*?<\/td>/gi);
          if (cols && cols.length >= 2) {
            const label = cols[0].replace(/<[^>]*>/g, '').trim();
            const value = cols[1].replace(/<[^>]*>/g, '').trim();
            if (label && value) result.specifications.push({ label, value });
          }
        });
      }
    }
  }

  // Extract price from HTML if not from LD+JSON
  if (!result.price) {
    const priceMatch = html.match(/class="[^"]*prc-amc[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    if (priceMatch) {
      result.price = priceMatch[1].replace(/<[^>]*>/g, '').trim();
    }
  }

  return result;
}

function selectBestMainImage(images) {
  // Prefer "Default" images (actual product photos) over "PDFImage" (document screenshots)
  const defaultImages = images.filter(url => url.includes('/Default/'));
  const pdfImages = images.filter(url => url.includes('/PDFImage/'));
  
  // Use first Default image as main, or first image if no Default available
  if (defaultImages.length > 0) {
    return defaultImages[0];
  }
  return images[0] || '';
}

async function run() {
  const args = process.argv.slice(2);
  const batchArg = args.indexOf('--batch');
  const resumeMode = args.includes('--resume');
  
  // Load catalog
  const content = fs.readFileSync(catalogPath, 'utf8');
  const delimiter = 'export const allProducts: Product[] =';
  const delimiterIndex = content.indexOf(delimiter);
  const header = content.substring(0, delimiterIndex + delimiter.length) + ' ';
  const arrayString = content.substring(delimiterIndex + delimiter.length).trim().replace(/;\s*$/, '');
  
  let allProducts;
  try {
    allProducts = eval('(' + arrayString + ')');
  } catch (e) {
    console.error("Failed to parse catalog:", e.message);
    process.exit(1);
  }

  console.log(`Total products in catalog: ${allProducts.length}`);

  // Load existing results
  let existingResults = {};
  if (fs.existsSync(resultsPath)) {
    try {
      existingResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    } catch (e) {}
  }
  console.log(`Existing scraped results: ${Object.keys(existingResults).length}`);

  // Determine which products to scrape
  let targetProducts = allProducts;
  const idArg = args.indexOf('--id');
  
  if (idArg !== -1 && args[idArg + 1] !== undefined) {
    const targetId = args[idArg + 1];
    targetProducts = allProducts.filter(p => p.id === targetId);
    console.log(`Single product mode: targeting product ${targetId}`);
  } else if (batchArg !== -1 && args[batchArg + 1] !== undefined) {
    const batchNum = parseInt(args[batchArg + 1]);
    const startIdx = batchNum * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, allProducts.length);
    targetProducts = allProducts.slice(startIdx, endIdx);
    console.log(`Batch mode: products ${startIdx} to ${endIdx - 1}`);
  }

  if (resumeMode) {
    // Skip already scraped products
    console.log(`Resume mode: skipping already scraped products`);
  }

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < targetProducts.length; i++) {
    const p = targetProducts[i];
    const rawId = p.id.replace('im-', '');

    // Skip if already scraped (in resume mode)
    if (resumeMode && existingResults[p.id]) {
      skipCount++;
      continue;
    }

    const url = `https://www.indiamart.com/proddetail/${rawId}.html`;
    
    // Wait between requests
    if (i > 0) {
      await sleep(DELAY_MS);
    }

    console.log(`[${i + 1}/${targetProducts.length}] Fetching: ${p.name} (${p.id})...`);
    const res = await fetchHtml(url);

    if (res.status === 200) {
      const parsed = parseProductPage(res.html);
      existingResults[p.id] = parsed;
      successCount++;
      console.log(`  ✓ Specs: ${parsed.specifications.length}, Images: ${parsed.images.length}, Desc: ${parsed.description.length} chars`);
      
      // Save checkpoint every 10 products
      if (successCount % 10 === 0) {
        fs.writeFileSync(resultsPath, JSON.stringify(existingResults, null, 2), 'utf8');
        console.log(`  [Checkpoint saved: ${Object.keys(existingResults).length} products]`);
      }
    } else if (res.status === 429) {
      console.log(`  ✗ RATE LIMITED (429). Waiting 30 seconds...`);
      failCount++;
      await sleep(30000); // Wait 30 seconds on rate limit
      i--; // Retry this product
      continue;
    } else {
      console.log(`  ✗ Failed (${res.status})`);
      failCount++;
    }
  }

  // Final save
  fs.writeFileSync(resultsPath, JSON.stringify(existingResults, null, 2), 'utf8');
  console.log(`\nDone! Success: ${successCount}, Failed: ${failCount}, Skipped: ${skipCount}`);
  console.log(`Total scraped: ${Object.keys(existingResults).length}`);
  console.log(`Results saved to: ${resultsPath}`);

  // Apply scraped data back to the main catalog
  console.log('\nApplying scraped data to catalog...');
  applyScrapedData(allProducts, existingResults, header);
}

function applyScrapedData(allProducts, scrapedData, header) {
  let updatedCount = 0;
  
  allProducts.forEach(p => {
    const scraped = scrapedData[p.id];
    if (!scraped) return;

    // Update description if scraped one is longer/better
    if (scraped.description && scraped.description.length > (p.description || '').length) {
      p.description = scraped.description;
    }

    // Update specifications if we got more
    if (scraped.specifications && scraped.specifications.length > 0) {
      p.specifications = scraped.specifications;
    }

    // Update images - prefer "Default" images over "PDFImage"
    if (scraped.images && scraped.images.length > 0) {
      const bestMain = selectBestMainImage(scraped.images);
      p.image = bestMain;
      
      // Reorder: Default images first, then PDFImages
      const defaultImgs = scraped.images.filter(u => u.includes('/Default/'));
      const pdfImgs = scraped.images.filter(u => u.includes('/PDFImage/'));
      p.images = [...defaultImgs, ...pdfImgs];
    }

    // Update price
    if (scraped.price) {
      p.price = scraped.price;
    }

    updatedCount++;
  });

  const formatted = JSON.stringify(allProducts, null, 2);
  const updatedContent = header + formatted + ';\n';
  fs.writeFileSync(catalogPath, updatedContent, 'utf8');
  console.log(`Updated ${updatedCount} products in catalog.ts`);
}

run().catch(console.error);
