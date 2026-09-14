const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
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
  console.log("Fetching old website homepage...");
  const res = await fetchUrl('https://www.conceptautotech.com/');
  console.log("Status:", res.status);
  console.log("Body length:", res.body ? res.body.length : 0);
  
  if (res.body) {
    // Find all links
    const matches = res.body.match(/href="([^"]*)"/g) || [];
    console.log("Found links:", matches.length);
    const productLinks = matches.filter(l => l.includes('.html') || l.includes('product') || l.includes('category'));
    console.log("Sample product/cat links:", productLinks.slice(0, 15));

    const images = res.body.match(/src="([^"]*)"/g) || [];
    console.log("Found image srcs:", images.length);
    console.log("Sample images:", images.slice(0, 15));
  }
}

run();
