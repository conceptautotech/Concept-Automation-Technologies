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
  console.log("Fetching products-and-services.html...");
  const psRes = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/products-and-services.html');
  const html = psRes.body || '';

  const catLinks = new Set();
  const prodLinks = new Set();

  const hrefRegex = /href="([^"]+)"/g;
  let m;
  while ((m = hrefRegex.exec(html)) !== null) {
    const link = m[1];
    if (link.includes('conceptautomationtechnologies') && link.endsWith('.html')) {
      catLinks.add(link);
    } else if (link.includes('/proddetail/')) {
      prodLinks.add(link);
    }
  }

  console.log(`products-and-services.html links -> Categories: ${catLinks.size}, Products: ${prodLinks.size}`);
  console.log("Categories list:", Array.from(catLinks));

  // Let's also check if desktop site or sitemap has more links
  const sitemapRes = await fetchUrl('https://www.conceptautotech.com/sitemap.xml');
  console.log("Sitemap status:", sitemapRes.status, "body length:", sitemapRes.body?.length);
}

run();
