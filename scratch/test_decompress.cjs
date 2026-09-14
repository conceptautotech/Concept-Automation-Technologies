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

https.get('https://www.indiamart.com/conceptautomationtechnologies/mitsubishi-hmi.html', options, (res) => {
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
    fs.writeFileSync('scratch/decompressed_cat.html', data);
    const imgs = data.match(/https?:\/\/[^"'<>\s]+\.imimg\.com\/[^"'<>\s]+/g) || [];
    console.log('Total imimg URLs:', imgs.length);
    const unique = [...new Set(imgs)];
    console.log('Unique imimg URLs:', unique.length);
    unique.slice(0, 20).forEach(u => console.log(' -', u));
  });
}).on('error', err => console.error(err));
