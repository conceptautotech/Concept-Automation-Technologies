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
  const navigate = useNavigate();
  const slug = product.slug || (product.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Clean repetitive brand text from title
  const getCleanTitle = () => {
    let raw = (product.name || "").trim();
    const brand = (product.brand || "").trim();
    if (brand && raw.toLowerCase().endsWith(brand.toLowerCase())) {
      raw = raw.slice(0, raw.length - brand.length).trim();
    }
    return raw;
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
    if (errorCount === 0) {
      if (isHovered && secondaryImage) {
        return getProxiedImageUrl(secondaryImage);
      }
      return getProxiedImageUrl(product.image);
    }
    if (errorCount === 1) return getFallbackImageUrl(product.brand, product.type);
    return getSvgDataUrl(product.name, product.brand);
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
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:border-primary/40 cursor-pointer"
      >
        {/* Product Image Container — Pure White */}
        <div className="relative aspect-square overflow-hidden bg-white p-5 border-b border-slate-100 flex items-center justify-center">
          {/* Brand Badge */}
          <span className="absolute left-3.5 top-3.5 z-10 rounded-lg bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
            {product.brand || product.category.split(" ")[0]}
          </span>

          {/* Secondary Image Indicator if available */}
          {cleanImages.length > 1 && (
            <span className="absolute right-3.5 top-3.5 z-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/80 px-2 py-0.5 text-[9px] font-bold text-slate-600 shadow-2xs">
              {cleanImages.length} Photos
            </span>
          )}

          {/* Image */}
          <motion.img
            src={getImageSrc()}
            alt={displayTitle}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setErrorCount((prev) => prev + 1)}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-contain transition-transform duration-300"
          />
        </div>

        {/* Content Box */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 gap-3.5 bg-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/90 block mb-1.5">
              {product.category}
            </span>

            <Link
              to="/products/$slug"
              params={{ slug }}
              className="text-xs sm:text-sm font-extrabold leading-snug text-slate-900 line-clamp-2 min-h-[2.4rem] group-hover:text-primary transition-colors block"
            >
              {displayTitle}
            </Link>

            {product.description && (
              <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal line-clamp-2">
                {product.description}
              </p>
            )}

            {isRealPartNumber() && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PN:</span>
                <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                  {product.partNumber}
                </span>
              </div>
            )}
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5 mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-blue-700 active:scale-98 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 text-amber-400" /> Get Quote
            </button>

            <Link
              to="/products/$slug"
              params={{ slug }}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 active:scale-98 px-3 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-2xs"
            >
              Details <ArrowRight className="h-3 w-3 text-slate-400" />
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
