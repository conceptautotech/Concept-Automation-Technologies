import { createFileRoute } from "@tanstack/react-router";
import {
  MessageSquare,
  ShieldCheck,
  FileText,
  Globe,
  Truck,
  Award,
  Users,
  BadgeCheck,
  Building2,
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
      {
        name: "description",
        content:
          "Learn about Concept Automation Technologies, established in 2022. Independent reseller and wholesale stockist of Siemens, Mitsubishi, Omron, Proface, and AB automation hardware in Ahmedabad.",
      },
    ],
  }),
  component: About,
});

const companyRows = [
  { label: "Legal Name", val: "Concept Automation Technologies" },
  { label: "Nature of Business", val: "Wholesale Trader, Importer & Exporter" },
  { label: "Legal Status", val: "Sole Proprietorship" },
  { label: "Established", val: "2022" },
  { label: "GSTIN", val: "24ASYPC3254A1Z0", mono: true },
  { label: "IEC Code", val: "********54A", mono: true },
  { label: "Employees", val: "Up to 10 People" },
  { label: "IndiaMART", val: "Trust Seal Verified" },
];

const strengths = [
  { icon: ShieldCheck, title: "100% Genuine Stock", desc: "Factory-sealed OEM parts, directly sourced." },
  { icon: Truck, title: "24–48 Hr Dispatch", desc: "Express pan-India delivery from Ahmedabad." },
  { icon: Globe, title: "Import Export Code", desc: "Valid IEC for global procurement channels." },
  { icon: Users, title: "Technical Support", desc: "Cross-referencing guidance from our engineers." },
];

function About() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-16 sm:pb-0">
      <Header />

      <main>
        {/* ── HERO BANNER ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28 border-b border-border">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ea580c08_1px,transparent_1px),linear-gradient(to_bottom,#ea580c08_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-accent shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5" /> Established 2022 · Verified Trader
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
                About Us
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
                Independent automation products reseller supplying PLCs, HMIs, VFDs, servo systems, sensors, encoders and industrial PCs from multiple leading manufacturers.
              </p>
              <button
                onClick={() => setInquiryOpen(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white hover:bg-[#c2410c] transition-all shadow-lg"
              >
                <MessageSquare className="h-4 w-4" /> Request a Quote
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── TRUST BADGES ────────────────────────────────────── */}
        <section className="py-14 sm:py-16 bg-white border-b border-border">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
              {[
                { icon: Award, label: "IndiaMART Certified", val: "Trust Seal Verified" },
                { icon: ShieldCheck, label: "Original Guarantee", val: "100% Genuine Parts" },
                { icon: FileText, label: "GST Compliant", val: company.gst, mono: true },
                { icon: Globe, label: "Global Trade Code", val: "IEC: ********54A" },
              ].map((badge, idx) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  className="flex flex-col items-center text-center rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:border-accent/30 hover:bg-white transition-all duration-300"
                >
                  <div className="rounded-xl bg-white border border-slate-200 p-3 shadow-sm">
                    <badge.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{badge.label}</div>
                  <div className={`mt-1 text-sm font-extrabold text-slate-800 ${badge.mono ? "font-mono text-xs" : ""}`}>
                    {badge.val}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CORPORATE STORY ─────────────────────────────────── */}
        <section className="py-20 sm:py-24 bg-background">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

              {/* Left: Story */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs font-extrabold uppercase tracking-widest text-accent">Corporate History</span>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  Concept Automation Technologies
                </h2>

                <div className="mt-8 space-y-5 text-base text-slate-600 leading-relaxed">
                  <p>
                    Established as a sole proprietorship firm in <strong className="text-slate-800">2022</strong> at Ahmedabad, Gujarat, we have built our reputation as a trusted wholesale trader, importer, and exporter of industrial automation hardware across India.
                  </p>
                  <p>
                    Our product range covers <strong className="text-slate-800">Mitsubishi PLCs, Proface HMIs, Siemens CPUs, Omron controllers, Danfoss drives, and Pepperl+Fuchs sensors</strong>. We maintain ready warehouse stock in Makarba to ensure zero downtime for our clients during breakdowns and urgent projects.
                  </p>
                  <p>
                    Our experienced technical team provides cross-referencing support, guiding engineers to the right part code quickly. We are committed to transparency, tax compliance, and long-term trade partnerships.
                  </p>
                </div>

                {/* Quote */}
                <div className="mt-8 border-l-4 border-accent pl-5 py-1">
                  <p className="text-base text-slate-700 italic leading-relaxed">
                    "We aim to play a vital role in the global supply chain for industrial automation, supporting panel builders, traders, and plants with verified components."
                  </p>
                  <span className="mt-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    — Gaurang Chavda, Proprietor
                  </span>
                </div>

                <div className="mt-8 flex items-center gap-6 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active Trade Desk
                  </span>
                  <span>📍 Makarba, Ahmedabad</span>
                </div>
              </motion.div>

              {/* Right: Company Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="flex items-center gap-3 px-6 py-5 bg-slate-900 text-white">
                  <div className="rounded-lg bg-white/10 p-2">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold">Official Company Profile</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Corporate & Legal Credentials</div>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {companyRows.map((row) => (
                    <div key={row.label} className="flex items-start justify-between px-6 py-3.5 gap-4">
                      <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pt-0.5">{row.label}</dt>
                      <dd className={`text-right text-sm font-semibold text-slate-800 ${row.mono ? "font-mono text-xs" : ""}`}>
                        {row.val}
                      </dd>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5 border-t border-slate-100">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="w-full rounded-xl bg-primary hover:bg-[#c2410c] py-3 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" /> Request Price Quote
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── STRENGTHS ───────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-border">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent">Why Choose Us</span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Our Core Strengths</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {strengths.map((s, idx) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-md hover:border-accent/30 transition-all"
                >
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 w-fit">
                    <s.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mt-4 text-sm font-extrabold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRANDS STOCKED ──────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-white border-t border-border">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent">Our Catalog</span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-10">
              Brands We Supply
            </h2>
            <div className="flex flex-wrap justify-center gap-2.5">
              {brands.filter(b => b !== "All").map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-accent/40 hover:text-accent transition-colors"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── RESELLER DISCLAIMER ─────────────────────────────── */}
        <section className="py-14 bg-amber-50 border-t border-amber-100">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center mb-8">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">Transparency Notice</span>
              <h2 className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-amber-900">
                Independent Reseller & Brand Disclaimer
              </h2>
              <p className="mt-3 text-sm sm:text-base text-amber-800 leading-relaxed max-w-2xl mx-auto">
                Concept Automation Technologies is an independent industrial automation products trading and resale company supplying PLCs, HMIs, VFDs, servo systems, sensors, encoders, industrial PCs and other automation components from multiple leading manufacturers. We source products through established commercial supply channels.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "We are not an authorized distributor, dealer, representative, partner or affiliate of any manufacturer displayed on this website unless specifically stated otherwise.",
                "Product names, trademarks, logos and brand names belong to their respective manufacturers and are used solely for product identification and reference.",
                "The appearance of a manufacturer's brand on this website does not imply authorization, endorsement, sponsorship, partnership or affiliation.",
                "Customers should verify exact product model, specifications, compatibility, warranty terms and manufacturer support before ordering.",
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl bg-white border border-amber-200 px-4 py-4">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                  <p className="text-sm text-amber-900 leading-relaxed">{point}</p>
                </div>
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
