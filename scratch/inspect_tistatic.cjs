const https = require('https');
const zlib = require('zlib');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 12000
    }, (res) => {
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());

      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (err) => resolve({ status: 500, body: '' }));
  });
}

async function run() {
  const pRes = await fetchUrl('https://www.conceptautotech.com/siemens-plc.html');
  const html = pRes.body || '';

  console.log("Length:", html.length);
  const imgs = html.match(/<img[^>]+>/gi) || [];
  console.log(`Found ${imgs.length} <img> tags on siemens-plc.html`);
  for (const img of imgs.slice(0, 15)) {
    console.log(img);
  }
}

run();
