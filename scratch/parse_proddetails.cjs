const fs = require('fs');

const html = fs.readFileSync('scratch/mitsubishi_plc_mobile.html', 'utf8');

// Match proddetail anchors or cards
// Example: <a ... href="/proddetail/mitsubishi-plc-melsec-iq-f-series-fx5u-80mt-ess-2855001676733.html"><img ... src="..." alt="Mitsubishi PLC MELSEC IQ-F SERIES FX5U-80MT ESS ₹ 86,000/Piece" ... /></a>
// Or <p id="prod_name_2855001676733">...

const detailRegex = /href="(\/proddetail\/([^"]+)\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
const products = [];

while ((match = detailRegex.exec(html)) !== null) {
  const fullHref = match[1];
  const slugPart = match[2];
  const innerHtml = match[3];

  const imgMatch = innerHtml.match(/src="([^"]+)"/i);
  const altMatch = innerHtml.match(/alt="([^"]+)"/i);

  if (altMatch || imgMatch) {
    products.push({
      href: fullHref,
      slugPart,
      image: imgMatch ? imgMatch[1] : '',
      alt: altMatch ? altMatch[1] : ''
    });
  }
}

console.log(`Matched ${products.length} products directly from anchor tags.`);
console.log("Sample extracted products:", products.slice(0, 10));
