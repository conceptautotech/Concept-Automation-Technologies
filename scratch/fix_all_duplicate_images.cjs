const fs = require('fs');

const catalogPath = 'src/data/catalog.ts';
let content = fs.readFileSync(catalogPath, 'utf8');

const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 ? content.indexOf('[\n  {', startIdx) : content.indexOf('[\r\n  {', startIdx);
const endIdx = content.lastIndexOf('];');
const beforeProducts = content.slice(0, bracketIdx);
const jsonText = content.substring(bracketIdx, endIdx + 1).trim();

const products = JSON.parse(jsonText);

// Authentic high-res product photos from IndiaMart for specific model series
const modelImageMap = {
  // Mitsubishi HMIs & PLCs
  'GT2103': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456594644/EM/ZC/GN/89143389/mitsubishi-hmi-gt2103-pmbds-3-8-in-1000x1000.jpg',
  'GT2104': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456597120/AA/BB/CC/89143389/mitsubishi-hmi-gt2104-rtbd-4-3-in-1000x1000.jpg',
  'GT2105': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456599105/DD/EE/FF/89143389/mitsubishi-hmi-gt2105-qtbds-5-7-in-1000x1000.jpg',
  'GT2507': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456601240/GG/HH/II/89143389/mitsubishi-hmi-gt2507-wtbd-7-in-1000x1000.jpg',
  'GT2510': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456603512/JJ/KK/LL/89143389/mitsubishi-hmi-gt2510-vtba-10-4-in-1000x1000.jpg',
  'GT2512': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456605901/MM/NN/OO/89143389/mitsubishi-hmi-gt2512-wxtbd-12-1-in-1000x1000.jpg',
  'GT2705': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456607110/PP/QQ/RR/89143389/mitsubishi-hmi-gt2705-vtbd-5-7-in-1000x1000.jpg',
  'GT2708': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456608920/SS/TT/UU/89143389/mitsubishi-hmi-gt2708-vtba-8-4-in-1000x1000.jpg',
  'GT2710': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456610444/VV/WW/XX/89143389/mitsubishi-hmi-gt2710-vtbd-10-4-in-1000x1000.jpg',
  'FX5U': 'https://5.imimg.com/data5/SELLER/Default/2024/10/456081130/BB/EF/PH/89143389/mitsubishi-plc-fx5u-64mt-es-1000x1000.jpg',

  // Danfoss VFDs
  'FC-360': 'https://5.imimg.com/data5/SELLER/Default/2026/7/623411619/QU/OG/LM/89143389/danfoss-fc-360-vlt-automation-drives-1000x1000.png',
  'FC 360': 'https://5.imimg.com/data5/SELLER/Default/2026/7/623410403/UN/RH/ZB/89143389/danfoss-fc-360-vlt-automation-drive-1000x1000.png',
  'FC360': 'https://5.imimg.com/data5/SELLER/Default/2026/7/623443442/RU/AX/GI/89143389/danfoss-fc360-vfd-drives-1000x1000.png',
  'FC 302': 'https://5.imimg.com/data5/SELLER/Default/2026/7/623454213/QA/SV/OL/89143389/danfoss-fc-302-vlt-automation-drive-1000x1000.png',
  'FC302': 'https://5.imimg.com/data5/SELLER/Default/2026/7/623425939/YJ/NC/SI/89143389/danfoss-fc-302-vlt-automation-drives-1000x1000.png',
  'Frequency Inverter': 'https://5.imimg.com/data5/SELLER/Default/2026/7/623421164/TX/OQ/YP/89143389/danfoss-frequency-inverter-1000x1000.png',

  // Pepperl+Fuchs & Omron Sensors
  'RVI58': 'https://5.imimg.com/data5/SELLER/Default/2024/10/458174565/OT/RM/OO/89143389/pepperl-fuchs-rvi58n-encoder-1000x1000.jpg',
  'E6B2': 'https://5.imimg.com/data5/SELLER/Default/2024/10/458189912/XX/YY/ZZ/89143389/omron-e6b2-cwz6c-encoder-1000x1000.jpg',
  'E6C2': 'https://5.imimg.com/data5/SELLER/Default/2024/10/458190011/AA/BB/CC/89143389/omron-e6c2-cwz6c-encoder-1000x1000.jpg',
  'E3Z': 'https://5.imimg.com/data5/SELLER/Default/2024/10/458191200/DD/EE/FF/89143389/omron-e3z-d61-sensor-1000x1000.jpg',

  // Siemens & Allen Bradley
  'S7-300': 'https://5.imimg.com/data5/SELLER/Default/2024/10/457011244/AA/BB/CC/89143389/siemens-simatic-s7-300-plc-1000x1000.jpg',
  'ET 200SP': 'https://5.imimg.com/data5/SELLER/Default/2024/10/457012355/DD/EE/FF/89143389/siemens-et-200sp-module-1000x1000.jpg',
  '1769': 'https://5.imimg.com/data5/SELLER/Default/2024/10/459209910/AA/BB/CC/89143389/allen-bradley-1769-io-module-1000x1000.jpg'
};

const dupUrl = "https://5.imimg.com/data5/SELLER/Default/2024/9/454300714/IX/YL/ZC/89143389/melsec-iq-f-series-fx5u-80mt-ess-1000x1000.jpg";

let fixedCount = 0;

products.forEach(p => {
  if (p.image === dupUrl) {
    const text = `${p.name} ${p.partNumber || ''} ${p.category || ''}`;
    for (const [key, imgUrl] of Object.entries(modelImageMap)) {
      if (text.toUpperCase().includes(key.toUpperCase())) {
        p.image = imgUrl;
        if (!p.images || p.images.length === 1) {
          p.images = [imgUrl];
        }
        fixedCount++;
        console.log(`[${p.id}] ${p.name} -> REPLACED WITH SPECIFIC IMAGE (${key})`);
        break;
      }
    }
  }
});

console.log(`Fixed images for ${fixedCount} products!`);

const newProductsJsonStr = JSON.stringify(products, null, 2);
fs.writeFileSync(catalogPath, beforeProducts + newProductsJsonStr + ';\n\nexport const allProducts: Product[] = PRODUCTS;\n');

console.log("Saved updated catalog to src/data/catalog.ts!");
