const fs = require('fs');

const scrapedData = JSON.parse(fs.readFileSync('scratch/scraped_data.json', 'utf8'));

console.log("Scraped Data Type:", typeof scrapedData, Array.isArray(scrapedData) ? 'Array' : 'Object');
if (Array.isArray(scrapedData)) {
  console.log("Array length:", scrapedData.length);
  console.log("Sample item:", scrapedData[0]);
} else {
  const keys = Object.keys(scrapedData);
  console.log("Object keys count:", keys.length);
  console.log("Sample key:", keys[0], scrapedData[keys[0]]);
}
