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
  const res = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/mitsubishi-plc.html');
  const html = res.body || '';

  fs.writeFileSync('scratch/mitsubishi_plc_mobile.html', html);

  const prodDetailMatches = html.match(/\/proddetail\/[^\s"']+/g) || [];
  console.log(`Found ${prodDetailMatches.length} /proddetail/ matches`);
  console.log("Sample proddetail links:", Array.from(new Set(prodDetailMatches)).slice(0, 10));

  const imgMatches = html.match(/https:\/\/5\.imimg\.com\/data5\/[^\s"']+/g) || [];
  console.log(`Found ${imgMatches.length} image matches`);
  console.log("Sample image URLs:", Array.from(new Set(imgMatches)).slice(0, 10));
}

run();
