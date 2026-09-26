const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    }, res => {
      let stream = res;
      const enc = res.headers['content-encoding'];
      if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());
      else if (enc === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
      
      let data = '';
      stream.on('data', c => data += c);
      stream.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  const r = await fetch('https://www.indiamart.com/conceptautomationtechnologies/');
  console.log('Status:', r.status, 'Length:', r.data.length);
  const title = r.data.match(/<title>([^<]+)<\/title>/i);
  console.log('Title:', title ? title[1] : 'none');
  
  // Find category links or product links
  const matches = [...r.data.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  const imLinks = matches.filter(l => l.includes('conceptautomationtechnologies') || l.includes('proddetail'));
  console.log('Total internal links:', imLinks.length);
  console.log('Sample links:', [...new Set(imLinks)].slice(0, 30));
  fs.writeFileSync('scratch/home.html', r.data);
}

run().catch(console.error);
