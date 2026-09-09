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
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f5f5] to-white py-16 sm:py-24 text-foreground border-b border-border">
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
              { icon: Award, label: "IndiaMART Certified", val: "Trust Seal Verified", color: "text-slate-700 bg-slate-100 border-slate-200" },
              { icon: ShieldCheck, label: "Original Guarantee", val: "100% Genuine Parts", color: "text-slate-700 bg-slate-100 border-slate-200" },
              { icon: FileText, label: "GST Compliant", val: company.gst, mono: true, color: "text-slate-700 bg-slate-100 border-slate-200" },
              { icon: Globe, label: "Global Trade Code", val: "IEC: ********54A", color: "text-slate-700 bg-slate-100 border-slate-200" },
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
        {/* MAIN PROFILE CONTENTS — Compact, Balanced Typography   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Symmetrically balanced 2-column grid */}
          <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
            
            {/* Left: Biography with Compact Paragraphs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ea580c] block">
                  CORPORATE HISTORY
                </span>
                <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                  Concept Automation Technologies
                </h2>
                
                {/* Paragraphs with smaller, refined text */}
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  Established as a sole proprietorship firm in the year <strong>2022</strong> at Ahmedabad (Gujarat, India), we <strong>“Concept Automation Technologies”</strong> have positioned ourselves as a leading Wholesale Trader, Importer, Retailer, and Exporter of a wide range of industrial automation hardware.
                </p>
                
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  Our comprehensive product offerings include original <strong>Mitsubishi PLCs, Proface HMIs, Siemens CPUs, Siemens PLCs, Omron controllers, Danfoss drives, and Pepperl+Fuchs sensors</strong>. We maintain physical inventories of high-demand automation parts in our Makarba warehouse to ensure zero downtime for our clients.
                </p>

                {/* Compact Quote Block */}
                <div className="border-l-3 border-[#ea580c] pl-3.5 py-2 my-2.5 bg-slate-50 rounded-r-xl border border-slate-100/80">
                  <p className="text-xs text-slate-700 italic font-semibold leading-relaxed">
                    "We are aiming to play a vital, reliable role in the global supply chain for complete industrial automation systems, supporting panel builders, traders, and manufacturing plants with verified components."
                  </p>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mt-1">— Gaurang Chavda, Proprietor</span>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  Concept Automation Technologies also hosts a state-of-the-art facility for application engineering support. Our experienced technical team deeply understands customer requirements, shares cross-referencing knowledge, and guides engineers in obtaining the right product and system solution. We are committed to complete transparency, tax compliance, and building long-term business partnerships.
                </p>
              </div>

              {/* Bottom quick warehouse info pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span>📍 Dispatch: Makarba, Ahmedabad</span>
                <span className="text-emerald-700 font-bold">● Active Trade Desk</span>
              </div>
            </motion.div>

            {/* Right: Official Company Profile with Prominent, Larger Typography */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div className="rounded-xl bg-slate-900 p-2.5 text-white">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">Official Company Profile</h3>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">Corporate & Legal Credentials</p>
                  </div>
                </div>

                {/* Table with larger, bold, readable fonts */}
                <dl className="space-y-2.5">
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
                    <div key={row.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-slate-100 gap-1">
                      <dt className="text-slate-500 text-xs font-bold uppercase tracking-wider shrink-0">{row.label}</dt>
                      <dd className={`sm:text-right font-extrabold text-xs sm:text-sm text-slate-900 ${
                        row.mono ? "font-mono text-xs text-slate-800" : ""
                      } ${
                        row.highlight ? "text-[#ea580c] font-black" : ""
                      } ${
                        row.badge ? "inline-flex bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 text-xs font-bold" : ""
                      }`}>
                        {row.val}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <button
                onClick={() => setInquiryOpen(true)}
                className="mt-4 w-full rounded-xl bg-slate-900 hover:bg-[#ea580c] active:scale-98 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" /> Request Price Quote
              </button>
            </motion.div>

          </div>

          {/* Core Strengths Grid — Compact 4-Card Strip Below */}
          <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "100% Genuine Stock", desc: "Direct OEM import, sealed and factory verified." },
              { icon: Truck, title: "Emergency Dispatch", desc: "Pan-India dispatch within 24-48 hours." },
              { icon: Globe, title: "Global Trade Code", desc: "Equipped with valid IEC codes for global sourcing." },
              { icon: Users, title: "Technical Support", desc: "Expert engineers assist with model cross-referencing." },
            ].map((strength) => (
              <div key={strength.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-800 border border-slate-200">
                    <strength.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-display text-xs sm:text-sm font-extrabold text-slate-900">{strength.title}</h4>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed font-normal">{strength.desc}</p>
              </div>
            ))}
          </div>

          {/* Top Hardware Brands Stocked */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
              <Globe className="h-4 w-4 text-[#ea580c]" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Top Hardware Brands Stocked</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <span key={b} className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
