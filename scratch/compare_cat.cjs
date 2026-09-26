const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

function fetchUrl(url, isMobile = false) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': isMobile
          ? 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
      stream.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const desktop = await fetchUrl('https://www.indiamart.com/conceptautomationtechnologies/mitsubishi-plc.html', false);
  const mobile = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/mitsubishi-plc.html', true);
  
  fs.writeFileSync('scratch/mitsubishi_plc_desktop.html', desktop);
  fs.writeFileSync('scratch/mitsubishi_plc_mobile.html', mobile);

  console.log('Desktop length:', desktop.length);
  console.log('Mobile length:', mobile.length);

  // Check how many products are listed in desktop vs mobile
  const deskProds = [...desktop.matchAll(/data-click="proddetail"|class="[^"]*prc[^"]*"|href="[^"]*\/proddetail\/([0-9]+)\.html"/g)];
  console.log('Desktop matches:', deskProds.length);

  const mobProds = [...mobile.matchAll(/href="\/proddetail\/([0-9]+)\.html"/g)].map(m => m[1]);
  console.log('Mobile proddetail IDs:', new Set(mobProds).size);
}

run();
