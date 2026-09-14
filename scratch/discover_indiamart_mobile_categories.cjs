const https = require('https');

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
      const zlib = require('zlib');
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (res.headers['content-encoding'] === 'deflate') stream = res.pipe(zlib.createInflate());

      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
  });
}

async function run() {
  console.log("Discovering all category & product links from mobile site...");
  const res = await fetchUrl('https://m.indiamart.com/conceptautomationtechnologies/');
  if (res.body) {
    const html = res.body;

    // Find all href links
    const matches = html.match(/href="([^"]*)"/gi) || [];
    const links = Array.from(new Set(matches.map(m => m.replace(/href="|"/gi, ''))));
    console.log(`Total links on mobile store homepage: ${links.length}`);
    
    const catLinks = links.filter(l => l.includes('conceptautomationtechnologies') || l.includes('/cat') || l.includes('/search') || l.includes('impcat') || l.includes('.html'));
    console.log("Category & product links:", catLinks.slice(0, 30));

    // Also check for category names or dropdowns in HTML
    const catMatches = html.match(/class="[^"]*cat[^"]*"[^>]*>([\s\S]*?)<\/a>/gi) || [];
    console.log("Category badges found:", catMatches.slice(0, 15));
  }
}

run();
