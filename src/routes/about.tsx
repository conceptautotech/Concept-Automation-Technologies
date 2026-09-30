import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquare,
  ShieldCheck,
  Globe,
  Truck,
  Award,
  BadgeCheck,
  Building2,
  Phone,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Zap,
  RefreshCw,
  Cpu,
  Layers,
  FileCheck,
  Factory,
  Clock,
  ChevronRight,
  CheckCheck,
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
      {
        title:
          "About Us | Concept Automation Technologies — Industrial Automation Stockist & Distributor",
      },
      {
        name: "description",
        content:
          "Concept Automation Technologies (Est. 2022, Ahmedabad, Gujarat) is a trusted wholesale trader, stockist, and distributor of authentic Siemens, Mitsubishi, Omron, Proface, Allen Bradley, Schneider, Danfoss, and Fuji automation hardware.",
      },
    ],
  }),
  component: About,
});

const keyMetrics = [
  {
    value: "500+",
    label: "Active Authentic SKUs",
    subtext: "In-stock ready hardware in Makarba warehouse",
    icon: Layers,
  },
  {
    value: "24–48h",
    label: "Pan-India Express Dispatch",
    subtext: "Same-day courier for emergency machine downtime",
    icon: Truck,
  },
  {
    value: "20+",
    label: "Leading OEM Brands",
    subtext: "Mitsubishi, Siemens, Omron, AB, Proface & more",
    icon: Cpu,
  },
  {
    value: "100%",
    label: "Genuine OEM Hardware",
    subtext: "Factory-sealed units with GST tax invoicing",
    icon: ShieldCheck,
  },
];

const coreStrengths = [
  {
    icon: ShieldCheck,
    title: "100% Genuine OEM Hardware",
    desc: "Every product supplied by Concept Automation Technologies is brand-new, factory-sealed, and sourced strictly through established industrial trade lines with full serial verification.",
    tag: "Authentic Sourcing",
  },
  {
    icon: Zap,
    title: "Zero-Downtime Ready Stock",
    desc: "We maintain ready inventory of critical PLCs, HMIs, VFDs, and sensors in our Ahmedabad facility to rescue manufacturing plants from costly line stoppages.",
    tag: "Ready Inventory",
  },
  {
    icon: RefreshCw,
    title: "Technical Cross-Referencing",
    desc: "Facing an obsolete or backordered model? Our seasoned technical engineers assist with drop-in replacements, voltage specs, and compatible firmware alternatives.",
    tag: "Engineering Support",
  },
  {
    icon: Globe,
    title: "Global Procurement Channels",
    desc: "With a valid Import Export Code (IEC), we source hard-to-find and international automation variants quickly from trusted global trading networks.",
    tag: "Global IEC Access",
  },
  {
    icon: Truck,
    title: "Express 24–48h Dispatch",
    desc: "Strategic warehousing in Ahmedabad's transit hub allows expedited dispatches via DTDC, Blue Dart, SafeExpress, and Trackon across every industrial state in India.",
    tag: "Pan-India Logistics",
  },
  {
    icon: FileCheck,
    title: "100% GST Tax Compliant",
    desc: "Clean commercial transactions with verified GST tax invoicing, formal proforma quotes, and smooth input tax credit (ITC) reconciliation for institutional buyers.",
    tag: "B2B Compliance",
  },
];

const fulfillmentSteps = [
  {
    step: "01",
    title: "Part Code Inquiry",
    desc: "Share your exact part number, technical specification, or a photograph of the failed unit via WhatsApp or Web Quote.",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "Stock & Price Verification",
    desc: "Our trade desk confirms warehouse availability within minutes and provides a formal GST proforma invoice at wholesale rates.",
    icon: Clock,
  },
  {
    step: "03",
    title: "Multi-Point QA Inspection",
    desc: "Physical inspection of box seal, model code, serials, and anti-static protective wrapping to guarantee flawless factory condition.",
    icon: BadgeCheck,
  },
  {
    step: "04",
    title: "Tracked Express Dispatch",
    desc: "Air or express surface dispatch with real-time consignment tracking, delivered directly to your plant gate in 24 to 48 hours.",
    icon: Truck,
  },
];

