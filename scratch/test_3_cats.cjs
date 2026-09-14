const https = require('https');
const zlib = require('zlib');

function fetchCategory(slug) {
  return new Promise((resolve, reject) => {
    const url = `https://www.indiamart.com/conceptautomationtechnologies/${slug}`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    };

    https.get(url, options, (res) => {
      let stream = res;
      const encoding = res.headers['content-encoding'];
      if (encoding === 'br') stream = res.pipe(zlib.createBrotliDecompress());
      else if (encoding === 'gzip') stream = res.pipe(zlib.createGunzip());
      else if (encoding === 'deflate') stream = res.pipe(zlib.createInflate());

      const chunks = [];
      stream.on('data', c => chunks.push(c));
      stream.on('end', () => {
        const html = Buffer.concat(chunks).toString('utf8');
        const prodRegex = /&quot;productId&quot;:(\d+),&quot;productName&quot;:&quot;([^&]+)&quot;,&quot;productImage&quot;:&quot;([^&]+)&quot;/g;
        let pMatch;
        const prods = {};
        while ((pMatch = prodRegex.exec(html)) !== null) {
          prods[pMatch[1]] = { id: pMatch[1], name: pMatch[2], img: pMatch[3].replace(/\\/g, '') };
        }
        resolve({ slug, statusCode: res.statusCode, products: Object.values(prods) });
      });
    }).on('error', reject);
  });
}

async function test() {
  const testCats = ['abb-vfd.html', 'allen-bradley-vfd.html', 'mitsubishi-plc.html'];
  for (const cat of testCats) {
    console.log(`Fetching ${cat}...`);
    const res = await fetchCategory(cat);
    console.log(`  ${cat} -> Status ${res.statusCode}, ${res.products.length} products found:`);
    res.products.slice(0, 5).forEach(p => console.log(`    - [${p.id}] ${p.name}\n      ${p.img}`));
    await new Promise(r => setTimeout(r, 1000));
  }
}

test().catch(console.error);
