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
  const sitemapRes = await fetchUrl('https://www.conceptautotech.com/sitemap.xml');
  if (sitemapRes.body) {
    const urls = sitemapRes.body.match(/<loc>(.*?)<\/loc>/g) || [];
    console.log(`Total URLs in old website sitemap.xml: ${urls.length}`);
    console.log("Sample sitemap URLs:", urls.slice(0, 20).map(u => u.replace(/<\/?loc>/g, '')));
  }
}

run();
