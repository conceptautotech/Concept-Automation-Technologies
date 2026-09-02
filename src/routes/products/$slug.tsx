import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck, Globe, MessageSquare, Check, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { allProducts, categories, company, type ProductSpec } from "@/data/catalog";
import { submitInquiry } from "@/lib/supabase";
import { toast } from "sonner";
import { getProxiedImageUrl, getFallbackImageUrl, getSvgDataUrl, getUniqueImages } from "@/lib/imageHelper";
import { getDbProducts, mergeProducts, type ExtendedProduct } from "@/lib/products";
import { motion } from "framer-motion";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    let dbProducts: ExtendedProduct[] = [];
    try {
      dbProducts = await queryClient.ensureQueryData({
        queryKey: ["dbProducts"],
        queryFn: getDbProducts,
      });
    } catch {
      dbProducts = [];
    }

    const merged = mergeProducts(allProducts, dbProducts);
    const slugParam = (params.slug || "").toLowerCase().trim();

    let product = merged.find((p) => {
      if (!p) return false;
      const pSlug = (p.slug || "").toLowerCase().trim();
      const pName = (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const pPart = (p.partNumber || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const pId = (p.id || "").toLowerCase().trim();
      return pSlug === slugParam || pName === slugParam || pPart === slugParam || pId === slugParam;
    });

    if (!product) {
      product = merged.find((p) => {
        if (!p) return false;
        const pName = (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        const pPart = (p.partNumber || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        const cleanSlug = slugParam.replace(/[^a-z0-9]+/g, "");
        return (pPart && cleanSlug.includes(pPart)) || (pName && cleanSlug.includes(pName));
      });
    }

    const category = categories.find((c) => c.slug === slugParam);

    return { product: product || merged[0], category, mergedProducts: merged };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const category = loaderData?.category;
    const name = product?.name || category?.name || "Product Detail";
    const desc = product?.description || "Industrial Automation Parts Supplier";
    return { meta: [{ title: `${name} | Concept Automation Technologies` }, { name: "description", content: desc }] };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const loaderData = Route.useLoaderData() as {
    product: ExtendedProduct | undefined;
    category: any;
    mergedProducts: ExtendedProduct[];
  };
  const { product, category, mergedProducts } = loaderData;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const title = product ? product.name : (category?.name || "Product Detail");
  const brand = product ? product.brand : (category?.brand || "Original Hardware");
  const partNumber = product ? (product.partNumber || "") : "";
  const rawImage = product?.image || "";
  
  const imagesList = getUniqueImages(product?.images?.length ? product.images : [rawImage]);
  const finalImagesList = imagesList.length > 0 ? imagesList : [rawImage];
  const activeImage = finalImagesList[activeImageIndex] || rawImage;

  const getImageSrc = () => {
    if (errorCount === 0) return getProxiedImageUrl(activeImage);
    if (errorCount === 1) return getFallbackImageUrl(brand, product?.type || category?.type);
    return getSvgDataUrl(title, brand);
  };

  const handleThumbnailClick = (idx: number) => {
    setActiveImageIndex(idx);
    setErrorCount(0);
  };

  const description = (product?.description && product.description.trim().length > 30) 
    ? product.description 
    : `Original factory sealed ${brand} ${title} ${partNumber ? `(PN: ${partNumber})` : ""}. High-performance ${product?.type || "automation"} hardware engineered for maximum reliability, panel compatibility, and zero production downtime. Ready stock available for immediate express dispatch from our Makarba, Ahmedabad warehouse with full technical support.`;

  const specs: ProductSpec[] = (product?.specifications && product.specifications.length > 0) 
    ? product.specifications 
    : [
        { label: "Product Name", value: title },
        { label: "Part Code / PN", value: partNumber || title },
        { label: "Brand", value: brand },
        { label: "Category", value: product?.category || category?.name || "Industrial Automation" },
        { label: "Hardware Type", value: product?.type || category?.type || "Automation Component" },
        { label: "Condition", value: "100% Genuine Sealed Hardware" },
        { label: "Warehouse Stock", value: "Ready Stock in Makarba, Ahmedabad" },
        { label: "Dispatch SLA", value: "24 - 48 Hours Pan-India Express" },
        { label: "Warranty", value: "1 Year Standard Warranty" },
      ];

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "", quantity: 1, location: "", message: "",
  });

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error("Please fill in Name, Email, and Phone.");
      return;
    }
    setLoading(true);
    const res = await submitInquiry({ ...formData, product_name: title, part_number: partNumber });
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
      toast.success("Inquiry Submitted!", { description: "We'll send you an official quotation shortly." });
    }
  };

  const related = mergedProducts.filter((p) => (p?.brand || "").toLowerCase() === (brand || "").toLowerCase() && p.name !== title).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between">
            <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
            </Link>
            <span className="text-xs text-muted-foreground">
              Brand: <span className="text-foreground font-semibold">{brand}</span>
            </span>
          </div>
        </div>

        {/* Product Detail */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Image Column (Wrapper stretches to full height of grid row) */}
            <div className="relative">
              {/* Sticky Container */}
              <div className="lg:sticky lg:top-36 space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-white p-4 sm:p-6 flex items-center justify-center shadow-sm min-h-[250px] sm:min-h-[380px]">
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {brand}
                    </span>
                    <img
                      src={getImageSrc()}
                      alt={title}
                      referrerPolicy="no-referrer"
                      onError={() => setErrorCount((prev) => prev + 1)}
                      className="max-h-[320px] w-auto object-contain transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  {finalImagesList.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-stone-300">
                      {finalImagesList.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleThumbnailClick(idx)}
                          className={`relative aspect-square w-16 h-16 overflow-hidden rounded-xl border-2 bg-white p-1 flex items-center justify-center shrink-0 transition-all ${
                            activeImageIndex === idx 
                              ? "border-accent shadow-sm ring-1 ring-accent/25" 
                              : "border-border opacity-70 hover:opacity-100 hover:border-muted-foreground"
                          }`}
                        >
                          <img
                            src={getProxiedImageUrl(imgUrl)}
                            alt={`Product thumbnail ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trust badges */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { icon: ShieldCheck, label: "12 Month Warranty" },
                      { icon: Globe, label: "Germany / Japan" },
                      { icon: Truck, label: "Express Dispatch" },
                    ].map((b) => (
                      <div key={b.label} className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
                        <b.icon className="mx-auto h-4 w-4 text-accent mb-1" />
                        <div className="text-[10px] font-semibold text-foreground">{b.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right: Info + Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-5"
            >
              <div>
                <span className="eyebrow">{brand} Industrial Automation</span>
                <h1 className="mt-2 font-display text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1>
                {partNumber && (
                  <div className="mt-1 text-sm font-mono text-muted-foreground">
                    Part: <strong className="text-accent">{partNumber}</strong>
                  </div>
                )}
                
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{description}</p>
                
                <button
                  onClick={() => {
                    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                    setTimeout(() => {
                      const nameInput = document.querySelector('input[placeholder="Your Name *"]') as HTMLInputElement;
                      nameInput?.focus();
                    }, 400);
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-98"
                >
                  <MessageSquare className="h-4 w-4 text-amber-400" /> Get A Quote
                </button>
              </div>

              {/* Specs */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="bg-muted px-5 py-3 border-b border-border text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Technical Specifications
                </div>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {specs.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-muted/50" : "bg-card"}>
                        <td className="px-5 py-2.5 text-muted-foreground border-b border-border/40 w-1/3 font-medium">{item.label}</td>
                        <td className="px-5 py-2.5 font-semibold text-foreground border-b border-border/40">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quote Form */}
              <div id="quote-form" className="rounded-2xl border border-accent/20 bg-accent/5 p-5 sm:p-6 shadow-sm">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-accent" /> Get Official Price Quote
                </h3>
                <p className="mt-1 text-xs text-muted-foreground mb-4">Direct response from our sales desk.</p>

                {submitted ? (
                  <div className="rounded-xl bg-emerald-50 p-4 text-center border border-emerald-200 text-emerald-800 text-sm font-semibold">
                    <CheckCircle2 className="mx-auto h-5 w-5 mb-1 text-emerald-600" />
                    Quote request submitted for {title}! We'll contact you shortly.
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input type="text" required placeholder="Your Name *" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <input type="tel" required placeholder="Phone / WhatsApp *" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input type="email" required placeholder="Work Email *" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <input type="number" min={1} placeholder="Quantity" value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder-stone-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-accent transition-colors disabled:opacity-50 shadow">
                      {loading ? "Submitting..." : "Submit Price Quote Request"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-14 border-t border-border pt-10">
              <span className="eyebrow">More {brand} Products</span>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl mb-6">Related {brand} Products</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => (<ProductCard key={p.id} product={p} />))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
