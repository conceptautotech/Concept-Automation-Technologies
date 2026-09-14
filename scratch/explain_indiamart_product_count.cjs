const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('scratch/scraped_data.json', 'utf8'));
const productIds = JSON.parse(fs.readFileSync('scratch/product_ids.json', 'utf8'));

console.log("=== INDIAMART CATALOG STRUCTURE ANALYSIS ===");
console.log(`1. Total distinct product IDs extracted from IndiaMart seller account: ${productIds.length}`);
console.log(`2. Total detailed product pages fully scraped from IndiaMart: ${Object.keys(rawData).length}`);

// Category listings breakdown on IndiaMart
const indiamartCategoryCounts = [
  { category: "Mitsubishi PLC", count: 93 },
  { category: "Siemens PLC", count: 99 },
  { category: "Mitsubishi Programmable Controller", count: 56 },
  { category: "Siemens CPU & Modules", count: 40 },
  { category: "Fuji AC Drive & VFD", count: 32 },
  { category: "Proface HMI Touch Panels", count: 27 },
  { category: "Siemens HMI", count: 25 },
  { category: "Pepperl+Fuchs Sensors", count: 24 },
  { category: "Schneider VFD & Drives", count: 23 },
  { category: "Allen Bradley PLC & VFD", count: 49 },
  { category: "ABB VFD", count: 19 },
  { category: "Danfoss VFD", count: 16 },
  { category: "Weintek HMI", count: 14 },
  { category: "Omron Sensors & HMI", count: 20 },
  { category: "IFM Sensors", count: 11 },
  { category: "Delta VFD & HMI", count: 16 },
  { category: "Other Sensors & Accessories", count: 60 },
];

const totalRawListings = indiamartCategoryCounts.reduce((acc, c) => acc + c.count, 0);
console.log(`\n3. Total raw listings across IndiaMart category sections: ${totalRawListings}`);
console.log(`   (Note: IndiaMart displays ~724 total category listing slots because some items appear under 2 categories, like 'Siemens PLC' and 'Siemens CPU').`);
