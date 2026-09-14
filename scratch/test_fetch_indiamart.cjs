const https = require('https');
const http = require('http');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', err => resolve({ status: 'ERROR', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
  });
}

async function run() {
  console.log("Fetching IndiaMart store homepage...");
  const res = await fetchUrl('https://www.indiamart.com/conceptautomationtechnologies/');
  console.log("Status:", res.status);
  console.log("Body length:", res.body ? res.body.length : 0);
  
  if (res.body) {
    // Look for product links or JSON data
    const matches = res.body.match(/href="([^"]*proddetail[^"]*)"/g) || [];
    console.log("Found proddetail links:", matches.length);
    console.log("Sample links:", matches.slice(0, 10));

    // Look for image links
    const imgMatches = res.body.match(/https:\/\/5\.imimg\.com\/[^\s"']+/g) || [];
    console.log("Found imimg image links:", imgMatches.length);
    console.log("Sample images:", imgMatches.slice(0, 10));
  }
}

run();
