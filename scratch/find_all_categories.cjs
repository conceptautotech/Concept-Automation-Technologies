const fs = require('fs');
const html = fs.readFileSync('scratch/decompressed_cat.html', 'utf8');

const catLinks = [];
const regex = /href="\/conceptautomationtechnologies\/([a-zA-Z0-9_-]+\.html)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  catLinks.push(m[1]);
}
const unique = [...new Set(catLinks)];
console.log('Unique category page links found:', unique.length);
unique.forEach(u => console.log(' - https://www.indiamart.com/conceptautomationtechnologies/' + u));

fs.writeFileSync('scratch/category_urls.json', JSON.stringify(unique, null, 2));
