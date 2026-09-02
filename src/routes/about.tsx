import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  Globe, 
  Truck, 
  Award, 
  Users, 
  BadgeCheck, 
  MapPin, 
  Building2 
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { brands, company } from "@/data/catalog";
import { useState } from "react";
import { InquiryModal } from "@/components/InquiryModal";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Company Profile & Trust Credentials | Concept Automation Technologies" },
      { name: "description", content: "Learn about Concept Automation Technologies, established in 2022. Leading wholesale trader, importer, and exporter of genuine Siemens, Mitsubishi, Omron, Proface, and AB automation hardware in Ahmedabad." },
    ],
  }),
  component: About,
});

function About() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white pb-16 sm:pb-0">
      <Header />

      <main>
        {/* Page Header Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted to-border/40 py-16 sm:py-24 text-foreground border-b border-border">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-primary)/0.03_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)/0.03_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-muted px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent shadow-sm">
              <BadgeCheck className="h-4 w-4 text-accent" /> Established 2022 · Verified Trader
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Company Profile & Trust
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-sm sm:text-base text-stone-600 font-semibold leading-relaxed">
              We are a leading Importer, Exporter, and Wholesale Stockist of premium factory automation hardware, delivering verified original parts to manufacturing units worldwide.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TRUST STRIP SECTION                                    */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="relative z-20 -mt-10 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { icon: Award, label: "IndiaMART Certified", val: "Trust Seal Verified", color: "text-amber-600 bg-amber-50 border-amber-200" },
              { icon: ShieldCheck, label: "Original Guarantee", val: "100% Genuine Parts", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
              { icon: FileText, label: "GST Compliant", val: company.gst, mono: true, color: "text-blue-600 bg-blue-50 border-blue-200" },
              { icon: Globe, label: "Global Trade Code", val: "IEC: ********54A", color: "text-purple-600 bg-purple-50 border-purple-200" },
            ].map((badge, idx) => (
              <motion.div 
                key={badge.label} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-lg flex flex-col items-center justify-center hover:border-accent/30 transition-all hover:shadow-xl duration-300"
              >
                <div className={`rounded-xl p-3 border ${badge.color}`}>
                  <badge.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider">{badge.label}</div>
                <div className={`mt-1.5 text-xs sm:text-sm font-extrabold text-foreground ${badge.mono ? "font-mono text-[10px] sm:text-xs" : ""}`}>{badge.val}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* MAIN PROFILE CONTENTS                                  */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            
            {/* Left: Biography and Capabilities */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-8"
            >
              
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block">
                  CORPORATE HISTORY
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground uppercase">
                  Concept Automation Technologies
                </h2>
                
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
                  Established as a sole proprietorship firm in the year <strong>2022</strong> at Ahmedabad (Gujarat, India), we <strong>“Concept Automation Technologies”</strong> have positioned ourselves as a leading Wholesale Trader, Importer, Retailer, and Exporter of a wide range of industrial automation hardware.
                </p>
                
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
                  Our comprehensive product offerings include original <strong>Mitsubishi PLCs, Proface HMIs, Siemens CPUs, Siemens PLCs, Omron controllers, Danfoss drives, and Pepperl+Fuchs sensors</strong>. We maintain physical inventories of high-demand automation parts in our Makarba warehouse to ensure zero downtime for our clients.
                </p>

                <div className="border-l-4 border-accent pl-4 py-1.5 my-6 bg-white rounded-r-xl shadow-sm">
                  <p className="text-xs sm:text-sm text-stone-700 italic font-semibold">
                    "We are aiming to play a vital, reliable role in the global supply chain for complete industrial automation systems, supporting panel builders, traders, and manufacturing plants with verified components."
                  </p>
                  <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider mt-2">— Gaurang Chavda, Proprietor</span>
                </div>

                <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
                  Concept Automation Technologies also hosts a state-of-the-art facility for application engineering support. Our experienced technical team deeply understands customer requirements, shares cross-referencing knowledge, and guides engineers in obtaining the right product and system solution. We are committed to complete transparency, tax compliance, and building long-term business partnerships.
                </p>
              </div>

              {/* Core Strength Icons Grid */}
              <div className="grid gap-4 sm:grid-cols-2 pt-4">
                {[
                  { icon: ShieldCheck, title: "100% Genuine Stock Only", desc: "No refurbished or counterfeit products. Every controller is brand new, sealed, and verified." },
                  { icon: Truck, title: "Emergency Dispatch", desc: "Pan-India shipping within 24-48 hours. Real-time tracking and trusted logistics partners." },
                  { icon: Globe, title: "Global Importer & Exporter", desc: "Equipped with valid IEC codes to source hard-to-find components and ship worldwide." },
                  { icon: Users, title: "Technical Consultation", desc: "Our engineers help you cross-reference legacy/obsolete modules to modern equivalents." },
                ].map((strength) => (
                  <div key={strength.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-50 p-2 text-[#b45309]">
                        <strength.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-display text-sm font-extrabold text-stone-900">{strength.title}</h4>
                    </div>
                    <p className="mt-2.5 text-xs text-stone-500 leading-relaxed font-medium">{strength.desc}</p>
                  </div>
                ))}
              </div>

            </motion.div>

            {/* Right Sidebar: Official Company Card & Brands */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5 space-y-6 lg:sticky lg:top-24"
            >
              
              {/* Corporate Profile Card */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-lg">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-4">
                  <div className="rounded-xl bg-primary p-3 text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-stone-900">Official Company Profile</h3>
                    <p className="text-[10px] text-stone-400 font-semibold uppercase mt-0.5">Corporate & Legal Stats</p>
                  </div>
                </div>

                <dl className="space-y-4 text-xs font-semibold text-stone-700">
                  {[
                    { label: "Legal Name of Firm", val: company.name },
                    { label: "Nature of Business", val: "Wholesale Trader, Importer & Exporter" },
                    { label: "Legal Status of Firm", val: "Sole Proprietorship" },
                    { label: "Year of Establishment", val: "2022" },
                    { label: "GSTIN Status", val: company.gst, mono: true, highlight: true },
                    { label: "Import Export Code (IEC)", val: "********54A", mono: true },
                    { label: "Total Employees", val: "Up to 10 People" },
                    { label: "Warehouse Location", val: company.address },
                    { label: "IndiaMART Status", val: "Trust Seal Verified", badge: true },
                  ].map((row) => (
                    <div key={row.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-stone-50">
                      <dt className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">{row.label}</dt>
                      <dd className={`mt-1 sm:mt-0 sm:text-right font-bold text-stone-900 ${
                        row.mono ? "font-mono text-[10px]" : ""
                      } ${
                        row.highlight ? "text-accent" : ""
                      } ${
                        row.badge ? "inline-flex bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 text-[9px]" : ""
                      }`}>
                        {row.val}
                      </dd>
                    </div>
                  ))}
                </dl>

                <button
                  onClick={() => setInquiryOpen(true)}
                  className="mt-6 w-full rounded-xl bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-amber-400" /> Request Price Quote
                </button>
              </div>

              {/* Brands Handled Block */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 text-slate-900 shadow-md">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-4">
                  <Globe className="h-4 w-4 text-accent" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">Top Hardware Brands Stocked</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {brands.map((b) => (
                    <span key={b} className="rounded-lg bg-stone-100 border border-stone-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>

          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
