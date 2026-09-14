const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const u = url.startsWith('http') ? url : `https://www.conceptautotech.com${url.startsWith('/') ? '' : '/'}${url}`;
    https.get(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      timeout: 10000
    }, (res) => {
      const zlib = require('zlib');
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());
      
      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
  });
}

async function run() {
  console.log("Inspecting category & pagination links...");
  const res = await fetchUrl('/products.html');
  if (res.body) {
    const html = res.body;
    const catLinks = (html.match(/href="([^"]*)"/gi) || [])
      .map(m => m.replace(/href="|"/gi, ''))
      .filter(l => l.endsWith('.html') && !l.includes('contact') && !l.includes('company') && !l.match(/-\d+\.html$/));
    
    const uniqueCats = Array.from(new Set(catLinks));
    console.log(`Found ${uniqueCats.length} category/group pages on products.html:`);
    console.log(uniqueCats);
  }
}

run();
