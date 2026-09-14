const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/catalog.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Function to generate inline SVG data URL for product
function makeSvg(name, brand, partNumber) {
  const cleanName = (name || "Automation Hardware").replace(/[^a-zA-Z0-9\s-+]/g, "").slice(0, 32);
  const cleanBrand = (brand || "CONCEPT AUTOMATION").toUpperCase();
  const cleanPn = (partNumber || "").toUpperCase().trim();

  let brandColor = "#ea580c";
  const bLower = (brand || "").toLowerCase();
  if (bLower.includes("siemens")) brandColor = "#009999";
  else if (bLower.includes("mitsubishi")) brandColor = "#e60012";
  else if (bLower.includes("omron")) brandColor = "#005bb5";
  else if (bLower.includes("abb")) brandColor = "#ff0000";
  else if (bLower.includes("schneider")) brandColor = "#009639";
  else if (bLower.includes("delta")) brandColor = "#00875a";
  else if (bLower.includes("allen") || bLower.includes("ab")) brandColor = "#af272f";
  else if (bLower.includes("proface")) brandColor = "#1e293b";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280" fill="none"><rect width="400" height="280" fill="#F8FAFC"/><rect x="16" y="16" width="368" height="248" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/><rect x="16" y="16" width="368" height="6" fill="${brandColor}"/><circle cx="200" cy="95" r="30" fill="${brandColor}" fill-opacity="0.1" stroke="${brandColor}" stroke-width="2.5"/><path d="M190 95L197 102L212 87" stroke="${brandColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="200" y="150" fill="${brandColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle" letter-spacing="1.5">${cleanBrand}</text><text x="200" y="176" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">${cleanName}</text>${cleanPn ? `<rect x="110" y="190" width="180" height="24" rx="5" fill="#F1F5F9" stroke="#CBD5E1"/><text x="200" y="206" fill="#334155" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">PN: ${cleanPn}</text>` : ''}<text x="200" y="238" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" text-anchor="middle">100% Genuine Sealed Stock</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Track image usage
const imageCounts = new Map();
const productBlocks = [];

// Match all product blocks in catalog.ts
const blockRegex = /{\s*"id":\s*"(im-ext-[^"]+)"[\s\S]*?}/g;
let match;
let updatedCount = 0;

// Replace images in im-ext- products if they are duplicate template images
content = content.replace(/({\s*"id":\s*"(im-ext-\d+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"partNumber":\s*"([^"]+)"[\s\S]*?"brand":\s*"([^"]+)"[\s\S]*?"image":\s*")([^"]+)("[\s\S]*?})/g, (fullMatch, head, id, name, partNumber, brand, oldImage, tail) => {
  updatedCount++;
  const uniqueSvg = makeSvg(name, brand, partNumber);
  // Replace image and images array
  let newTail = tail.replace(/"images":\s*\[\s*"[^"]+"\s*\]/, `"images": ["${uniqueSvg}"]`);
  return `${head}${uniqueSvg}${newTail}`;
});

console.log(`Updated ${updatedCount} im-ext products with unique part-number SVG graphics.`);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated catalog.ts with 100% unique product images!');
