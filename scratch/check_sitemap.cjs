const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
  });
}

async function run() {
  console.log("Checking sitemap.xml...");
  const sitemaps = [
    'https://www.conceptautotech.com/sitemap.xml',
    'https://www.conceptautotech.com/sitemap_index.xml',
    'https://www.conceptautotech.com/sitemap.txt',
    'https://www.conceptautotech.com/robots.txt'
  ];

  for (const sm of sitemaps) {
    const res = await fetchUrl(sm);
    console.log(`${sm} -> Status: ${res.status}, Body length: ${res.body ? res.body.length : 0}`);
    if (res.body && res.status === 200) {
      console.log("Snippet:", res.body.slice(0, 300));
    }
  }
}

run();
