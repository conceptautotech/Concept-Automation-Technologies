/**
 * clean_catalog.cjs — One-time catalog cleanup script
 * 
 * Fixes:
 * 1. Removes duplicate products (keeps richer version)
 * 2. Extracts real product names from HTML-contaminated entries
 * 3. Re-scrapes broken products from IndiaMART for proper images/specs/descriptions
 * 4. Validates every product has required fields
 */

const fs = require('fs');
const path = require('path');
const http = require('https');
const zlib = require('zlib');

const catalogPath = path.resolve(__dirname, '..', 'src', 'data', 'catalog.ts');

const DELAY_MS = 2000;
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function fetchHtml(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Referer': 'https://www.google.com/'
      },
      timeout: 15000
    };
    http.get(url, options, (res) => {
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());
      let data = '';
      stream.on('data', chunk => { data += chunk; });
      stream.on('end', () => resolve({ status: res.statusCode, html: data }));
      stream.on('error', (e) => resolve({ status: 'ERROR', error: e.message, html: '' }));
    }).on('error', (e) => resolve({ status: 'ERROR', error: e.message, html: '' }));
  });
}

function parseProductPage(html) {
  const result = { description: '', images: [], specifications: [], price: '', name: '' };

  // Extract name from LD+JSON
  const scriptRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      if (json['@type'] === 'ImageGallery' && json.associatedMedia) {
        result.images = json.associatedMedia.map(m => m.contentUrl).filter(url => url && url.startsWith('http'));
      }
      if (json['@type'] === 'Product') {
        if (json.name) result.name = json.name.trim();
        if (json.description) result.description = json.description.trim();
        if (json.offers && json.offers.price) {
          result.price = `₹ ${json.offers.price}/${json.offers.unitText || 'Piece'}`;
        }
      }
    } catch (e) {}
  }

  // Specifications from table
  const rowRegex = /<tr[^>]*>\s*<td class="tdwdt\s*">([\s\S]*?)<\/td>\s*<td class="tdwdt1\s*[^"]*">\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/td>\s*<\/tr>/gi;
  while ((match = rowRegex.exec(html)) !== null) {
    const label = match[1].replace(/<[^>]*>/g, '').trim();
    const value = match[2].replace(/<[^>]*>/g, '').trim();
    if (label && value) result.specifications.push({ label, value });
  }

  // Fallback specs from isq-table
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

  // Fallback price
  if (!result.price) {
    const priceMatch = html.match(/class="[^"]*prc-amc[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    if (priceMatch) result.price = priceMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  return result;
}

function extractNameFromHtml(htmlName) {
  // Try to extract productName from data-props JSON embedded in the HTML blob
  const nameMatch = htmlName.match(/"productName"\s*:\s*"([^"]+)"/);
  if (nameMatch) return nameMatch[1].trim();
  
  // Fallback: extract from aria-label
  const ariaMatch = htmlName.match(/aria-label="Product description">([\s\S]*?)<\/section>/);
  if (ariaMatch) {
    const clean = ariaMatch[1].replace(/<[^>]*>/g, '').trim();
    if (clean.length > 3) return clean;
  }
  
  return null;
}

function selectBestMainImage(images) {
  const defaultImages = images.filter(url => url.includes('/Default/'));
  if (defaultImages.length > 0) return defaultImages[0];
  return images[0] || '';
}

