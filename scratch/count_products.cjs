const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/catalog.ts');
const content = fs.readFileSync(filePath, 'utf8');

const idMatches = content.match(/"id":\s*"[^"]+"/g) || [];
console.log('Total products in catalog.ts:', idMatches.length);
