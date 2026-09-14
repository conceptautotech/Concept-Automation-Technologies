const https = require('https');

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  }
};

https.get('https://www.indiamart.com/conceptautomationtechnologies/mitsubishi-hmi.html', options, (res) => {
  console.log('Status code:', res.statusCode);
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirect to:', res.headers.location);
    return;
  }
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Page length:', data.length);
    const imgs = data.match(/https?:\/\/[^"']+\.imimg\.com\/[^"']+/g) || [];
    console.log('Total imimg URLs found:', imgs.length);
    const uniqueImgs = [...new Set(imgs)];
    console.log('Unique imimg URLs:', uniqueImgs.length);
    uniqueImgs.slice(0, 10).forEach(u => console.log(' -', u));
  });
}).on('error', err => console.error(err));
