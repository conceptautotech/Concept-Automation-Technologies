import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { InquiryModal } from "./InquiryModal";
import { getProxiedImageUrl, getFallbackImageUrl, getSvgDataUrl } from "@/lib/imageHelper";

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
  };
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
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

  // Only show PN badge if it's a real model code with numbers/dashes
  const isRealPartNumber = () => {
    const pn = (product.partNumber || "").trim();
    if (!pn) return false;
    const lower = pn.toLowerCase();
    const generic = ["digital", "analog", "panel mount", "ac drive", "micro drive", "single phase", "3 phase", "touch screen"];
    if (generic.includes(lower)) return false;
    return /\d/.test(pn) || (pn.length >= 6 && !pn.includes(" "));
  };

  // Filter out non-product document scans (PDFImage, logo) and select 2nd real photo
  const cleanImages = (product.images || []).filter(
    (img) => img && !img.includes("PDFImage") && !img.includes("c-120x120") && !img.includes("logo")
  );
  const secondaryImage = cleanImages.length > 1 ? cleanImages.find((img) => img !== product.image) || cleanImages[1] : null;

  const getImageSrc = () => {
    if (errorCount === 0 && product.image) {
      if (isHovered && secondaryImage) {
        return getProxiedImageUrl(secondaryImage);
      }
      const imgLower = product.image.toLowerCase();
      if (imgLower.includes("sinamics-g120c") && !(product.name || "").toLowerCase().includes("sinamics") && !(product.name || "").toLowerCase().includes("g120")) {
        return getSvgDataUrl(displayTitle, product.brand, product.partNumber);
      }
      return getProxiedImageUrl(product.image);
    }
    return getFallbackImageUrl(product.brand, product.type, displayTitle, product.partNumber);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
    navigate({ to: "/products/$slug", params: { slug } });
  };

  const displayTitle = getCleanTitle();

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:shadow-lg hover:border-[#ea580c]/60 cursor-pointer"
      >
        {/* Compact Product Image Container */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-white p-3 border-b border-slate-100 flex items-center justify-center">
          {/* Shimmer Placeholder while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-50 skeleton-shimmer flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-[#ea580c] animate-spin opacity-40" />
            </div>
          )}

          {/* Brand Badge */}
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-slate-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
            {product.brand || product.category.split(" ")[0]}
          </span>

          {/* Secondary Image Indicator if available */}
          {cleanImages.length > 1 && (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 px-2 py-0.5 text-[9px] font-bold text-slate-600 shadow-2xs">
              {cleanImages.length} Photos
            </span>
          )}

          {/* Image */}
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
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            className={`h-full w-full object-contain transition-all duration-300 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
        </div>

        {/* Compact Content Box */}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5 gap-2 bg-white">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                {product.category}
              </span>
              {isRealPartNumber() && (
                <span className="font-mono text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded truncate shrink-0 max-w-[120px]">
                  {product.partNumber}
                </span>
              )}
            </div>

            <Link
              to="/products/$slug"
              params={{ slug }}
              className="text-xs sm:text-sm font-extrabold leading-tight text-slate-900 line-clamp-2 group-hover:text-primary transition-colors block mb-1"
            >
              {displayTitle}
            </Link>

            {product.description && (
              <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-2 font-normal">
                {product.description.replace(/^Description\s*:\s*/i, "")}
              </p>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 hover:bg-[#ea580c] active:scale-98 px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all shadow-xs cursor-pointer"
            >
              <MessageSquare className="h-3 w-3 text-white" /> Get Quote
            </button>

            <Link
              to="/products/$slug"
              params={{ slug }}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-primary active:scale-98 px-2.5 py-2 text-[11px] font-bold text-slate-700 transition-all shadow-2xs shrink-0"
            >
              Read More <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-primary" />
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
