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
        <div className="hidden bg-slate-200/70 text-slate-900 border-b border-slate-300/80 md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-extrabold tracking-wide">
            <span>GSTIN: <span className="font-mono text-slate-950 bg-white px-2 py-0.5 rounded border border-slate-300 font-extrabold">{company.gst}</span></span>
            <div className="flex items-center gap-6">
              <a href={`tel:${company.phoneRaw}`} className="flex items-center gap-1.5 text-slate-900 hover:text-primary transition-colors">
                <Phone className="h-3 w-3 text-slate-800" /> {company.phone}
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
            <div className="relative rounded-2xl bg-white p-1 border-2 border-slate-200 shadow-md group-hover:border-accent group-hover:shadow-lg transition-all">
              <img
                src="/logo.jpg"
                alt="Concept Automation Technologies"
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-contain"
                width={56}
                height={56}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                CONCEPT <span className="text-accent">AUTOMATION</span>
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
                  activeProps={{ className: "!bg-primary !text-primary-foreground" }}
                  className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition-all hover:bg-muted hover:text-primary"
                >
                  {item.label}
                  {item.label === "Products" && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>

                {/* Mega Menu */}
                {item.label === "Products" && (
                  <div className="invisible absolute -left-28 top-full grid w-[680px] grid-cols-3 gap-5 rounded-2xl border border-border bg-card p-6 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100 z-50 animate-fade-up">
                    <div className="col-span-3 border-b border-border pb-3 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-accent">All Hardware Categories</span>
                      <Link to="/products" className="text-xs font-bold text-foreground hover:text-primary flex items-center gap-1">
                        View Full Catalog <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">PLC Systems</div>
                      {categories.filter(c => c.type === 'PLC').map((c) => (
                        <Link key={c.slug} to="/products" search={{ q: c.name }}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {c.name}
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">HMI Panels</div>
                      {categories.filter(c => c.type === 'HMI').map((c) => (
                        <Link key={c.slug} to="/products" search={{ q: c.name }}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {c.name}
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">VFD Drives & Sensors</div>
                      {categories.filter(c => c.type !== 'PLC' && c.type !== 'HMI').map((c) => (
                        <Link key={c.slug} to="/products" search={{ q: c.name }}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {c.name}
                        </Link>
                      ))}
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
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-accent transition-all shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5 text-accent" /> Get Quick Quote
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
                className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors"
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
          <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm bg-background shadow-2xl animate-slide-right flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-white">
              <span className="font-display text-sm font-bold uppercase tracking-wider text-foreground">Menu</span>
              <button onClick={() => setOpen(false)} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3.5 text-sm font-bold uppercase text-foreground hover:bg-muted hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-4 border-t border-border" />

              <a
                href={`tel:${company.phoneRaw}`}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-foreground hover:bg-muted"
              >
                <Phone className="h-4 w-4 text-accent" />
                Call {company.phone}
              </a>
            </nav>

            <div className="border-t border-border p-4 bg-white">
              <button
                onClick={() => { setOpen(false); setInquiryOpen(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-accent transition-colors shadow"
              >
                <MessageSquare className="h-4 w-4 text-accent" /> Request Quote
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
