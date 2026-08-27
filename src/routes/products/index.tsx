import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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

const productTypes = ["All", "PLC", "HMI", "VFD", "Sensors"] as const;

function Products() {
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

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
    const brandSet = new Set<string>();
    mergedProducts.forEach((p) => {
      const b = (p.brand || "").trim();
      if (b) {
        brandSet.add(b);
      }
    });
    return Array.from(brandSet).sort((a, b) => a.localeCompare(b));
  }, [mergedProducts]);

  const filteredProducts = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return mergedProducts.filter((product) => {
      const matchesBrand = selectedBrand === "All" || product.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchesType = selectedType === "All" || (() => {
        const pType = (product.type || "").toLowerCase().trim();
        const pCat = (product.category || "").toLowerCase().trim();
        const sType = selectedType.toLowerCase().trim();
        if (sType === "sensors" || sType === "sensor") {
          return pType.includes("sensor") || pCat.includes("sensor");
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

  const resetFilters = () => {
    setSelectedBrand("All");
    setSelectedType("All");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <Header />

      <main>
        {/* Page Header Banner */}
        <div className="border-b border-border bg-gradient-to-r from-blue-50/40 via-background to-slate-100/40 py-8 sm:py-14 text-foreground">
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
              Genuine OEM products from leading global manufacturers. Ready for dispatch.
            </p>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TOP FILTER SECTION                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="sticky top-14 sm:top-16 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-xl py-4 shadow-sm">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 space-y-4">
            {/* Search Input Bar & Result Count */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search model, part number, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs text-slate-800 font-semibold placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 text-xs text-slate-600 font-medium">
                  Genuine OEM Parts Catalog
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
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-2 shrink-0 select-none">Type:</span>
              <div className="flex items-center gap-2 shrink-0">
                {productTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                      selectedType === t
                        ? "bg-primary text-white shadow-md shadow-blue-500/10 scale-[1.02]"
                        : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100/60 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-2 shrink-0 select-none">Brand:</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedBrand("All")}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                    selectedBrand === "All"
                      ? "bg-accent text-white shadow-md shadow-orange-500/10 scale-[1.02]"
                      : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100/60 hover:border-slate-300"
                  }`}
                >
                  All Brands
                </button>
                {dynamicBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                      selectedBrand === b
                        ? "bg-accent text-white shadow-md shadow-orange-500/10 scale-[1.02]"
                        : "bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100/60 hover:border-slate-300"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN MOBILE PRODUCT GRID (User Request: 2 products in mobile view) */}
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground text-sm font-semibold">No products match your filter criteria.</p>
              <button onClick={resetFilters} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} />
    </div>
  );
}
