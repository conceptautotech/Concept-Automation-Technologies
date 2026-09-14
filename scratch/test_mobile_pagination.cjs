const https = require('https');
const zlib = require('zlib');

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
  console.log("Checking page 1 vs page 2 vs AJAX...");
  const p1 = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/mitsubishi-plc.html');
  const p2 = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/mitsubishi-plc.html?page=2');
  const p3 = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/mitsubishi-plc.html?p=2');

  console.log("Page 1 length:", p1.body?.length);
  console.log("Page 2 length:", p2.body?.length);
  console.log("Page 3 length:", p3.body?.length);
  
  // Check if page 2 has different proddetails
  const p1Details = (p1.body?.match(/\/proddetail\/[^\s"']+/g) || []);
  const p2Details = (p2.body?.match(/\/proddetail\/[^\s"']+/g) || []);
  console.log(`P1 proddetails: ${new Set(p1Details).size}, P2 proddetails: ${new Set(p2Details).size}`);
}

run();
