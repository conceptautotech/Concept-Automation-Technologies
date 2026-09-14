const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 15000
    }, (res) => {
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());

      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', (err) => resolve({ status: 500, error: err }));
  });
}

async function run() {
  console.log("Fetching home mobile page...");
  const homeRes = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/');
  const html = homeRes.body;

  // Extract all category URLs matching conceptautomationtechnologies/*.html
  const categoryRegex = /href="(\/conceptautomationtechnologies\/[^"]+\.html)"/g;
  const categories = new Set();
  let match;
  while ((match = categoryRegex.exec(html)) !== null) {
    categories.add(match[1]);
  }

  console.log(`Found ${categories.size} unique category pages:`, Array.from(categories));
}

run();