async function run() {
  console.log("=== Catalog Cleanup Script ===\n");
  
  // 1. Read and parse catalog
  const content = fs.readFileSync(catalogPath, 'utf8');
  const delimiter = 'export const allProducts: Product[] =';
  const delimiterIndex = content.indexOf(delimiter);
  const header = content.substring(0, delimiterIndex + delimiter.length) + ' ';
  const arrayString = content.substring(delimiterIndex + delimiter.length).trim().replace(/;\s*$/, '');
  
  let products;
  try {
    products = eval('(' + arrayString + ')');
  } catch (e) {
    console.error("Failed to parse catalog.ts:", e.message);
    process.exit(1);
  }
  
  console.log(`Starting product count: ${products.length}`);
  
  // 2. Remove duplicates (keep the one with more specs/images)
  console.log("\n--- Step 1: Removing duplicates ---");
  const slugMap = new Map();
  products.forEach(p => {
    const key = p.slug;
    if (!slugMap.has(key)) {
      slugMap.set(key, p);
    } else {
      const existing = slugMap.get(key);
      const existingScore = (existing.specifications?.length || 0) + (existing.images?.length || 0) + (existing.description?.length || 0);
      const newScore = (p.specifications?.length || 0) + (p.images?.length || 0) + (p.description?.length || 0);
      if (newScore > existingScore) {
        console.log(`  Replacing duplicate "${key}" (old score: ${existingScore}, new score: ${newScore})`);
        slugMap.set(key, p);
      } else {
        console.log(`  Skipping duplicate "${key}" (keeping existing with score: ${existingScore})`);
      }
    }
  });
  products = Array.from(slugMap.values());
  console.log(`After dedup: ${products.length} products`);
  
  // 3. Fix HTML-contaminated names
  console.log("\n--- Step 2: Fixing HTML-contaminated names ---");
  const htmlNameProducts = products.filter(p => /<[a-z][^>]*>/i.test(p.name));
  for (const p of htmlNameProducts) {
    const extracted = extractNameFromHtml(p.name);
    if (extracted) {
      console.log(`  Fixed: "${extracted}" (was HTML blob, id: ${p.id})`);
      p.name = extracted;
      p.slug = extracted.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      p.partNumber = extracted.toUpperCase().replace(/[^A-Z0-9]+/g, '');
    } else {
      console.log(`  Could not extract name from HTML blob (id: ${p.id}), will re-scrape`);
    }
  }
  
  // 4. Identify products that need re-scraping
  console.log("\n--- Step 3: Identifying products needing re-scrape ---");
  const needsRescrape = products.filter(p => {
    const hasHtmlName = /<[a-z][^>]*>/i.test(p.name);
    const noImage = !p.image || p.image.includes('unsplash.com');
    const noSpecs = !p.specifications || p.specifications.length === 0;
    const shortDesc = !p.description || p.description.trim().length < 20;
    return hasHtmlName || noImage || noSpecs || shortDesc;
  });
  
  console.log(`Products needing re-scrape: ${needsRescrape.length}`);
  
  // 5. Re-scrape broken products
  if (needsRescrape.length > 0) {
    console.log("\n--- Step 4: Re-scraping broken products ---");
    for (let i = 0; i < needsRescrape.length; i++) {
      const p = needsRescrape[i];
      const rawId = p.id.replace('im-', '');
      const url = `https://www.indiamart.com/proddetail/${rawId}.html`;
      
      console.log(`  [${i + 1}/${needsRescrape.length}] Re-scraping: ${p.name || p.id}...`);
      await sleep(DELAY_MS);
      
      const res = await fetchHtml(url);
      if (res.status === 200) {
        const parsed = parseProductPage(res.html);
        
        // Fix name if still HTML
        if (/<[a-z][^>]*>/i.test(p.name) && parsed.name) {
          p.name = parsed.name;
          p.slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          p.partNumber = parsed.name.toUpperCase().replace(/[^A-Z0-9]+/g, '');
        }
        
        // Update description
        if (parsed.description && parsed.description.length > (p.description?.length || 0)) {
          p.description = parsed.description;
        }
        
        // Update price
        if (parsed.price) p.price = parsed.price;
        
        // Update specs
        if (parsed.specifications.length > 0) {
          p.specifications = parsed.specifications;
        }
        
        // Update images
        if (parsed.images.length > 0) {
          p.image = selectBestMainImage(parsed.images);
          const defaultImgs = parsed.images.filter(u => u.includes('/Default/'));
          const pdfImgs = parsed.images.filter(u => u.includes('/PDFImage/'));
          p.images = [...defaultImgs, ...pdfImgs];
        }
        
        console.log(`    ✓ Fixed. Name: "${p.name}", Specs: ${p.specifications?.length || 0}, Images: ${p.images?.length || 0}`);
      } else {
        console.log(`    ✗ Failed to fetch (status: ${res.status}). Keeping existing data.`);
      }
    }
  }
  
  // 6. Final validation pass
  console.log("\n--- Step 5: Final validation ---");
  let issues = 0;
  products.forEach(p => {
    // Ensure no product still has HTML in name
    if (/<[a-z][^>]*>/i.test(p.name)) {
      console.log(`  ⚠ Still has HTML in name: ${p.id}`);
      issues++;
    }
    // Ensure slug is clean
    if (!p.slug || p.slug.length < 3) {
      p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    // Ensure stock field
    if (p.stock === undefined) p.stock = true;
  });
  
  // Remove any products that still have unfixable HTML names
  const cleanProducts = products.filter(p => !/<[a-z][^>]*>/i.test(p.name));
  if (cleanProducts.length < products.length) {
    console.log(`  Removed ${products.length - cleanProducts.length} unfixable products`);
  }
  
  console.log(`\nFinal clean product count: ${cleanProducts.length}`);
  console.log(`Validation issues remaining: ${issues}`);
  
  // 7. Write back
  const formatted = JSON.stringify(cleanProducts, null, 2);
  const updatedContent = header + formatted + ';\n';
  
  // Backup first
  const backupPath = catalogPath + '.backup';
  fs.copyFileSync(catalogPath, backupPath);
  console.log(`\nBackup saved to: ${backupPath}`);
  
  fs.writeFileSync(catalogPath, updatedContent, 'utf8');
  console.log(`Cleaned catalog written to: ${catalogPath}`);
  console.log("\n=== Cleanup Complete! ===");
}

run().catch(console.error);
