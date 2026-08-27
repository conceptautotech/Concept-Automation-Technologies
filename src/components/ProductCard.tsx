import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { InquiryModal } from "./InquiryModal";
import { getProxiedImageUrl, getFallbackImageUrl, getSvgDataUrl } from "@/lib/imageHelper";

interface ProductCardProps {
  product: {
    name: string;
    image: string;
    category: string;
    slug?: string;
    partNumber?: string;
    brand?: string;
    availability?: string;
    type?: string;
    price?: string;
  };
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const navigate = useNavigate();
  const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const getImageSrc = () => {
    if (errorCount === 0) return getProxiedImageUrl(product.image);
    if (errorCount === 1) return getFallbackImageUrl(product.brand, product.type);
    return getSvgDataUrl(product.name, product.brand);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    navigate({ to: "/products/$slug", params: { slug } });
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        onClick={handleCardClick}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-accent/50 cursor-pointer"
      >
        {/* Product Image Container — Pure Uniform White (#ffffff) */}
        <div className="relative aspect-square overflow-hidden bg-white p-2.5 sm:p-5 border-b border-border/60 flex items-center justify-center">
          <span className="absolute left-2 top-2 z-10 rounded bg-primary px-2 py-0.5 text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
            {product.brand || product.category.split(" ")[0]}
          </span>
          <motion.img
            src={getImageSrc()}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setErrorCount((prev) => prev + 1)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-contain"
          />

          {/* Descriptive Hover Overlay */}
          <div className="absolute inset-0 bg-muted/95 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3.5 sm:p-5 text-foreground z-20">
            <div>
              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-accent block mb-1">
                {product.category}
              </span>
              <h4 className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2 text-foreground font-display">
                {product.name}
              </h4>
              {product.partNumber && (
                <div className="mt-2.5">
                  <span className="text-[9px] text-stone-400 font-bold block mb-0.5">PART NUMBER</span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                    {product.partNumber}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border space-y-1.5">
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-stone-600">
                <span className="font-medium">Category:</span>
                <span className="font-bold text-foreground uppercase tracking-wider">{product.type || "Hardware"}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-stone-600">
                <span className="font-medium">Price:</span>
                <span className="font-extrabold text-foreground">On Request</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Box — Uniform White (#ffffff) */}
        <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-4 gap-2.5 bg-card">
          <div>
            <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-accent block mb-0.5">
              {product.category}
            </span>

            <Link
              to="/products/$slug"
              params={{ slug }}
              className="text-[11px] sm:text-xs font-bold leading-tight text-foreground line-clamp-2 min-h-[2.1rem] group-hover:text-primary transition-colors"
            >
              {product.name}
            </Link>

            {product.partNumber && (
              <p className="mt-1 text-[9px] sm:text-[10px] font-mono text-slate-500 truncate">
                PN: <span className="text-foreground font-bold">{product.partNumber}</span>
              </p>
            )}

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-lg shadow-sm">
                On Request
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-indigo-700 active:scale-98 px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <MessageSquare className="h-3 w-3 text-amber-400" /> Request Quote
            </button>

            <Link
              to="/products/$slug"
              params={{ slug }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-card hover:bg-slate-50 px-2.5 py-2 text-[10px] sm:text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-sm"
            >
              Details
            </Link>
          </div>
        </div>
      </motion.article>

      <InquiryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        productName={product.name}
        partNumber={product.partNumber || ""}
      />
    </>
  );
}
