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

const companyDossier = [
  { label: "Legal Entity Name", val: "Concept Automation Technologies", mono: false },
  { label: "Nature of Business", val: "Wholesale Trader, Importer & Stockist", mono: false },
  { label: "Proprietor / Leadership", val: "Mr. Gaurang Mahendrabhai Chavda", mono: false },
  { label: "Year of Establishment", val: "2022 (Registered in Ahmedabad, Gujarat)", mono: false },
  { label: "GSTIN Number", val: "24ASYPC3254A1Z0", mono: true, copyable: true },
  { label: "Import Export Code (IEC)", val: "********54A (Authorized Global Trade)", mono: true },
  { label: "Warehouse & Trade Desk", val: "D-303, Titanium Business Park, Makarba, Ahmedabad - 380051", mono: false, copyable: true },
  { label: "IndiaMART Verification", val: "Trust Seal Certified Enterprise", mono: false },
  { label: "Primary Operations", val: "Pan-India Express Supply (24–48 Hrs Dispatch)", mono: false },
];

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 sm:pb-0">
      <Header />

      <main>
        {/* ══════════════════════════════════════════════════════════ */}
        {/* 1. HERO SECTION (CLEAN PURE LIGHT THEME)                   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-white py-16 sm:py-24 border-b border-slate-200/90">
          {/* Subtle Clean Industrial Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="absolute -top-24 right-10 w-96 h-96 bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-10 w-96 h-96 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />

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
              <span className="text-[#ea580c] font-bold">AHMEDABAD, GUJARAT</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">TRUST SEAL CERTIFIED</span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-4xl mx-auto"
            >
              Powering India's Industrial Floors with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] via-orange-600 to-amber-600">
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
                <MessageSquare className="h-4 w-4" />
                Request Hardware Quote
              </button>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-6 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-xs"
              >
                Explore 530+ Parts Catalog
                <ArrowRight className="h-4 w-4 text-[#ea580c]" />
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
              {keyMetrics.map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-[#ea580c]/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight group-hover:text-[#ea580c] transition-colors">
                      {metric.value}
                    </span>
                    <div className="rounded-xl bg-orange-50 p-2.5 text-[#ea580c] border border-orange-100">
                      <metric.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs sm:text-sm font-bold text-slate-900">
                    {metric.label}
                  </div>
                  <div className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-normal">
                    {metric.subtext}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 2. VERIFIED CREDENTIALS & TRUST BADGES (LIGHT THEME)       */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="bg-white border-b border-slate-200 py-8 sm:py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  badge: "IndiaMART Verified",
                  title: "Trust Seal Certified",
                  sub: "Official B2B Trader in Ahmedabad",
                  icon: Award,
                  actionText: "Verified Profile",
                },
                {
                  badge: "Official GSTIN",
                  title: company.gst,
                  sub: "100% Tax Compliant B2B Billing",
                  icon: FileCheck,
                  copyValue: company.gst,
                  actionText: "Copy GSTIN",
                },
                {
                  badge: "Global Import Code",
                  title: "IEC: ********54A",
                  sub: "Authorized International Procurement",
                  icon: Globe,
                  actionText: "DGFT Registered",
                },
                {
                  badge: "Central Warehouse Hub",
                  title: "Titanium Business Park",
                  sub: "Makarba, Ahmedabad - 380051",
                  icon: Building2,
                  copyValue: company.address,
                  actionText: "Copy Address",
                },
              ].map((item) => (
                <div
                  key={item.badge}
                  className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all group"
                >
                  <div className="rounded-xl bg-white border border-slate-200 p-2.5 shadow-2xs shrink-0 text-[#ea580c] group-hover:scale-105 transition-transform">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      {item.badge}
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5 font-mono">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.sub}
                    </div>
                    {item.copyValue && (
                      <button
                        onClick={() => handleCopy(item.copyValue!, item.badge)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#ea580c] hover:underline cursor-pointer"
                      >
                        {copiedItem === item.badge ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{item.actionText}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 3. CORPORATE STORY & ENTERPRISE PROFILE (LIGHT THEME)      */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 items-start">
              {/* Left Column: Narrative & Mission (7 cols) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-7 space-y-6"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                    <Building2 className="h-3.5 w-3.5" />
                    Corporate Profile & Mission
                  </span>
                  <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Bridging Global Automation Hardware with Indian Industry
                  </h2>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                  <p>
                    Established as a dedicated sole proprietorship firm in <strong className="text-slate-900 font-bold">2022</strong> at Ahmedabad, Gujarat, <strong className="text-slate-900 font-bold">Concept Automation Technologies</strong> was founded by <strong className="text-slate-900 font-bold">Mr. Gaurang Mahendrabhai Chavda</strong> to eliminate the frustrating supply bottlenecks faced by modern industrial plants and system integrators.
                  </p>
                  <p>
                    Industrial plants lose thousands of dollars every hour a machine line sits idle waiting for an automation replacement. We address this vulnerability by maintaining an expansive, ready inventory of <strong className="text-slate-800">Mitsubishi MELSEC PLCs, Siemens SIMATIC CPUs, Proface touch HMIs, Omron micro-controllers, Danfoss VLT inverters, ABB drives, and Pepperl+Fuchs sensors</strong> right in our Makarba central warehouse.
                  </p>
                  <p>
                    Whether supporting emergency breakdown dispatches, turnkey panel assembly projects, or routine component procurement, our experienced technical desk cross-references exact part codes, confirms firmware versions, and ensures transparent B2B execution.
                  </p>
                </div>

                {/* Founder Quote Card */}
                <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 p-6 shadow-xs relative overflow-hidden">
                  <div className="absolute top-2 right-4 text-6xl font-serif text-orange-200/50 select-none pointer-events-none">
                    “
                  </div>
                  <p className="relative z-10 text-sm sm:text-base font-medium italic text-slate-800 leading-relaxed">
                    "Our objective is simple: provide panel builders, traders, and manufacturing plants with verified industrial automation hardware at genuine wholesale prices, dispatched the very same day so production lines never wait."
                  </p>
                  <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-display font-extrabold text-xs shadow-sm">
                        GC
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">
                          Mr. Gaurang M. Chavda
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Founder & Sole Proprietor
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Trade Desk Active
                    </div>
                  </div>
                </div>

                {/* Quick Facility Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Hub Location</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">Titanium Business Park</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Business Nature</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">Wholesale & Stockist</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Operating Hours</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">Mon–Sat 9:30 AM – 7 PM</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Clean Light Enterprise Dossier Card (5 cols) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
              >
                {/* Clean Light Header */}
                <div className="bg-slate-100/90 text-slate-900 p-5 sm:p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-[#ea580c] p-2.5 text-white shadow-sm">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold tracking-wide text-slate-900">
                          Enterprise Dossier
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Commercial & Statutory Records
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Verified Active
                    </span>
                  </div>
                </div>

                {/* Table Data Rows */}
                <div className="divide-y divide-slate-100 text-xs">
                  {companyDossier.map((row) => (
                    <div
                      key={row.label}
                      className="px-5 py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <dt className="text-slate-500 font-bold uppercase tracking-wider text-[10px] shrink-0 pt-0.5">
                        {row.label}
                      </dt>
                      <dd className="text-right flex items-center gap-1.5 justify-end">
                        <span
                          className={`font-semibold text-slate-900 ${
                            row.mono ? "font-mono text-xs font-bold text-slate-800" : ""
                          }`}
                        >
                          {row.val}
                        </span>
                        {row.copyable && (
                          <button
                            onClick={() => handleCopy(row.val, row.label)}
                            title="Copy to clipboard"
                            className="p-1 text-slate-400 hover:text-[#ea580c] rounded transition-colors shrink-0 cursor-pointer"
                          >
                            {copiedItem === row.label ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </dd>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-2.5">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="w-full rounded-xl bg-primary hover:bg-[#c2410c] py-3 text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" /> Request Official Proforma Quotation
                  </button>

                  <a
                    href={`tel:${company.phoneRaw}`}
                    className="w-full rounded-xl bg-white border border-slate-300 hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#ea580c]" /> Call Trade Desk: {company.phone}
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                <Zap className="h-3.5 w-3.5" />
                Why Industrial Plants Partner With Us
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
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
                  className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 text-[#ea580c] group-hover:bg-[#ea580c] group-hover:text-white transition-colors">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#ea580c] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500 group-hover:text-[#ea580c] transition-colors">
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
                <Clock className="h-3.5 w-3.5 text-[#ea580c]" />
                Streamlined Procurement Process
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
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
                  className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 hover:bg-white hover:border-orange-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display text-2xl font-black text-[#ea580c] bg-orange-100/80 px-3 py-1 rounded-xl">
                        {step.step}
                      </span>
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
                        <step.icon className="h-4 w-4" />
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                  <Factory className="h-3.5 w-3.5" />
                  Target Sectors
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Trusted Across Diverse Manufacturing Sectors
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Our ready stock supports critical applications across high-precision manufacturing, processing factories, and industrial OEM builders throughout India.
                </p>
                <div className="pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#ea580c] hover:underline"
                  >
                    View products categorized by application <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
                {industriesServed.map((ind) => (
                  <div
                    key={ind.name}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-orange-300 hover:shadow-xs transition-all"
                  >
                    <div className="rounded-xl bg-orange-50 border border-orange-100 p-2.5 text-[#ea580c] w-fit mb-3">
                      <ind.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
                <Cpu className="h-3.5 w-3.5" />
                Comprehensive Brand Coverage
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
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
                    className="group rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:border-[#ea580c] hover:bg-orange-50 hover:text-[#ea580c] transition-all shadow-2xs flex items-center gap-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-[#ea580c] transition-colors" />
                    <span>{brandName}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 text-[#ea580c]" />
                  </Link>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
              <span>Looking for an unlisted model?</span>
              <button
                onClick={() => setInquiryOpen(true)}
                className="text-[#ea580c] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
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
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50/80 via-white to-amber-50/60 py-16 sm:py-20 border-t border-slate-200">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 border border-orange-200 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ea580c]">
              <Zap className="h-3.5 w-3.5" /> Ready Stock & Immediate Dispatch
            </span>

            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
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
                <MessageSquare className="h-4 w-4" />
                Submit Part Inquiry
              </button>

              <a
                href={`tel:${company.phoneRaw}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all shadow-xs"
              >
                <Phone className="h-4 w-4 text-[#ea580c]" />
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
                <MapPin className="h-3.5 w-3.5 text-[#ea580c]" />
                Makarba, Ahmedabad, Gujarat - 380051
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                GSTIN: 24ASYPC3254A1Z0
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
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
