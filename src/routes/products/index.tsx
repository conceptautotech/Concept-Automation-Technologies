import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, X, SlidersHorizontal, ChevronDown, LayoutGrid, Grid, List } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { allProducts, brands } from "@/data/catalog";
import { InquiryModal } from "@/components/InquiryModal";
import { useQuery } from "@tanstack/react-query";
import { getDbProducts, mergeProducts, normalizeBrand } from "@/lib/products";
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
  "MODULES",
  "SAFETY RELAYS",
] as const;

function Products() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { q?: string; brand?: string; type?: string };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "compact" | "list">("grid");

  const INITIAL_BATCH = 16;
  const BATCH_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: dbProducts = [] } = useQuery({
    queryKey: ["dbProducts"],
    queryFn: getDbProducts,
    staleTime: 1000 * 60 * 5,
  });

  const mergedProducts = useMemo(() => mergeProducts(allProducts, dbProducts), [dbProducts]);

  const dynamicBrands = useMemo(() => {
    const brandMap = new Map<string, string>();
    mergedProducts.forEach((p) => {
      const b = (p.brand || "").trim();
      if (!b) return;
      const normalizedKey = normalizeBrand(b);
      const stdMatch = brands.find((sb) => normalizeBrand(sb) === normalizedKey);
      const displayName = stdMatch || b;
      if (!brandMap.has(normalizedKey)) brandMap.set(normalizedKey, displayName);
    });
    return Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b));
  }, [mergedProducts]);

  useEffect(() => {
    const qParam = (searchParams["q"] || "").trim();
    const brandParam = (searchParams["brand"] || "").trim();
    const typeParam = (searchParams["type"] || "").trim();

    let targetBrand = "All";
    let targetType = "All";
    let targetQuery = "";

    if (brandParam) {
      const matched =
        dynamicBrands.find((b) => normalizeBrand(b) === normalizeBrand(brandParam)) ||
        brands.find((b) => normalizeBrand(b) === normalizeBrand(brandParam));
      targetBrand = matched || brandParam;
    }
    if (typeParam) {
      const matchedType = productTypes.find((t) => t.toLowerCase() === typeParam.toLowerCase());
      targetType = matchedType || typeParam;
    }
    if (qParam) {
      const matchedBrand =
        dynamicBrands.find((b) => normalizeBrand(b) === normalizeBrand(qParam)) ||
        brands.find((b) => normalizeBrand(b) === normalizeBrand(qParam));
      if (matchedBrand) {
        if (!brandParam) targetBrand = matchedBrand;
      } else {
        const matchedType = productTypes.find((t) => t.toLowerCase() === qParam.toLowerCase());
        if (matchedType && matchedType !== "All") {
          if (!typeParam) targetType = matchedType;
        } else {
          targetQuery = qParam;
        }
      }
    }

    setSelectedBrand(targetBrand);
    setSelectedType(targetType);
    setSearchQuery(targetQuery);
  }, [searchParams, dynamicBrands]);

  const updateUrl = useCallback(
    (b: string, t: string, q: string) => {
      const search: Record<string, string> = {};
      if (b && b !== "All") search["brand"] = b;
      if (t && t !== "All") search["type"] = t;
      if (q && q.trim()) search["q"] = q.trim();
      navigate({ to: "/products", search: search as any, replace: true });
    },
    [navigate]
  );

  const handleBrandChange = (b: string) => {
    setSelectedBrand(b);
    updateUrl(b, selectedType, searchQuery);
  };

  const handleTypeChange = (t: string) => {
    setSelectedType(t);
    updateUrl(selectedBrand, t, searchQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrl(selectedBrand, selectedType, val);
  };

  const resetFilters = () => {
    setSelectedBrand("All");
    setSelectedType("All");
    setSearchQuery("");
    navigate({ to: "/products", search: {}, replace: true });
  };

  const hasActiveFilters =
    selectedBrand !== "All" || selectedType !== "All" || searchQuery.trim() !== "";

  const filteredProducts = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return mergedProducts.filter((product) => {
      const matchesBrand =
        selectedBrand === "All" ||
        normalizeBrand(product.brand || "") === normalizeBrand(selectedBrand);

      const matchesType =
        selectedType === "All" ||
        (() => {
          const sType = selectedType.toUpperCase().trim();
          const pType = (product.type || "").toUpperCase().trim();
          const pCat = (product.category || "").toUpperCase().trim();

          if (pType === sType) return true;

          if (sType === "PLC") return pType === "PLC" || pCat === "PLC SYSTEMS";
          if (sType === "HMI") return pType === "HMI" || pCat === "HMI & TOUCH PANELS";
          if (sType === "VFD") return pType === "VFD" || pCat === "VFD & AC DRIVES";
          if (sType === "SENSORS") return pType === "SENSORS" || pCat === "SENSORS & ENCODERS";
          if (sType === "ENCODERS") return pType === "ENCODERS" || pCat === "SENSORS & ENCODERS";
          if (sType === "MODULES") return pType === "MODULES" || pCat === "MODULES & ACCESSORIES";
          if (sType === "SAFETY RELAYS") return pType === "SAFETY RELAYS";
          if (sType === "SERVO DRIVE SYSTEM") return pType === "SERVO DRIVE SYSTEM";

          return false;
        })();

      const cleanQuery = searchQuery.toLowerCase().trim();
      const searchableTitle = `${product.name} ${product.partNumber} ${product.brand} ${product.category} ${product.type}`.toLowerCase();

      const matchesSearch =
        searchTerms.length === 0 ||
        searchableTitle.includes(cleanQuery) ||
        searchTerms.every((term) => {
          if (searchableTitle.includes(term)) return true;
          if (product.specs) {
            return Object.values(product.specs).some((val) => typeof val === "string" && val.toLowerCase().includes(term));
          }
          return false;
        });

      return matchesBrand && matchesType && matchesSearch;
    });
  }, [selectedBrand, selectedType, searchQuery, mergedProducts]);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
    setIsLoadingMore(false);
  }, [selectedBrand, selectedType, searchQuery]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredProducts.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, filteredProducts.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "300px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // ── Styled select wrapper ──────────────────────────────────
  const SelectDropdown = ({
    label,
    value,
    onChange,
    options,
    isActive,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
    isActive: boolean;
  }) => (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-0.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl border px-3 pr-8 py-2.5 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 transition-all ${
            isActive
              ? "border-[#1d4ed8] bg-white text-[#1d4ed8] ring-[#1d4ed8]/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 ring-slate-200"
          }`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
            isActive ? "text-[#1d4ed8]" : "text-slate-400"
          }`}
        />
      </div>
    </div>
  );

  const typeOptions = productTypes.map((t) => ({
    label: t === "All" ? "All Types" : t,
    value: t,
  }));

  const brandOptions = [
    { label: "All Brands", value: "All" },
    ...dynamicBrands.map((b) => ({ label: b, value: b })),
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-16 sm:pb-0">
      <Header />

      <main>
        {/* ── Page Banner ── */}
        <div className="border-b border-border bg-white py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-7xl px-4 sm:px-6"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#1d4ed8]">
              Complete Catalog
            </span>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-800 sm:text-3xl">
              Industrial Automation Products
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Multi-brand supply — Siemens, Mitsubishi, Allen Bradley, Omron, ABB, Danfoss and more.
            </p>
          </motion.div>
        </div>

        {/* ── Sticky Filter Bar ── */}
        <div className="sticky top-14 sm:top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-end gap-3">

              {/* Search */}
              <div className="flex flex-col gap-1 flex-1 min-w-[160px] max-w-xs">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-0.5">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Model, part number, brand..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`w-full rounded-xl border pl-9 pr-8 py-2.5 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      searchQuery
                        ? "border-[#1d4ed8] bg-[#1d4ed8]/5 text-slate-800 ring-[#1d4ed8]/20"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 ring-slate-200"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1d4ed8] hover:text-[#1e40af]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Type dropdown */}
              <SelectDropdown
                label="Product Type"
                value={selectedType}
                onChange={handleTypeChange}
                options={typeOptions}
                isActive={selectedType !== "All"}
              />

              {/* Brand dropdown */}
              <SelectDropdown
                label="Brand"
                value={selectedBrand}
                onChange={handleBrandChange}
                options={brandOptions}
                isActive={selectedBrand !== "All"}
              />

              {/* Divider + count + view mode + reset — right aligned */}
              <div className="flex items-end gap-2.5 ml-auto flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-0.5">
                    View
                  </span>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1 h-[42px]">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      title="Spacious Grid (Clean & Modern)"
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-white text-[#1d4ed8] shadow-xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Spacious</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("compact")}
                      title="Compact Grid (Dense)"
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        viewMode === "compact"
                          ? "bg-white text-[#1d4ed8] shadow-xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <Grid className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Compact</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      title="List View (Table)"
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-white text-[#1d4ed8] shadow-xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">List</span>
                    </button>
                  </div>
                </div>

                {/* Results count */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-0.5">
                    Results
                  </span>
                  <span className={`rounded-xl border px-3 py-2.5 text-xs font-bold whitespace-nowrap h-[42px] flex items-center ${
                    hasActiveFilters
                      ? "border-slate-300 bg-slate-100 text-slate-800"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}>
                    {filteredProducts.length} products
                    {hasActiveFilters && " · filtered"}
                  </span>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:border-[#1d4ed8] hover:text-[#1d4ed8] transition-all whitespace-nowrap h-[42px] cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Active filter chips row */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100 flex-wrap">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  Applied:
                </span>
                {selectedType !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#1d4ed8] px-2.5 py-1 text-[10px] font-extrabold text-white">
                    Type: {selectedType}
                    <button onClick={() => handleTypeChange("All")}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
                {selectedBrand !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#1e3a5f] px-2.5 py-1 text-[10px] font-extrabold text-white">
                    Brand: {selectedBrand}
                    <button onClick={() => handleBrandChange("All")}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#1e3a5f] px-2.5 py-1 text-[10px] font-extrabold text-white">
                    "{searchQuery}"
                    <button onClick={() => handleSearchChange("")}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-16 text-center shadow-sm">
              <SlidersHorizontal className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 text-sm font-semibold">No products match your filters.</p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-[#1d4ed8] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1e40af] transition-colors shadow-sm cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === "list" ? (
                <div className="flex flex-col gap-3">
                  {visibleProducts.map((p, idx) => (
                    <ProductCard key={p.id} product={p} index={idx} layout="list" />
                  ))}
                </div>
              ) : viewMode === "compact" ? (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                  {visibleProducts.map((p, idx) => (
                    <ProductCard key={p.id} product={p} index={idx} layout="compact" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map((p, idx) => (
                    <ProductCard key={p.id} product={p} index={idx} layout="grid" />
                  ))}
                </div>
              )}

              {/* Skeletons while loading next batch */}
              {isLoadingMore && (
                viewMode === "list" ? (
                  <div className="mt-4 flex flex-col gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={`sk-${i}`} className="h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 animate-pulse flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/4 rounded bg-slate-200" />
                          <div className="h-4 w-1/2 rounded bg-slate-200" />
                          <div className="h-3 w-1/3 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`mt-4 grid gap-4 ${
                    viewMode === "compact"
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  }`}>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="aspect-square w-full rounded-xl bg-slate-100 animate-pulse" />
                        <div className="mt-3 space-y-2">
                          <div className="h-2.5 w-1/3 rounded-full bg-slate-200 animate-pulse" />
                          <div className="h-3 w-3/4 rounded-full bg-slate-200 animate-pulse" />
                          <div className="h-2.5 w-1/2 rounded-full bg-slate-100 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Sentinel */}
              <div ref={sentinelRef} className="py-10 flex flex-col items-center gap-2">
                {hasMore && (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1d4ed8] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1d4ed8]" />
                      </span>
                      {visibleProducts.length} of {filteredProducts.length} loaded
                    </div>
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="text-xs font-bold text-slate-400 hover:text-[#1d4ed8] transition-colors"
                    >
                      Load more
                    </button>
                  </>
                )}
                {!hasMore && filteredProducts.length > INITIAL_BATCH && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    All {filteredProducts.length} products loaded
                  </span>
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
