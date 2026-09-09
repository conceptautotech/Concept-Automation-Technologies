import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, X, Check, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { allProducts } from "@/data/catalog";
import { InquiryModal } from "@/components/InquiryModal";
import { useQuery } from "@tanstack/react-query";
import { getDbProducts, mergeProducts } from "@/lib/products";
import { motion } from "framer-motion";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Products Catalog | Siemens, Mitsubishi, Omron, AB, Delta — Concept Automation" },
      { name: "description", content: "Full product range: Siemens, Mitsubishi, Allen Bradley, Omron, Delta, Schneider, Danfoss, Fuji and Proface PLC, HMI, VFD, drives and sensors." },
    ],
  }),
  component: Products,
});

const productTypes = [
  "All",
  "PLC",
  "HMI",
  "VFD",
  "SERVO DRIVE SYSTEM",
  "SENSORS",
  "ENCODERS",
] as const;

function Products() {
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Progressive scroll-loading parameters
  const INITIAL_BATCH = 12;
  const BATCH_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: dbProducts = [] } = useQuery({
    queryKey: ["dbProducts"],
    queryFn: getDbProducts,
    staleTime: 1000 * 60 * 5,
  });

  const mergedProducts = useMemo(() => {
    return mergeProducts(allProducts, dbProducts);
  }, [dbProducts]);

  useEffect(() => {
    if (searchParams.q) setSearchQuery(searchParams.q);
  }, [searchParams.q]);

  const dynamicBrands = useMemo(() => {
    // Map lower-cased brand to canonical display name, ensuring Abb & ABB merge into ABB
    const brandMap = new Map<string, string>();
    mergedProducts.forEach((p) => {
      let b = (p.brand || "").trim();
      if (!b) return;
      if (b.toLowerCase() === "abb") b = "ABB";
      const key = b.toLowerCase();
      if (!brandMap.has(key)) {
        brandMap.set(key, b);
      } else {
        // Prefer uppercase abbreviation if available
        const current = brandMap.get(key)!;
        if (b === b.toUpperCase() && current !== current.toUpperCase()) {
          brandMap.set(key, b);
        }
      }
    });
    return Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b));
  }, [mergedProducts]);

  const filteredProducts = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return mergedProducts.filter((product) => {
      const matchesBrand = selectedBrand === "All" || (product.brand || "").toLowerCase() === selectedBrand.toLowerCase();
      const matchesType = selectedType === "All" || (() => {
        const pType = (product.type || "").toLowerCase().trim();
        const pCat = (product.category || "").toLowerCase().trim();
        const pName = (product.name || "").toLowerCase().trim();
        const pDesc = (product.description || "").toLowerCase().trim();
        const sType = selectedType.toLowerCase().trim();

        if (sType === "encoders" || sType === "encoder") {
          return pType.includes("encoder") || pCat.includes("encoder") || pName.includes("encoder") || pDesc.includes("encoder");
        }
        if (sType === "sensors" || sType === "sensor") {
          const isEncoder = pType.includes("encoder") || pCat.includes("encoder") || pName.includes("encoder");
          if (isEncoder) return false;
          return pType.includes("sensor") || pCat.includes("sensor") || pName.includes("sensor") || pDesc.includes("sensor");
        }
        if (sType === "servo drive system" || sType === "servo") {
          return pType.includes("servo") || pCat.includes("servo") || pName.includes("servo");
        }
        if (sType === "vfd") {
          return pType.includes("vfd") || pCat.includes("vfd") || pName.includes("vfd") || pName.includes("drive") || pName.includes("frenic") || pName.includes("freqrol") || pName.includes("sinamics");
        }
        if (sType === "plc") {
          return pType === "plc" || pCat.includes("plc") || pName.includes("plc") || pName.includes("simatic") || pName.includes("melsec") || pName.includes("compactlogix");
        }
        if (sType === "hmi") {
          return pType === "hmi" || pCat.includes("hmi") || pName.includes("hmi") || pName.includes("touch") || pName.includes("panelview") || pName.includes("comfort panel");
        }
        return pType === sType || pType.includes(sType) || pCat.includes(sType);
      })();
      const name = product.name || "";
      const partNum = product.partNumber || "";
      const brand = product.brand || "";
      const cat = product.category || "";
      const ptype = product.type || "";
      const desc = product.description || "";
      
      const searchableText = `${name} ${partNum} ${brand} ${cat} ${ptype} ${desc}`.toLowerCase();
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = searchTerms.length === 0 || 
        searchableText.includes(cleanQuery) || 
        searchTerms.every((term) => searchableText.includes(term));
      return matchesBrand && matchesType && matchesSearch;
    });
  }, [selectedBrand, selectedType, searchQuery, mergedProducts]);

  // Reset visible batch count whenever filters or search query change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
    setIsLoadingMore(false);
  }, [selectedBrand, selectedType, searchQuery]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredProducts.length));
      setIsLoadingMore(false);
    }, 400); // 400ms smooth loading animation window
  }, [isLoadingMore, hasMore, filteredProducts.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.05,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const resetFilters = () => {
    setSelectedBrand("All");
    setSelectedType("All");
    setSearchQuery("");
  };

  // ── Scroll-direction tracker: hide filters on scroll-down, show on scroll-up ──
  const [filterBarHidden, setFilterBarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const THRESHOLD = 10; // px of scroll before toggling

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (delta > THRESHOLD && currentY > 120) {
          // scrolling DOWN past the hero — hide the filter bar
          setFilterBarHidden(true);
        } else if (delta < -THRESHOLD) {
          // scrolling UP — show the filter bar
          setFilterBarHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <Header />

      <main>
        {/* Page Header Banner */}
        <div className="border-b border-border bg-gradient-to-r from-[#f5f5f5] via-white to-[#f5f5f5] py-8 sm:py-14 text-foreground">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-7xl px-4 sm:px-6 text-center"
          >
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">Complete Catalog</span>
            <h1 className="mt-1 font-display text-xl font-extrabold text-foreground sm:text-4xl uppercase">
              Industrial Automation Products
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto font-semibold">
              Original factory products from leading global manufacturers. Ready for dispatch.
            </p>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TOP FILTER SECTION                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className={`sticky top-14 sm:top-16 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-xl py-3.5 shadow-sm transition-transform duration-300 ease-in-out ${filterBarHidden ? "-translate-y-full" : "translate-y-0"}`}>
          <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-3">
            {/* Search Input Bar & Result Count */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search model, part number, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs text-slate-800 font-semibold placeholder-slate-400 focus:border-[#ea580c] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ea580c]/20 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 px-3.5 py-1.5 text-xs text-slate-700 font-bold">
                  Original Parts Catalog
                </span>
                {(selectedBrand !== "All" || selectedType !== "All" || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Product Type Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mr-1 shrink-0 select-none">TYPE:</span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {productTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                      selectedType === t
                        ? "bg-slate-900 text-white shadow-sm scale-[1.02]"
                        : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter Pills — Wrap across 2nd line, not horizontally scrollable */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mr-1 shrink-0 select-none">BRAND:</span>
              <button
                onClick={() => setSelectedBrand("All")}
                className={`rounded-full px-3.5 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedBrand === "All"
                    ? "bg-slate-900 text-white shadow-sm scale-[1.02]"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                All Brands
              </button>
              {dynamicBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`rounded-full px-3.5 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                    selectedBrand === b
                      ? "bg-slate-900 text-white shadow-sm scale-[1.02]"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-COLUMN MOBILE PRODUCT GRID (User Request: 2 products in mobile view) */}
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground text-sm font-semibold">No products match your filter criteria.</p>
              <button onClick={resetFilters} className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#ea580c]">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Render Visible Batch of Products */}
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
              </div>

              {/* Animated Loading Skeletons on Scroll */}
              {isLoadingMore && (
                <div className="mt-3 grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                    >
                      <div className="relative aspect-square w-full rounded-xl bg-slate-100 skeleton-shimmer flex items-center justify-center overflow-hidden">
                        <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-[#ea580c] animate-spin opacity-50" />
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-2.5 w-1/3 rounded-full bg-slate-200 skeleton-shimmer" />
                        <div className="h-3.5 w-3/4 rounded-full bg-slate-200 skeleton-shimmer" />
                        <div className="h-2.5 w-1/2 rounded-full bg-slate-100 skeleton-shimmer" />
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                        <div className="h-8 flex-1 rounded-xl bg-slate-200 skeleton-shimmer" />
                        <div className="h-8 w-14 rounded-xl bg-slate-100 skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scroll Sentinel & Status Indicator */}
              <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center gap-3">
                {hasMore && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ea580c]" />
                      </span>
                      <span>Loading more products as you scroll... ({visibleProducts.length} of {filteredProducts.length})</span>
                    </div>

                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 hover:text-[#ea580c] transition-colors cursor-pointer"
                    >
                      {isLoadingMore ? "Loading batch..." : "Click to load more directly"}
                    </button>
                  </div>
                )}

                {!hasMore && filteredProducts.length > INITIAL_BATCH && (
                  <div className="text-center py-4 border-t border-slate-200 w-full max-w-md">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 shadow-2xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      All {filteredProducts.length} verified products loaded
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} />
    </div>
  );
}
