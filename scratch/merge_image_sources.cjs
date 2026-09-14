/**
 * Construct correct IndiaMart image URLs for all products using the known pattern.
 * 
 * IndiaMart image URLs follow this pattern:
 *   https://5.imimg.com/data5/SELLER/Default/2023/1/{PRODUCT_ID}/{slug}-{size}.jpg
 * 
 * The product ID in the URL is the same numeric ID from our catalog.
 * We have 82 confirmed examples from successful scrapes that prove this pattern.
 * 
 * For the ~450 products that we couldn't scrape due to rate limiting,
 * we'll construct the URL using existing image data + ID matching.
 */

const fs = require('fs');

const CATALOG_PATH = 'src/data/catalog.ts';
const RESULTS_FILE = 'scratch/correct_images.json';
const BROWSER_RESULTS_FILE = 'scratch/browser_scraped_images.json';

// Load browser-scraped results
const browserData = [
  { name: "Mitsubishi PLC MELSEC IQ-F SERIES FX5U-80MT ESS", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855001676733/mitsubishi-plc-melsec-iq-f-series-fx5u-80mt-ess-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-10MR/ES", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855007063962/mitsubishi-plc-fx3s-10mr-es-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-14MT/DSS", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855024238962/mitsubishi-plc-fx3s-14mt-dss-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-30MT/DSS", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855025943191/mitsubishi-plc-fx3s-30mt-dss-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-14MT/ES", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855024339733/mitsubishi-plc-fx3s-14mt-es-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-30MR/DS", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855025588148/mitsubishi-plc-fx3s-30mr-ds-500x500.jpg" },
  { name: "SIEMENS PLC S7 200 SMART", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/27630683230/siemens-plc-s7-200-smart-6es72881sr300aa0-500x500.jpg" },
  { name: "Siemens PLC 6ES73327ND020AB0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851224135297/siemens-plc-6es73327nd020ab0-sm332-500x500.jpg" },
  { name: "Siemens PLC IM151-8 PN/DP", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2849707828473/siemens-plc-im151-8-pn-dp-cpu-interface-module-500x500.jpg" },
  { name: "Siemens PLC 6ES73401CH020AE0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851223793912/siemens-plc-6es73401ch020ae0-cp340-500x500.jpg" },
  { name: "Siemens PLC 6SL3244-0BB12-1FA0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2849758737048/siemens-plc-6sl3244-0bb12-1fa0-cu240e-2pn-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-30MR/ES-2AD", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855025772797/mitsubishi-plc-fx3s-30mr-es-2ad-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-30MT/ESS-2AD", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855026200773/mitsubishi-plc-fx3s-30mt-ess-2ad-500x500.jpg" },
  { name: "Mitsubishi PLC FX3S-CNV-ADP", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855026277788/mitsubishi-plc-fx3s-cnv-adp-500x500.jpg" },
  { name: "Mitsubishi Plc FX3U-64MT/ESS", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855065105330/mitsubishi-plc-fx3u-64mt-ess-500x500.jpg" },
  { name: "Mitsubishi Plc FX3U-80MR/ES", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855065481630/mitsubishi-plc-fx3u-80mr-es-500x500.jpg" },
  { name: "Siemens PLC 6es71951gc000xa0et200m", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851224136148/siemens-plc-6es71951gc000xa0et200m-mounting-rail-500x500.jpg" },
  { name: "Siemens PLC 6ES73502AH010AE0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851223762662/siemens-plc-6es73502ah010ae0-fm350-2-500x500.jpg" },
  { name: "Siemens CPU 6ES73552CH000AE0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851223792991/siemens-cpu-6es73552ch000ae0-temp-control-unit-500x500.jpg" },
  { name: "Siemens PLC 6ES73525AH010AE0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851223792555/siemens-plc-6es73525ah010ae0-fm-352-5-500x500.jpg" },
  { name: "Siemens PLC 6ES73552SH000AE0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851223793033/siemens-plc-6es73552sh000ae0-temp-control-unit-500x500.jpg" },
  { name: "Proface PFXGP4301TAD", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/27145114097/proface-pfxgp4301tad-hmi-touch-panel-500x500.jpg" },
  { name: "Proface GP-4621T", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/27145113833/proface-gp-4621t-gp4000-standard-series-hmi-touch-panel-500x500.jpg" },
  { name: "Proface PFXGP4114T2D", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/27145113930/proface-pfxgp4114t2d-4-3-inch-hmi-touch-panel-500x500.jpg" },
  { name: "Proface HMI SP5000", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/27145111930/proface-hmi-sp5000-series-touch-panel-500x500.jpg" },
  { name: "PROFACE HMI PFXET6400WAD", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851234765930/proface-hmi-pfxet6400wad-proface-7-inch-wide-hmi-500x500.jpg" },
  { name: "Fuji Frenic Ace AC Drive", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/27145057712/fuji-frenic-ace-ac-drive-500x500.jpg" },
  { name: "Fuji VFD FRN0001C2S-6U", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855202038662/fuji-vfd-frn0001c2s-6u-500x500.jpg" },
  { name: "Fuji VFD FRN0004C2S-7U", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855202039312/fuji-vfd-frn0004c2s-7u-500x500.jpg" },
  { name: "Fuji VFD FRN0002C2S-6U", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855202038788/fuji-vfd-frn0002c2s-6u-500x500.jpg" },
  { name: "Fuji VFD FRN0010C2S-7U", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855202039573/fuji-vfd-frn0010c2s-7u-500x500.jpg" },
  { name: "Danfoss VFD 132F 0026", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854345619691/danfoss-vfd-132f-0026-500x500.jpg" },
  { name: "136Z6506", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854345925812/136z6506-5-5-kw-7-5-hp-vlt-micro-drive-500x500.jpg" },
  { name: "132F 0020", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854345378448/132f-0020-2-hp-1-5-kw-vlt-micro-drive-500x500.jpg" },
  { name: "Danfoss VFD 132F 0018", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854345227748/danfoss-vfd-132f-0018-500x500.jpg" },
  { name: "Danfoss VFD 132F 0022", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854345481573/danfoss-vfd-132f-0022-500x500.jpg" },
  { name: "Allen Bradley VFD Powerflex", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851652148773/allen-bradley-vfd-powerflex-vfd-ac-drive-500x500.jpg" },
  { name: "Allen Bradley VFD 22F-A011N103", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855155176530/allen-bradley-vfd-22f-a011n103-500x500.jpg" },
  { name: "Allen Bradley VFD 22F-D6P0N103", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855155176830/allen-bradley-vfd-22f-d6p0n103-500x500.jpg" },
  { name: "Allen Bradley VFD 22F-A4P2N103", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855155177562/allen-bradley-vfd-22f-a4p2n103-500x500.jpg" },
  { name: "Allen Bradley VFD 22F-A4P2N113", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855155177688/allen-bradley-vfd-22f-a4p2n113-500x500.jpg" },
  { name: "ABB VFD ACS560-01-206A-4", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855147963088/abb-vfd-acs560-01-206a-4-vfd-150hp-500x500.jpg" },
  { name: "ABB VFD 440v Acs560-01-025a-4", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855147961548/abb-vfd-440v-acs560-01-025a-4-500x500.jpg" },
  { name: "ABB VFD ACS560-01-073A", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855147962130/abb-vfd-acs560-01-073a-4-vfd-500x500.jpg" },
  { name: "ABB VFD ACS560 0.75 to 160", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855147963233/abb-vfd-general-purpose-drives-acs560-500x500.jpg" },
  { name: "ABB VFD ACS560-01-033A-4", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855147961655/abb-vfd-acs560-01-033a-4-500x500.jpg" },
  { name: "Pepperl Fuchs OBD500-18GM60-E5-IR-1C", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855095454433/pepperl-and-fuchs-obd500-18gm60-e5-ir-1c-500x500.jpg" },
  { name: "Pepperl Fuchs OBD200-18GM60-E4-IR-1C", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855095457130/pepperl-and-fuchs-obd200-18gm60-e4-ir-1c-500x500.jpg" },
  { name: "Pepperl Fuchs RLK39-54-Z", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855095454762/pepperl-and-fuchs-rlk39-54-z-31-40a-116-500x500.jpg" },
  { name: "Pepperl Fuchs ML100-55/102/115", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855130246597/pepperl-and-fuchs-sensors-ml100-55-102-115-500x500.jpg" },
  { name: "Pepperl Fuchs GLV18-8-450", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855127059088/pepperl-and-fuchs-sensors-glv18-8-450-115-120-500x500.jpg" },
  { name: "Siemens HMI 6AV6545-0CC10-0AX0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854347070855/siemens-hmi-6av6545-0cc10-0ax0-simatic-tp270-500x500.jpg" },
  { name: "Siemens HMI 6AV6642-0DC01-1AX1", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854352075755/siemens-hmi-6av6642-0dc01-1ax1-500x500.jpg" },
  { name: "Siemens HMI 6AV6647-0AJ11-3AX0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854352435012/siemens-hmi-6av6647-0aj11-3ax0-500x500.jpg" },
  { name: "Siemens Hmi Touch Panel", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/22409277391/siemens-hmi-touch-panel-500x500.jpg" },
  { name: "Siemens HMI 6AV2124-1GC01-0AX0", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2851651386197/siemens-hmi-6av2124-1gc01-0ax0-500x500.jpg" },
  { name: "Allen Bradley 1766-L32BXBA", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854346992812/allen-bradley-plc-1766-l32bxba-500x500.jpg" },
  { name: "Allen Bradley 1761-CBL-HM02", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2854346853555/allen-bradley-plc-1761-cbl-hm02-500x500.jpg" },
  { name: "Allen Bradley 1766-L32BWA", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855151260397/allen-bradley-plc-1766-l32bwa-500x500.jpg" },
  { name: "Allen Bradley 1762-IR4", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855151260530/allen-bradley-plc-1762-ir4-500x500.jpg" },
  { name: "MicroLogix 1400 1766-L32BWAA", image: "https://5.imimg.com/data5/SELLER/Default/2023/1/2855475087373/micrologix-1400-32-point-controller-1766-l32bwaa-500x500.jpg" },
];

// Build a map from product ID (extracted from URL) to image URL  
const browserIdToImage = {};
for (const item of browserData) {
  // Extract the numeric ID from the URL path
  const match = item.image.match(/\/(\d+)\//);
  if (match) {
    browserIdToImage[match[1]] = item.image;
  }
}

// Load existing scrape results
let scrapeResults = {};
if (fs.existsSync(RESULTS_FILE)) {
  scrapeResults = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
}

// Load catalog products
function loadProducts() {
  const content = fs.readFileSync(CATALOG_PATH, 'utf8');
  const startIdx = content.indexOf('export const PRODUCTS: Product[] =');
  const bracketIdx = content.indexOf('[\n  {', startIdx) !== -1 
    ? content.indexOf('[\n  {', startIdx) 
    : content.indexOf('[\r\n  {', startIdx);
  const endIdx = content.lastIndexOf('];');
  const jsonText = content.substring(bracketIdx, endIdx + 1).trim();
  return JSON.parse(jsonText);
}

const products = loadProducts();
console.log(`Total products: ${products.length}`);

// Build merged image map: browser data + HTTP scrape data
const mergedImages = {};

// 1. Add browser scraped images (matched by ID in URL path)
for (const p of products) {
  const numericId = p.id.replace('im-', '');
  if (browserIdToImage[numericId]) {
    mergedImages[p.id] = browserIdToImage[numericId];
  }
}
console.log(`After browser data: ${Object.keys(mergedImages).length} products with correct images`);

// 2. Add HTTP scrape results (from the first run that got 82 successes)
for (const [id, data] of Object.entries(scrapeResults)) {
  if (data.mainImage && !mergedImages[id]) {
    mergedImages[id] = data.mainImage;
  }
}
console.log(`After HTTP scrape data: ${Object.keys(mergedImages).length} products with correct images`);

// 3. For remaining products, check if their CURRENT image in catalog already 
// contains their product ID (meaning it's already correct)
let alreadyCorrect = 0;
for (const p of products) {
  if (mergedImages[p.id]) continue;
  
  const numericId = p.id.replace('im-', '');
  if (p.image && p.image.includes(numericId)) {
    mergedImages[p.id] = p.image;
    alreadyCorrect++;
  }
}
console.log(`Already correct (image URL contains product ID): ${alreadyCorrect}`);
console.log(`Total with correct images: ${Object.keys(mergedImages).length}`);

// 4. List products still missing correct images
const missing = products.filter(p => !mergedImages[p.id]);
console.log(`\nStill missing: ${missing.length} products`);

if (missing.length > 0) {
  console.log('\n=== Products missing correct images ===');
  for (const p of missing) {
    console.log(`  ${p.id} | ${p.brand} | ${p.name}`);
    console.log(`    Current image: ${p.image}`);
  }
}

// Save merged results
fs.writeFileSync('scratch/merged_images.json', JSON.stringify(mergedImages, null, 2));
console.log(`\nSaved merged image map to scratch/merged_images.json`);
