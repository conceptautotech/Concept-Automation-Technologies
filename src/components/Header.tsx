import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronDown, MessageSquare, Search, ArrowRight } from "lucide-react";
import { categories, company, brands } from "@/data/catalog";
import { InquiryModal } from "./InquiryModal";
import { FloatingCornerActions } from "./FloatingCornerActions";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/products", search: { q: searchQuery } as any });
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 bg-background/95 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-md" : "border-b border-border"}`}>
        {/* Top Info Bar — Light High-Contrast Professional Slate */}
        <div className="hidden bg-slate-100 text-slate-800 border-b border-slate-200 md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-extrabold tracking-wide">
            <span>GSTIN: <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 font-extrabold">{company.gst}</span></span>
            <div className="flex items-center gap-6">
              <a href={`tel:${company.phoneRaw}`} className="flex items-center gap-1.5 text-slate-800 hover:text-primary transition-colors">
                <Phone className="h-3 w-3 text-slate-700" /> {company.phone}
              </a>
              <span className="text-slate-400">|</span>
              <span>{company.address}</span>
            </div>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative rounded-2xl bg-white p-1 border-2 border-slate-200 shadow-md group-hover:border-[#ea580c] group-hover:shadow-lg transition-all">
              <img
                src="/logo.jpg"
                alt="Concept Automation Technologies"
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-contain"
                width={56}
                height={56}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight text-slate-700 leading-none">
                CONCEPT <span className="text-[#ea580c]">AUTOMATION</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-500 mt-0.5">
                TECHNOLOGIES
              </span>
            </div>
          </Link>
          {/* Desktop Navigation — Aligned Right next to actions */}
          <nav className="ml-auto hidden items-center gap-1.5 lg:flex shrink-0">
            {nav.map((item) => (
              <div key={item.to} className="group relative">
                <Link
                  to={item.to}
                  activeProps={{ className: "!bg-slate-900 !text-white" }}
                  className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition-all hover:bg-muted hover:text-primary"
                >
                  {item.label}
                  {item.label === "Products" && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>

                {/* Mega Menu */}
                {item.label === "Products" && (
                  <div className="invisible absolute -left-52 lg:-left-80 top-full pt-2 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100 z-50 animate-fade-up">
                    <div className="w-[880px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-6 shadow-2xl">
                      {/* Top Bar */}
                      <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-700">All Hardware Categories</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#ea580c]">530+ Verified Items</span>
                        </div>
                        <Link to="/products" className="text-xs font-bold text-foreground hover:text-primary flex items-center gap-1 transition-colors">
                          View Full Catalog <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {/* 4 Category Columns */}
                      <div className="grid grid-cols-4 gap-5">
                        {/* Col 1: PLC Systems & Modules */}
                        <div className="space-y-1">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-sm bg-[#ea580c]" />
                            PLC Systems & I/O
                          </div>
                          <div className="pt-1 flex flex-col space-y-0.5">
                            {categories.filter(c => c.type === 'PLC').map((c) => (
                              <Link key={c.slug} to="/products" search={{ q: c.name }}
                                className="group/item flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#ea580c] transition-colors">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover/item:bg-[#ea580c] transition-colors" />
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Col 2: HMI Panels */}
                        <div className="space-y-1">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-sm bg-[#ea580c]" />
                            HMI Touch Panels
                          </div>
                          <div className="pt-1 flex flex-col space-y-0.5">
                            {categories.filter(c => c.type === 'HMI').map((c) => (
                              <Link key={c.slug} to="/products" search={{ q: c.name }}
                                className="group/item flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#ea580c] transition-colors">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover/item:bg-[#ea580c] transition-colors" />
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Col 3: VFD Drives */}
                        <div className="space-y-1">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-sm bg-[#ea580c]" />
                            VFD & AC Drives
                          </div>
                          <div className="pt-1 flex flex-col space-y-0.5">
                            {categories.filter(c => c.type === 'VFD').map((c) => (
                              <Link key={c.slug} to="/products" search={{ q: c.name }}
                                className="group/item flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#ea580c] transition-colors">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover/item:bg-[#ea580c] transition-colors" />
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Col 4: Sensors, Servo & Safety */}
                        <div className="space-y-1">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-sm bg-[#ea580c]" />
                            Sensors & Automation
                          </div>
                          <div className="pt-1 flex flex-col space-y-0.5">
                            {categories.filter(c => c.type === 'Sensors').map((c) => (
                              <Link key={c.slug} to="/products" search={{ q: c.name }}
                                className="group/item flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#ea580c] transition-colors">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover/item:bg-[#ea580c] transition-colors" />
                                {c.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quick Filter Footer */}
                      <div className="border-t border-border pt-3 mt-4 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-2xl">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">Filter By Type:</span>
                          <Link to="/products" search={{ type: "PLC" }} className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-[#ea580c] hover:text-[#ea580c] rounded-md transition-colors shadow-xs">PLC</Link>
                          <Link to="/products" search={{ type: "HMI" }} className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-[#ea580c] hover:text-[#ea580c] rounded-md transition-colors shadow-xs">HMI</Link>
                          <Link to="/products" search={{ type: "VFD" }} className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-[#ea580c] hover:text-[#ea580c] rounded-md transition-colors shadow-xs">VFD</Link>
                          <Link to="/products" search={{ type: "SENSORS" }} className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-[#ea580c] hover:text-[#ea580c] rounded-md transition-colors shadow-xs">Sensors</Link>
                          <Link to="/products" search={{ type: "ENCODERS" }} className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-[#ea580c] hover:text-[#ea580c] rounded-md transition-colors shadow-xs">Encoders</Link>
                          <Link to="/products" search={{ type: "SERVO DRIVE SYSTEM" }} className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-[#ea580c] hover:text-[#ea580c] rounded-md transition-colors shadow-xs">Servo</Link>
                          <Link to="/products" search={{ type: "MODULES" }} className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 hover:border-[#ea580c] hover:text-[#ea580c] rounded-md transition-colors shadow-xs">Modules</Link>
                        </div>
                        <Link to="/products" className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1 shrink-0">
                          Explore All Products <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action CTA */}
          <div className="ml-auto flex items-center gap-2 lg:ml-0 shrink-0">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search catalog"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              onClick={() => setInquiryOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-[#c2410c] transition-all shadow-md"
            >
              <MessageSquare className="h-3.5 w-3.5 text-white" /> Get Quick Quote
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="border-t border-border bg-muted p-4 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-xl items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Search part number (e.g. S7-1200, GS2110, FR-CS84)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-[#c2410c] transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-700/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-background shadow-2xl animate-slide-right flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-white">
              <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Menu</span>
              <button onClick={() => setOpen(false)} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {nav.map((item) => (
                <div key={item.to}>
                  <div className="flex items-center justify-between rounded-lg hover:bg-muted transition-colors">
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex-1 px-4 py-3 text-sm font-bold uppercase text-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                    {item.label === "Products" && (
                      <button
                        type="button"
                        onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                        className="p-3 text-slate-500 hover:text-primary transition-colors"
                        aria-label="Toggle all categories"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileCategoriesOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  {item.label === "Products" && mobileCategoriesOpen && (
                    <div className="pl-3 pr-2 py-2 bg-slate-50 rounded-xl my-1 border border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
                        All Hardware Categories
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
                        {categories.map((c) => (
                          <Link
                            key={c.slug}
                            to="/products"
                            search={{ q: c.name }}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white hover:text-[#ea580c] transition-colors"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="my-4 border-t border-border" />

              <a
                href={`tel:${company.phoneRaw}`}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-foreground hover:bg-muted"
              >
                <Phone className="h-4 w-4 text-[#ea580c]" />
                Call {company.phone}
              </a>
            </nav>

            <div className="border-t border-border p-4 bg-white">
              <button
                onClick={() => { setOpen(false); setInquiryOpen(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-[#c2410c] transition-colors shadow"
              >
                <MessageSquare className="h-4 w-4 text-white" /> Request Quote
              </button>
            </div>
          </div>
        </>
      )}

      <FloatingCornerActions />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
