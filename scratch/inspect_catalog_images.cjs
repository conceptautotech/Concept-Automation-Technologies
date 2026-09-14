const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/catalog.ts');
const content = fs.readFileSync(filePath, 'utf8');

const regex = /"image":\s*"([^"]+)"/g;
let match;
const imageCounts = new Map();
let total = 0;

while ((match = regex.exec(content)) !== null) {
  total++;
  const url = match[1];
  imageCounts.set(url, (imageCounts.get(url) || 0) + 1);
}

console.log(`Total image fields found: ${total}`);
console.log(`Unique image URLs count: ${imageCounts.size}`);

// Show top 15 most repeated image URLs
const sorted = Array.from(imageCounts.entries()).sort((a, b) => b[1] - a[1]);
console.log('\nTop repeated image URLs:');
sorted.slice(0, 15).forEach(([url, count]) => {
  console.log(`${count} times: ${url}`);
});
