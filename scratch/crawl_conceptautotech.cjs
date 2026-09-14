const https = require('https');
const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const u = url.startsWith('http') ? url : `https://www.conceptautotech.com${url}`;
    const lib = u.startsWith('https') ? https : http;
    
    const req = lib.get(u, {
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
  console.log("Fetching /products.html...");
  const res = await fetchUrl('/products.html');
  console.log("Status:", res.status);
  console.log("Body length:", res.body ? res.body.length : 0);
  
  if (res.body) {
    // Extract all category & product links
    const matches = res.body.match(/href="([^"]*\.html[^"]*)"/g) || [];
    const links = Array.from(new Set(matches.map(m => m.replace(/href="|"/g, ''))));
    console.log("Total unique .html links found on products.html:", links.length);
    console.log("Sample links:", links.slice(0, 30));
  }
}

run();
