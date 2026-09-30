import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { InquiryModal } from "./InquiryModal";
import { getProxiedImageUrl, getFallbackImageUrl } from "@/lib/imageHelper";

interface ProductCardProps {
  product: {
    name: string;
    image: string;
    images?: string[];
    category: string;
    slug?: string;
    partNumber?: string;
    brand?: string;
    availability?: string;
    type?: string;
    price?: string;
    description?: string;
    specs?: Record<string, string>;
  };
  index?: number;
  layout?: "grid" | "compact" | "list";
}

export function ProductCard({ product, index = 0, layout = "grid" }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const slug = product.slug || (product.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Clean repetitive brand text from title
  const getCleanTitle = () => {
    let raw = (product.name || "").trim();
    const brand = (product.brand || "").trim();
    if (brand && raw.toLowerCase().startsWith(`${brand.toLowerCase()} ${brand.toLowerCase()}`)) {
      raw = raw.slice(brand.length).trim();
    }
    if (brand && raw.toLowerCase().endsWith(brand.toLowerCase())) {
      raw = raw.slice(0, raw.length - brand.length).trim();
    }
    return raw
      .replace(/&trade;/gi, "")
      .replace(/&reg;/gi, "")
      .replace(/&ndash;/gi, "-")
      .replace(/&quot;/gi, '"')
      .replace(/^(Description|Product Details|General Specifications)\s*:\s*/i, "")
      .replace(/[\s.,\/-]+$/, "")
      .trim();
  };

  // Extract clean normalized brand name to avoid badge overlap or model leaks
  const getDisplayBrand = () => {
    const b = (product.brand || "").trim();
    if (!b) return product.category ? product.category.split(" ")[0] : "OEM";
    const lower = b.toLowerCase();
    if (lower.includes("allen")) return "Allen-Bradley";
    if (lower.includes("mitsubishi")) return "Mitsubishi";
    if (lower.includes("siemens")) return "Siemens";
    if (lower.includes("omron")) return "Omron";
    if (lower.includes("schneider")) return "Schneider";
    if (lower.includes("delta")) return "Delta";
    if (lower.includes("danfoss")) return "Danfoss";
    if (lower.includes("abb")) return "ABB";
    if (lower.includes("yaskawa")) return "Yaskawa";
    if (lower.includes("fuji")) return "Fuji";
    if (lower.includes("inovance")) return "Inovance";
    if (lower.includes("proface")) return "Proface";
    if (lower.includes("weintek")) return "Weintek";
    if (lower.includes("autonics")) return "Autonics";
    if (lower.includes("sick")) return "SICK";
    if (lower.includes("ifm")) return "IFM";
    if (lower.includes("pepperl")) return "P+F";
    if (lower.includes("phoenix")) return "Phoenix";
    if (lower.includes("pilz")) return "Pilz";
    return b.split(" ")[0];
  };

  // Only show PN badge if it's a real model code with numbers/dashes
  const isRealPartNumber = () => {
    const pn = (product.partNumber || "").trim();
    if (!pn) return false;
    const lower = pn.toLowerCase();
    const generic = ["digital", "analog", "panel mount", "ac drive", "micro drive", "single phase", "3 phase", "touch screen"];
    if (generic.includes(lower)) return false;
    return /\d/.test(pn) || (pn.length >= 6 && !pn.includes(" "));
  };

  // Filter out non-product document scans and select secondary photo
  const cleanImages = (product.images || []).filter(
    (img) => img && !img.includes("PDFImage") && !img.includes("c-120x120") && !img.includes("logo")
  );
  const secondaryImage = cleanImages.length > 1 ? cleanImages.find((img) => img !== product.image) || cleanImages[1] : null;

  const displayTitle = getCleanTitle();
  const displayBrand = getDisplayBrand();

  const getImageSrc = () => {
    if (errorCount === 0 && product.image) {
      if (isHovered && secondaryImage) {
        return getProxiedImageUrl(secondaryImage);
      }
      return getProxiedImageUrl(product.image);
    }
    return getFallbackImageUrl(product.brand, product.type, displayTitle, product.partNumber);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
    navigate({ to: "/products/$slug", params: { slug } });
  };

  // Extract clean structured specs highlight instead of messy scraped text
  const keySpecs = useMemo(() => {
    if (!product.specs) return [];
    const res: string[] = [];
    const series = product.specs["Manufacturer Series"] || product.specs["Series"];
    if (series && series.length < 24) res.push(`Series: ${series}`);
    const output = product.specs["Output Type"];
    if (output && output.length < 20) res.push(output);
    const mount = product.specs["Mounting Type"];
    if (mount && mount.length < 20 && res.length < 2) res.push(mount);
    return res.slice(0, 2);
  }, [product.specs]);

  // ── LIST VIEW LAYOUT ─────────────────────────────────────────
  if (layout === "list") {
    return (
      <>
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
          onClick={handleCardClick}
          className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer gap-4"
        >
          {/* Thumbnail */}
          <div className="relative h-28 w-28 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-center self-center sm:self-auto">
            <img
              src={getImageSrc()}
              alt={displayTitle}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
            {cleanImages.length > 1 && (
              <span className="absolute bottom-1 right-1 rounded-full bg-white/95 border border-slate-200 px-1.5 text-[8px] font-bold text-slate-500 shadow-2xs">
                {cleanImages.length} photos
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="rounded-md bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                {displayBrand}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {product.category}
              </span>
              {isRealPartNumber() && (
                <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                  {product.partNumber}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 ml-auto sm:ml-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready Stock
              </span>
            </div>

            <Link
              to="/products/$slug"
              params={{ slug }}
              className="text-sm sm:text-base font-bold text-slate-800 hover:text-[#1d4ed8] transition-colors block line-clamp-1 mb-1"
            >
              {displayTitle}
            </Link>

            {keySpecs.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                {keySpecs.map((s, i) => (
                  <span key={i} className="inline-flex items-center rounded bg-slate-50 border border-slate-200/70 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {s}
                  </span>
                ))}
                <span className="text-[11px] text-slate-400">· 100% Genuine OEM Hardware</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Genuine OEM Hardware · Makarba Warehouse Dispatch · GST Invoice
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <button
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl btn-glass-blue active:scale-98 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap group/btn"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#ea580c] group-hover/btn:text-white transition-colors" /> Get Quote
            </button>
            <Link
              to="/products/$slug"
              params={{ slug }}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#1d4ed8] px-3.5 py-2 text-xs font-bold text-slate-700 transition-all shrink-0"
            >
              Details <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-[#1d4ed8] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.article>

        <InquiryModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          productName={displayTitle}
          partNumber={product.partNumber || ""}
        />
      </>
    );
  }

  // ── GRID & COMPACT CARD LAYOUT ───────────────────────────────
  const isCompact = layout === "compact";

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25) }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:border-slate-300 cursor-pointer"
      >
        {/* Product Image Container */}
        <div className={`relative ${isCompact ? "h-36 sm:h-42 p-3" : "h-48 sm:h-52 p-4 sm:p-5"} w-full overflow-hidden bg-slate-50/40 border-b border-slate-100 flex items-center justify-center`}>
          {/* Shimmer Placeholder while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-50 skeleton-shimmer flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-[#1d4ed8] animate-spin opacity-40" />
            </div>
          )}

          {/* Brand Badge */}
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-800 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
            {displayBrand}
          </span>

          {/* Stock Status Badge */}
          <span className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-50/95 backdrop-blur-xs border border-emerald-200/80 px-2 py-0.5 text-[9px] font-bold text-emerald-700 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In Stock
          </span>

          {/* Product Image with smooth hover zoom */}
          <motion.img
            src={getImageSrc()}
            alt={displayTitle}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setErrorCount((prev) => prev + 1);
              setImageLoaded(true);
            }}
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.3 }}
            className={`h-full w-full object-contain transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0 scale-95"
            }`}
          />
        </div>

        {/* Content Box */}
        <div className={`flex flex-1 flex-col justify-between ${isCompact ? "p-3 gap-2" : "p-4 gap-2.5"} bg-white`}>
          <div>
            {/* Category & Part Number Row */}
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1d4ed8]">
                {product.category}
              </span>
              {isRealPartNumber() && (
                <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                  {product.partNumber}
                </span>
              )}
            </div>

            {/* Clean Title */}
            <Link
              to="/products/$slug"
              params={{ slug }}
              className={`${isCompact ? "text-xs sm:text-[13px] min-h-[36px]" : "text-sm sm:text-base min-h-[44px]"} font-bold leading-snug text-slate-800 line-clamp-2 group-hover:text-[#1d4ed8] transition-colors block mb-2`}
            >
              {displayTitle}
            </Link>

            {/* Clean Specs Badge */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[22px]">
              {keySpecs.length > 0 ? (
                keySpecs.map((s, i) => (
                  <span key={i} className="inline-flex items-center rounded-md bg-slate-100/80 border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 truncate max-w-[140px]">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-medium text-slate-500">
                  Genuine OEM Hardware · Verified Stock
                </span>
              )}
            </div>
          </div>

          {/* Action Button: Clean, Uncluttered, Balanced Harmony */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 mt-auto">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl btn-glass-blue active:scale-98 ${isCompact ? "px-2 py-2 text-[11px]" : "px-3 py-2 text-xs"} font-bold uppercase tracking-wider cursor-pointer group/btn`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#ea580c] group-hover/btn:text-white transition-colors" />
              <span>Get Quote</span>
            </button>

            <Link
              to="/products/$slug"
              params={{ slug }}
              title="View Details"
              className={`inline-flex items-center justify-center rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 group-hover:border-[#1d4ed8]/40 hover:text-[#1d4ed8] text-slate-400 transition-all ${isCompact ? "h-8 w-8" : "h-9 w-9"} shrink-0`}
            >
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.article>

      <InquiryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        productName={displayTitle}
        partNumber={product.partNumber || ""}
      />
    </>
  );
}