const industriesServed = [
  {
    name: "Control Panel Builders & OEMs",
    desc: "High-volume supply of PLCs, power supplies, terminals, and HMIs for turnkey automation panels.",
    icon: Factory,
  },
  {
    name: "Pharma & Chemical Process Plants",
    desc: "Precision sensors, explosion-proof inverters, and high-reliability controllers for continuous batching.",
    icon: Layers,
  },
  {
    name: "Automotive & Heavy Engineering",
    desc: "High-speed servo drives, optical encoders, and heavy-duty VFDs for assembly lines and robotics.",
    icon: Cpu,
  },
  {
    name: "Packaging, Textile & Food Processing",
    desc: "Rotary encoders, proximity sensors, temperature modules, and touch HMIs for high-speed machines.",
    icon: RefreshCw,
  },
];

function About() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16 sm:pb-0">
      <Header />

      <main>
        {/* ══════════════════════════════════════════════════════════ */}
        {/* 1. HERO SECTION (CLEAN PURE LIGHT THEME)                   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f6ff] via-white to-[#f5f8fc] py-16 sm:py-24 border-b border-slate-200/90">
          {/* Subtle Clean Industrial Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d4ed808_1px,transparent_1px),linear-gradient(to_bottom,#1d4ed808_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="absolute -top-24 right-10 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-10 w-96 h-96 bg-blue-300/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ESTABLISHED 2022</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#1d4ed8] font-bold">AHMEDABAD, GUJARAT</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">TRUST SEAL CERTIFIED</span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 leading-tight max-w-4xl mx-auto"
            >
              Powering India's Industrial Floors with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d4ed8] via-blue-600 to-indigo-600">
                Verified OEM Automation
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal"
            >
              Concept Automation Technologies is an independent multi-brand wholesale stockist and distributor of PLCs, HMIs, VFD inverter drives, servo systems, and precision sensors. From our centralized Makarba distribution hub in Ahmedabad, we guarantee rapid emergency dispatches and transparent wholesale pricing.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
            >
              <button
                onClick={() => setInquiryOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white hover:bg-[#c2410c] active:scale-[0.98] transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" />
                Request Hardware Quote
              </button>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-6 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-xs"
              >
                Explore 530+ Parts Catalog
                <ArrowRight className="h-4 w-4 text-[#1d4ed8]" />
              </Link>

              <a
                href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
                  "Hello Concept Automation Technologies, I would like to inquire about automation hardware availability and wholesale pricing."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 px-5 py-3.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition-all"
              >
                <Phone className="h-4 w-4 text-emerald-600" />
                WhatsApp Trade Desk
              </a>
            </motion.div>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 4-CARD HERO METRIC STAT RIBBON (LIGHT THEME)              */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {keyMetrics.map((metric, idx) => {
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all group hover:border-[#1d4ed8]/50 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight transition-colors group-hover:text-[#1d4ed8]">
                        {metric.value}
                      </span>
                      <div className="rounded-xl p-2.5 border bg-blue-50 text-[#1d4ed8] border-blue-100">
                        <metric.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 text-xs sm:text-sm font-bold text-slate-800">
                      {metric.label}
                    </div>
                    <div className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-normal">
                      {metric.subtext}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 2. VERIFIED ACCREDITATION RIBBON (CLEAN & STREAMLINED)     */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="bg-slate-100/70 border-b border-slate-200/80 py-5 sm:py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  badge: "IndiaMART Certified",
                  title: "TrustSeal Verified",
                  desc: "Verified B2B Wholesale Trader",
                  icon: Award,
                  color: "text-[#1d4ed8]",
                },
                {
                  badge: "Tax Compliant",
                  title: "100% GST Invoicing",
                  desc: "Full Input Tax Credit (ITC)",
                  icon: FileCheck,
                  color: "text-emerald-700",
                },
                {
                  badge: "International Trade",
                  title: "DGFT IEC Registered",
                  desc: "Global OEM Procurement Access",
                  icon: Globe,
                  color: "text-[#1e3a5f]",
                },
                {
                  badge: "Central Logistics",
                  title: "Makarba Transit Hub",
                  desc: "Express 24–48h Pan-India Dispatch",
                  icon: Building2,
                  color: "text-[#1d4ed8]",
                },
              ].map((item) => (
                <div
                  key={item.badge}
                  className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className={`rounded-xl bg-slate-50 border border-slate-200/90 p-2 shrink-0 ${item.color}`}>
                    <item.icon className="h-4 sm:h-5 w-4 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 truncate">
                      {item.badge}
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate hidden sm:block">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 3. CORPORATE STORY & ENTERPRISE PROFILE (PERFECTLY ORGANIZED) */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Unified Section Header */}
            <div className="max-w-3xl mb-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#1d4ed8]">
                <Building2 className="h-3.5 w-3.5" />
                Corporate Profile & Mission
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Bridging Global Automation Hardware with Indian Industry
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Established as a dedicated sole proprietorship firm in <strong className="text-slate-800 font-bold">2022</strong> at Ahmedabad, Gujarat, <strong className="text-slate-800 font-bold">Concept Automation Technologies</strong> was founded by <strong className="text-slate-800 font-bold">Mr. Gaurang Mahendrabhai Chavda</strong> to eliminate supply bottlenecks and machine downtime for manufacturing plants, panel builders, and system integrators across India.
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-12 items-start">
              {/* Left Column: 3 Structured Strategic Pillars + Leadership (7 cols) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-7 space-y-5"
              >
                {/* 3 Strategic Capability Cards */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all">
                    <div className="rounded-xl bg-blue-100/80 border border-blue-200 p-2.5 text-[#1d4ed8] shrink-0 mt-0.5">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                        Expansive Makarba Ready Inventory
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        We maintain in-stock inventories of Mitsubishi MELSEC PLCs, Siemens SIMATIC CPUs, Proface touch HMIs, Omron micro-controllers, Danfoss VLT inverters, and Pepperl+Fuchs sensors right in our central Ahmedabad facility.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all">
                    <div className="rounded-xl bg-emerald-100/80 border border-emerald-200 p-2.5 text-emerald-700 shrink-0 mt-0.5">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                        100% Genuine OEM Hardware & Invoicing
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Every module is brand-new, factory-sealed, and supplied with official GST tax invoices for seamless input tax credit (ITC) reconciliation and complete commercial transparency.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-400 hover:shadow-xs transition-all">
                    <div className="rounded-xl bg-slate-200/80 border border-slate-300 p-2.5 text-[#1e3a5f] shrink-0 mt-0.5">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                        Rapid 24–48h Breakdown Dispatch
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Expedited daily dispatches via DTDC, SafeExpress, Trackon, and Blue Dart guarantee fastest plant delivery across Gujarat, Maharashtra, and industrial corridors nationwide.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Founder Leadership & Endorsement Card */}
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/40 p-5 sm:p-6 shadow-xs relative overflow-hidden">
                  <div className="absolute top-2 right-4 text-6xl font-serif text-blue-200/40 select-none pointer-events-none">
                    “
                  </div>
                  <p className="relative z-10 text-xs sm:text-sm font-medium italic text-slate-800 leading-relaxed">
                    "Our objective is simple: provide panel builders, traders, and manufacturing plants with verified industrial automation hardware at genuine wholesale prices, dispatched the very same day so production lines never wait."
                  </p>
                  <div className="mt-4 pt-3.5 border-t border-blue-100 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-display font-extrabold text-xs shadow-sm">
                        GC
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-slate-800">
                          Mr. Gaurang M. Chavda
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Founder & Sole Proprietor
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Direct Trade Desk Oversight
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Clean Segmented Enterprise Dossier Card (5 cols) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden"
              >
                {/* Dossier Card Header */}
                <div className="bg-[#1e3a5f] text-white p-5 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 p-2.5 text-white border border-white/20">
                      <Building2 className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold tracking-wide">
                        Enterprise Dossier
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                        Statutory, Commercial & Tax Records
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Active
                  </span>
                </div>

                {/* Dossier Structured Content */}
                <div className="divide-y divide-slate-100 text-xs">
                  {/* Block 1: Entity Name & Legal Status */}
                  <div className="p-4 hover:bg-slate-50/60 transition-colors">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Legal Entity Name
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                      Concept Automation Technologies
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sole Proprietorship Firm · Est. 2022 (Ahmedabad, Gujarat)
                    </div>
                  </div>

                  {/* Block 2: Proprietor & Business Category */}
                  <div className="p-4 grid grid-cols-2 gap-3 hover:bg-slate-50/60 transition-colors">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Proprietor / Head
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        Mr. Gaurang M. Chavda
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Nature of Trade
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        Wholesale Stockist & Importer
                      </div>
                    </div>
                  </div>

                  {/* Block 3: GSTIN Registration with Instant Copy */}
                  <div className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        GSTIN Registration Number
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                        {company.gst}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        100% Tax Compliant B2B Billing
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(company.gst, "GSTIN")}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-[#1d4ed8] hover:text-[#1d4ed8] transition-all cursor-pointer shrink-0"
                    >
                      {copiedItem === "GSTIN" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy GSTIN</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Block 4: IEC & IndiaMART Verification */}
                  <div className="p-4 grid grid-cols-2 gap-3 hover:bg-slate-50/60 transition-colors">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Import Export Code (IEC)
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                        ********54A
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        DGFT Registered Global Trade
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        IndiaMART Credentials
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        TrustSeal Certified
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        Verified B2B Enterprise
                      </div>
                    </div>
                  </div>

                  {/* Block 5: Makarba Facility & Logistics */}
                  <div className="p-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Central Warehouse & Trade Desk
                      </div>
                      <button
                        onClick={() => handleCopy(company.address, "Address")}
                        className="text-[10px] font-bold text-[#1d4ed8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedItem === "Address" ? (
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        ) : (
                          <span>Copy Address</span>
                        )}
                      </button>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1 leading-snug">
                      {company.address}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>Mon–Sat: 9:30 AM – 7:00 PM</span>
                      <span className="text-emerald-700 font-bold">Pan-India Express Dispatch</span>
                    </div>
                  </div>
                </div>

                {/* Dossier Actions */}
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-2.5">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="w-full rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] py-3 text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                  >
                    <MessageSquare className="h-4 w-4" /> Request Official Proforma Quotation
                  </button>

                  <a
                    href={`tel:${company.phoneRaw}`}
                    className="w-full rounded-xl bg-white border border-slate-300 hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#1d4ed8]" /> Call Trade Desk: {company.phone}
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 4. CORE CAPABILITIES & ADVANTAGES (LIGHT THEME)            */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#1d4ed8]">
                <Zap className="h-3.5 w-3.5" />
                Why Industrial Plants Partner With Us
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                Our Core Operational Strengths
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Engineered to provide factory maintenance leads, procurement managers, and panel builders a seamless, reliable supply experience.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coreStrengths.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-[#1d4ed8] group-hover:bg-[#1d4ed8] group-hover:text-white transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 group-hover:text-[#1d4ed8] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500 group-hover:text-[#1d4ed8] transition-colors">
                    Verified Operational Standard
                    <CheckCheck className="h-4 w-4 ml-1.5 text-emerald-600" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 5. SOURCING & FULFILLMENT WORKFLOW (LIGHT THEME)           */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                <Clock className="h-3.5 w-3.5 text-[#1d4ed8]" />
                Streamlined Procurement Process
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                From Part Inquiry to Your Factory Floor
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                How our Ahmedabad trade desk fulfills domestic and institutional orders with speed and precision.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {fulfillmentSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display text-2xl font-extrabold text-[#1d4ed8] bg-blue-100/80 px-3 py-1 rounded-xl">
                        {step.step}
                      </span>
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <step.icon className="h-4 w-4" />
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-800">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-200/80 flex items-center text-[11px] font-semibold text-slate-500">
                    Step {idx + 1} of 4 Completed Seamlessly
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 6. TARGET SECTORS & INDUSTRIES (CLEAN LIGHT THEME)         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#1d4ed8]">
                  <Factory className="h-3.5 w-3.5" />
                  Target Sectors
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  Trusted Across Diverse Manufacturing Sectors
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Our ready stock supports critical applications across high-precision manufacturing, processing factories, and industrial OEM builders throughout India.
                </p>
                <div className="pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1d4ed8] hover:underline"
                  >
                    View products categorized by application <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
                {industriesServed.map((ind) => (
                  <div
                    key={ind.name}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-xs transition-all"
                  >
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-[#1d4ed8] w-fit mb-3">
                      <ind.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">
                      {ind.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {ind.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 7. BRANDS WE STOCK & SUPPLY (LIGHT THEME)                  */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#1d4ed8]">
                <Cpu className="h-3.5 w-3.5" />
                Comprehensive Brand Coverage
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                Global Industrial Brands We Stock
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Click any brand below to explore available in-stock parts, modules, and pricing in our live catalog.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 max-w-4xl mx-auto">
              {brands
                .filter((b) => b !== "All")
                .map((brandName) => (
                  <Link
                    key={brandName}
                    to="/products"
                    search={{ brand: brandName }}
                    className="group rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:border-[#1d4ed8] hover:bg-blue-50 hover:text-[#1d4ed8] transition-all shadow-2xs flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-[#1d4ed8] transition-colors" />
                    <span>{brandName}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 text-[#1d4ed8]" />
                  </Link>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
              <span>Looking for an unlisted model?</span>
              <button
                onClick={() => setInquiryOpen(true)}
                className="text-[#1d4ed8] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Send Us Your Bill of Materials (BOM) <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 8. TRANSPARENCY & INDEPENDENT RESELLER DISCLAIMER          */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16 bg-amber-50/70 border-t border-amber-200/80">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-800">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                Transparency & Legal Notice
              </span>
              <h2 className="mt-3 font-display text-xl sm:text-3xl font-extrabold text-amber-950 tracking-tight">
                Independent Reseller & Trademark Policy
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-amber-800 leading-relaxed">
                Concept Automation Technologies is an independent industrial automation hardware trading company. We believe in 100% legal clarity and fair trade practices.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Independent Commercial Trading",
                  text: "Concept Automation Technologies is an independent reseller, wholesale trader, and stockist. We are not an authorized distributor, direct agent, or franchise representative of the manufacturers displayed on this website unless explicitly stated.",
                },
                {
                  title: "Trademark & Copyright Attribution",
                  text: "All brand names, logos, registered trademarks, series designations (e.g. MELSEC, SIMATIC, CompactLogix, VLT, GOT, PanelView) are the exclusive property of their respective OEM patent holders and are utilized strictly for product identification and technical compatibility.",
                },
                {
                  title: "No Implied Affiliation or Sponsorship",
                  text: "The catalog listing, display, or description of any OEM brand does not imply endorsement, sponsorship, direct warranty liability, or affiliation by the original equipment manufacturer.",
                },
                {
                  title: "Pre-Order Verification Recommended",
                  text: "Customers, panel builders, and plant engineers are advised to verify exact part number codes, voltage tolerances, hardware series, and manufacturer specifications prior to order placement. Our technical desk assists with cross-checks.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-white border border-amber-200 p-5 shadow-2xs flex items-start gap-3.5"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-amber-950/80 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 9. BOTTOM CONVERSION CTA BANNER (CLEAN PURE LIGHT THEME)   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f6ff] via-white to-[#f5f8fc] py-16 sm:py-20 border-t border-slate-200">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d4ed806_1px,transparent_1px),linear-gradient(to_bottom,#1d4ed806_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 border border-blue-200 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#1d4ed8]">
              <Zap className="h-3.5 w-3.5" /> Ready Stock & Immediate Dispatch
            </span>

            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Have an Urgent Breakdown or Require a Wholesale Bill of Materials?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect directly with our Makarba trade desk in Ahmedabad. Share your required part codes, target price, or plant breakdown status for priority handling.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => setInquiryOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-white hover:bg-[#c2410c] transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" />
                Submit Part Inquiry
              </button>

              <a
                href={`tel:${company.phoneRaw}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-slate-300 hover:bg-slate-50 px-6 py-4 text-sm font-bold text-slate-800 transition-all shadow-xs"
              >
                <Phone className="h-4 w-4 text-[#1d4ed8]" />
                Call Trade Desk: {company.phone}
              </a>

              <a
                href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
                  "Hello, I need an immediate quote and stock check for automation hardware."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-xs"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>

            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#1d4ed8]" />
                Makarba, Ahmedabad, Gujarat - 380051
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                GSTIN: 24ASYPC3254A1Z0
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-600" />
                Dispatch within 24–48 Hours
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
