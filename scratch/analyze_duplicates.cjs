const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/catalog.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Match each product object JSON-like block
const productRegex = /{\s*"id":\s*"([^"]+)"[\s\S]*?"image":\s*"([^"]+)"[\s\S]*?"slug":\s*"([^"]+)"/g;
let match;
const urlToProducts = new Map();

while ((match = productRegex.exec(content)) !== null) {
  const id = match[1];
  const image = match[2];
  const slug = match[3];

  if (!urlToProducts.has(image)) {
    urlToProducts.set(image, []);
  }
  urlToProducts.get(image).push({ id, slug });
}

console.log(`Unique image URLs: ${urlToProducts.size}`);

for (const [image, items] of urlToProducts.entries()) {
  if (items.length > 1) {
    console.log(`\nURL: ${image}`);
    console.log(`Used by ${items.length} products:`);
    items.forEach(it => console.log(`  - ${it.id} (${it.slug})`));
  }
}
