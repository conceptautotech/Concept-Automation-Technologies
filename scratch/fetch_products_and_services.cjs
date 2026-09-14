const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br'
  }
};

https.get('https://www.indiamart.com/conceptautomationtechnologies/products-and-services.html', options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Encoding:', res.headers['content-encoding']);
  
  let stream = res;
  const encoding = res.headers['content-encoding'];
  if (encoding === 'br') {
    stream = res.pipe(zlib.createBrotliDecompress());
  } else if (encoding === 'gzip') {
    stream = res.pipe(zlib.createGunzip());
  } else if (encoding === 'deflate') {
    stream = res.pipe(zlib.createInflate());
  }
  
  const chunks = [];
  stream.on('data', chunk => chunks.push(chunk));
  stream.on('end', () => {
    const data = Buffer.concat(chunks).toString('utf8');
    console.log('Decompressed length:', data.length);
    fs.writeFileSync('scratch/products_and_services.html', data);
    
    // Look for all category links
    const catLinks = [];
    const regex = /href="\/conceptautomationtechnologies\/([a-zA-Z0-9_-]+\.html)"/g;
    let m;
    while ((m = regex.exec(data)) !== null) {
      catLinks.push(m[1]);
    }
    const unique = [...new Set(catLinks)];
    console.log('All links on products-and-services:', unique.length);
    unique.forEach(u => console.log(' -', u));

    // Look for products in enquiry data
    const prodRegex = /&quot;productId&quot;:(\d+),&quot;productName&quot;:&quot;([^&]+)&quot;,&quot;productImage&quot;:&quot;([^&]+)&quot;/g;
    let pMatch;
    const prods = {};
    while ((pMatch = prodRegex.exec(data)) !== null) {
      prods[pMatch[1]] = { id: pMatch[1], name: pMatch[2], img: pMatch[3].replace(/\\/g, '') };
    }
    console.log('Enquiry products found:', Object.keys(prods).length);

    // Look for window.__COMPANY_DATA__
    const compMatch = data.match(/window\.__COMPANY_DATA__\s*=\s*(\{[\s\S]*?\});/);
    if (compMatch) {
      const comp = JSON.parse(compMatch[1]);
      console.log('Company categories count:', comp.categories ? comp.categories.length : 0);
      let compProds = 0;
      if (comp.categories) {
        comp.categories.forEach(c => {
          if (c.products) compProds += c.products.length;
        });
      }
      console.log('Company categories total products:', compProds);
      fs.writeFileSync('scratch/products_and_services_company.json', JSON.stringify(comp, null, 2));
    }
  });
}).on('error', err => console.error(err));
