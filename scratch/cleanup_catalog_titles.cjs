const fs = require('fs');

const content = fs.readFileSync('src/data/catalog.ts', 'utf8');
const startIdx = content.indexOf('export const PRODUCTS: Product[] = [');
const jsonText = content.substring(startIdx + 'export const PRODUCTS: Product[] = '.length, content.lastIndexOf(';') > content.lastIndexOf(']') ? content.lastIndexOf(';') : content.length).trim();

const products = JSON.parse(jsonText);

let titleFixes = 0;

for (const p of products) {
  if (p.title.toLowerCase().includes('general specifications') || p.title.toLowerCase().includes('technical data') || p.title.toLowerCase().includes('overview')) {
    if (p.specs && p.specs['Model Name/Number']) {
      p.title = `${p.brand} ${p.specs['Model Name/Number']}`;
      p.partNumber = p.specs['Model Name/Number'].toUpperCase();
      titleFixes++;
    } else if (p.specs && p.specs['Manufacturer Series']) {
      p.title = `${p.brand} ${p.specs['Manufacturer Series']} Series ${p.category.split(' ')[0]}`;
      p.partNumber = p.specs['Manufacturer Series'].toUpperCase();
      titleFixes++;
    }
  }
}

console.log(`Cleaned up ${titleFixes} generic titles.`);

const catalogTsContent = `export interface Product {
  id: string;
  title: string;
  partNumber: string;
  brand: string;
  category: string;
  price: string;
  priceNumeric: number;
  description: string;
  specs: Record<string, string>;
  image: string;
  inStock: boolean;
  rating: number;
  featured?: boolean;
}

export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('src/data/catalog.ts', catalogTsContent, 'utf8');
console.log("Updated catalog.ts successfully.");
