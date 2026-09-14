const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const u = url.startsWith('http') ? url : `https://www.conceptautotech.com${url}`;
    
    const req = https.get(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 15000
    }, (res) => {
      const zlib = require('zlib');
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());
      
      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', err => resolve({ status: 'ERROR', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
  });
}

async function run() {
  const pageUrl = '/pfxet6600wad-proface-hmi-12-inch-et6000-series-9714690.html';
  console.log(`Fetching sample product page: ${pageUrl}`);
  const res = await fetchUrl(pageUrl);
  
  if (res.body) {
    const html = res.body;

    // Extract Title
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract Images
    const imgMatches = html.match(/https:\/\/(?:cpimg\.tistatic\.com|5\.imimg\.com|tiimg\.tistatic\.com)[^"'\s>]+/g) || [];
    const images = Array.from(new Set(imgMatches.filter(u => u.includes('/09') || u.includes('/b/4/') || u.includes('/1000x1000'))));

    // Extract Specs Table
    const specs = [];
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
    if (tableMatch) {
      tableMatch.forEach(tbl => {
        const rows = tbl.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
        if (rows) {
          rows.forEach(tr => {
            const cols = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || tr.match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
            if (cols && cols.length >= 2) {
              const label = cols[0].replace(/<[^>]*>/g, '').trim();
              const val = cols[1].replace(/<[^>]*>/g, '').trim();
              if (label && val && label.length < 50 && val.length < 150 && !label.includes('{')) {
                specs.push({ label, value: val });
              }
            }
          });
        }
      });
    }

    // Extract Description
    const descMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                      html.match(/<section[^>]*aria-label="Product description"[^>]*>([\s\S]*?)<\/section>/i) ||
                      html.match(/<div[^>]*id="product_description"[^>]*>([\s\S]*?)<\/div>/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    console.log("\n=== PARSED PRODUCT RESULT ===");
    console.log("Title:", title);
    console.log("Images found:", images);
    console.log("Specs found:", specs.slice(0, 10));
    console.log("Description snippet:", description.slice(0, 150));
  }
}

run();
