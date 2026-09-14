const https = require('https');
const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
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
    req.on('error', err => resolve({ status: 'ERROR', error: err.message, body: '' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT', body: '' }); });
  });
}

async function run() {
  const urls = [
    'https://m.indiamart.com/conceptautomationtechnologies/',
    'https://m.indiamart.com/conceptautomationtechnologies/allproducts.html',
    'https://www.indiamart.com/company/89143389/',
    'https://www.indiamart.com/conceptautomationtechnologies/all-products.html',
    'https://www.indiamart.com/conceptautomationtechnologies/search.html'
  ];

  for (const url of urls) {
    console.log(`\nFetching: ${url}`);
    const res = await fetchUrl(url);
    console.log(`Status: ${res.status}, Body Length: ${res.body ? res.body.length : 0}`);
    if (res.body) {
      const proddetails = res.body.match(/proddetail\/[^\s"'>]+/g) || res.body.match(/proddetail[^\s"'>]+/g) || [];
      const images = res.body.match(/https:\/\/5\.imimg\.com\/[^\s"'>]+/g) || [];
      console.log(`  -> Proddetail links found: ${proddetails.length}`);
      console.log(`  -> Imimg image links found: ${images.length}`);
      if (proddetails.length > 0) {
        console.log(`  -> Sample proddetails:`, proddetails.slice(0, 5));
      }
      if (images.length > 0) {
        console.log(`  -> Sample images:`, images.slice(0, 5));
      }
    }
  }
}

run();
