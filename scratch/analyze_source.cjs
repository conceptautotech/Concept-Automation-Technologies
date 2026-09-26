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
      stream.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const body = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/products-and-services.html');
  fs.writeFileSync('scratch/m_products_and_services.html', body);
  console.log('Downloaded length:', body.length);
  
  const prods = (body.match(/\/proddetail\/[^\s"']+/g) || []);
  console.log('Proddetails found in mobile products-and-services:', new Set(prods).size);
  
  const links = (body.match(/href="([^"]+)"/g) || []).map(m => m.replace(/href="|"/g, ''));
  const catLinks = links.filter(l => l.includes('conceptautomationtechnologies') && l.endsWith('.html'));
  const uniqueCats = [...new Set(catLinks)];
  console.log('Category links found:', uniqueCats.length);
  console.log('Category links:', uniqueCats);
}

run();
