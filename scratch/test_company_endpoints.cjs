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
      stream.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', (err) => resolve({ status: 500, body: '' }));
  });
}

async function run() {
  console.log("Testing IndiaMart Company ID endpoints...");

  // Test 1: Company products endpoint
  const ep1 = await fetchUrl('https://m.indiamart.com/company/89143389/');
  console.log("EP1 status:", ep1.status, "body length:", ep1.body?.length);

  // Search for proddetails in EP1
  const p1Details = ep1.body ? (ep1.body.match(/\/proddetail\/[^\s"']+/g) || []) : [];
  console.log("EP1 proddetails found:", new Set(p1Details).size);

  // Test 2: Search endpoint on mobile site for company
  const ep2 = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/search.html');
  console.log("EP2 status:", ep2.status, "body length:", ep2.body?.length);
  const p2Details = ep2.body ? (ep2.body.match(/\/proddetail\/[^\s"']+/g) || []) : [];
  console.log("EP2 proddetails found:", new Set(p2Details).size);

  // Test 3: Check IndiaMart seller catalog page links
  const ep3 = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/products-and-services.html');
  console.log("EP3 status:", ep3.status, "body length:", ep3.body?.length);
}

run();
