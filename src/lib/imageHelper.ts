// Robust image URL helper with proxies and brand-specific fallback images

const FALLBACK_IMAGES: Record<string, string> = {
  "siemens-plc": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  "siemens-vfd": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  "siemens-hmi": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  "mitsubishi-plc": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  "omron-plc": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  "pepperl+fuchs-sensor": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  "allen bradley-plc": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
  "default": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
};

export function getFallbackImageUrl(brand?: string, type?: string, name?: string, partNumber?: string): string {
  return getSvgDataUrl(name || `${brand || 'Industrial'} ${type || 'Hardware'}`, brand, partNumber);
}

export function getProxiedImageUrl(rawUrl?: string): string {
  if (!rawUrl) return getSvgDataUrl("Industrial Hardware");
  if (!rawUrl.startsWith("http")) return rawUrl;
  
  let cleanUrl = rawUrl;
  if (cleanUrl.includes("imimg.com")) {
    // Force maximum 1000x1000 Ultra HD resolution for crisp clarity
    if (/-\d+x\d+\./.test(cleanUrl)) {
      cleanUrl = cleanUrl.replace(/-\d+x\d+\./, '-1000x1000.');
    } else {
      cleanUrl = cleanUrl.replace(/\.([a-z]+)$/i, '-1000x1000.$1');
    }
  }

  return cleanUrl;
}

// Deduplicate image URLs by base filename (ignoring -1000x1000, -500x500, -250x250, -125x125 size suffixes and non-product document scans)
export function getUniqueImages(images?: string[]): string[] {
  if (!images || images.length === 0) return [];
  const seenBases = new Set<string>();
  const result: string[] = [];

  images.forEach((rawUrl) => {
    if (!rawUrl) return;
    if (rawUrl.includes("PDFImage") || rawUrl.includes("c-120x120") || rawUrl.includes("logo")) return;

    // Normalize base key by removing size resolution suffixes
    const baseKey = rawUrl
      .replace(/-\d+x\d+\.[a-z]+$/i, '')
      .replace(/\.[a-z]+$/i, '')
      .toLowerCase()
      .trim();

    if (!seenBases.has(baseKey)) {
      seenBases.add(baseKey);
      result.push(rawUrl);
    }
  });

  return result;
}

// Generate inline SVG placeholder data URL when network images fail completely or for generic placeholders
export function getSvgDataUrl(name: string, brand?: string, partNumber?: string): string {
  const cleanName = (name || "Automation Hardware").replace(/[^a-zA-Z0-9\s-+]/g, "").slice(0, 32);
  const cleanBrand = (brand || "CONCEPT AUTOMATION").toUpperCase();
  const cleanPn = (partNumber || "").toUpperCase().trim();

  // Brand-specific accent colors for crisp visual identification
  let brandColor = "#ea580c"; // default orange accent
  const bLower = (brand || "").toLowerCase();
  if (bLower.includes("siemens")) brandColor = "#009999";
  else if (bLower.includes("mitsubishi")) brandColor = "#e60012";
  else if (bLower.includes("omron")) brandColor = "#005bb5";
  else if (bLower.includes("abb")) brandColor = "#ff0000";
  else if (bLower.includes("schneider")) brandColor = "#009639";
  else if (bLower.includes("delta")) brandColor = "#00875a";
  else if (bLower.includes("allen") || bLower.includes("ab")) brandColor = "#af272f";
  else if (bLower.includes("proface")) brandColor = "#1e293b";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280" fill="none">
    <rect width="400" height="280" fill="#F8FAFC"/>
    <rect x="16" y="16" width="368" height="248" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="16" y="16" width="368" height="6" fill="${brandColor}"/>
    <circle cx="200" cy="95" r="30" fill="${brandColor}" fill-opacity="0.1" stroke="${brandColor}" stroke-width="2.5"/>
    <path d="M190 95L197 102L212 87" stroke="${brandColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="200" y="150" fill="${brandColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle" letter-spacing="1.5">${cleanBrand}</text>
    <text x="200" y="176" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" text-anchor="middle">${cleanName}</text>
    ${cleanPn ? `<rect x="110" y="190" width="180" height="24" rx="5" fill="#F1F5F9" stroke="#CBD5E1"/>
    <text x="200" y="206" fill="#334155" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle">PN: ${cleanPn}</text>` : ''}
    <text x="200" y="238" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" text-anchor="middle">100% Genuine Sealed Stock</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
