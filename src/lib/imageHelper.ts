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

export function getFallbackImageUrl(brand?: string, type?: string): string {
  const b = (brand || "").toLowerCase();
  const t = (type || "").toLowerCase();
  const key = `${b}-${t}`;

  const val = FALLBACK_IMAGES[key];
  if (val) return val;
  if (b.includes("siemens")) return FALLBACK_IMAGES["siemens-plc"] ?? FALLBACK_IMAGES["default"]!;
  if (b.includes("mitsubishi")) return FALLBACK_IMAGES["mitsubishi-plc"] ?? FALLBACK_IMAGES["default"]!;
  if (b.includes("omron")) return FALLBACK_IMAGES["omron-plc"] ?? FALLBACK_IMAGES["default"]!;
  if (b.includes("pepperl")) return FALLBACK_IMAGES["pepperl+fuchs-sensor"] ?? FALLBACK_IMAGES["default"]!;
  if (b.includes("allen")) return FALLBACK_IMAGES["allen bradley-plc"] ?? FALLBACK_IMAGES["default"]!;

  return FALLBACK_IMAGES["default"] ?? "";
}

export function getProxiedImageUrl(rawUrl?: string): string {
  if (!rawUrl) return FALLBACK_IMAGES["default"] ?? "";
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

// Generate inline SVG placeholder data URL when network images fail completely
export function getSvgDataUrl(name: string, brand?: string): string {
  const cleanName = (name || "Automation Hardware").replace(/[^a-zA-Z0-9\s-+]/g, "").slice(0, 28);
  const cleanBrand = (brand || "CONCEPT AUTOMATION").toUpperCase();
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#F8FAFC"/>
    <rect x="20" y="20" width="360" height="360" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <circle cx="200" cy="160" r="48" fill="#ea580c" fill-opacity="0.1" stroke="#ea580c" stroke-width="3"/>
    <path d="M185 160L195 170L215 150" stroke="#ea580c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="50" y="240" width="300" height="28" rx="6" fill="#ea580c" fill-opacity="0.2"/>
    <text x="200" y="259" fill="#ea580c" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">${cleanBrand}</text>
    <text x="200" y="300" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">${cleanName}</text>
    <text x="200" y="330" fill="#64748B" font-family="sans-serif" font-size="11" text-anchor="middle">100% Original Stock</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
