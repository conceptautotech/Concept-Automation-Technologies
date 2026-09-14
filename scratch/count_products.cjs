const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/catalog.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Parse all product objects in allProducts
const regex = /{\s*"id":\s*"([^"]+)",[\s\S]*?"slug":\s*"([^"]+)"\s*,?\s*"stock":\s*(true|false)\s*}/g;
let match;
let count = 0;
const duplicatesMap = new Map();

while ((match = regex.exec(content)) !== null) {
  count++;
}

console.log(`Total products parsed: ${count}`);
