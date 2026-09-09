import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, ArrowRight } from "lucide-react";
import { company } from "@/data/catalog";
import { InquiryModal } from "./InquiryModal";

const FOOTER_BRANDS = [
  "Siemens",
  "Mitsubishi",
  "Allen Bradley",
  "Omron",
  "ABB",
  "Proface",
];

const FOOTER_CATEGORIES = [
  { name: "PLC Controllers", query: "PLC" },
  { name: "HMI Touch Panels", query: "HMI" },
  { name: "VFD AC Drives", query: "VFD" },
  { name: "Industrial Sensors", query: "Sensor" },
  { name: "Rotary Encoders", query: "Encoder" },
  { name: "SMPS Power Modules", query: "Power Supply" },
];

const QUICK_LINKS = [
  { name: "Omron Sensor Stockist", query: "Omron Sensor" },
  { name: "Autonics Encoder Dealer", query: "Autonics" },
  { name: "Delta VFD Drive Supplier", query: "Delta VFD" },
  { name: "Pepperl+Fuchs Sensors Stockist", query: "Pepperl+Fuchs" },
  { name: "Siemens PLC Supplier", query: "Siemens PLC" },
  { name: "Mitsubishi VFD Dealer", query: "Mitsubishi" },
];

export function Footer() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-200 text-slate-800 border-t border-slate-300">
        {/* Subtle Accent Top Line */}
        <div className="h-0.5 w-full bg-slate-300" />

        {/* Main 4-Column Layout - Perfectly Balanced & Spaced */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 xl:gap-12">
            
            {/* COLUMN 1: BRANDS */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-3.5">
                BRANDS
              </h3>
              <ul className="space-y-2 text-xs sm:text-[13px] font-medium text-slate-700">
                {FOOTER_BRANDS.map((b) => (
                  <li key={b}>
                    <Link
                      to="/products"
                      search={{ q: b }}
                      className="hover:text-primary transition-colors block"
                    >
                      {b}
                    </Link>
                  </li>
                ))}
                <li className="pt-1">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-900 hover:text-primary uppercase tracking-wider transition-colors"
                  >
                    View All Brands <ArrowRight className="h-3 w-3 text-slate-500" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 2: CATEGORIES */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-3.5">
                CATEGORIES
              </h3>
              <ul className="space-y-2 text-xs sm:text-[13px] font-medium text-slate-700">
                {FOOTER_CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      to="/products"
                      search={{ q: cat.query }}
                      className="hover:text-primary transition-colors block"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: QUICK LINKS */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-3.5">
                QUICK LINKS
              </h3>
              <ul className="space-y-2 text-xs sm:text-[13px] font-medium text-slate-700">
                {QUICK_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      to="/products"
                      search={{ q: link.query }}
                      className="hover:text-primary transition-colors block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 4: CONTACT INFORMATION */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-3.5">
                CONTACT US
              </h3>
              
              <div className="text-xs sm:text-[13px] text-slate-700 space-y-2 font-medium leading-relaxed">
                <p>
                  <strong className="text-slate-900 font-extrabold">Phone:</strong>{" "}
                  <a href={`tel:${company.phoneRaw}`} className="hover:text-primary font-mono font-bold text-slate-900">
                    {company.phone}
                  </a>
                </p>
                <p className="truncate">
                  <strong className="text-slate-900 font-extrabold">Email:</strong>{" "}
                  <a href={`mailto:${company.email}`} className="hover:text-primary text-slate-900 font-semibold">
                    {company.email}
                  </a>
                </p>
                <p>
                  <strong className="text-slate-900 font-extrabold">Hours:</strong> Mon – Sat (10:00am – 7:00pm)
                </p>
                <p className="line-clamp-2 text-slate-600">
                  <strong className="text-slate-900 font-extrabold">Address:</strong> Titanium Business Park, Makarba, Ahmedabad
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-[#ea580c] active:scale-98 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-white" /> Request Price Quote
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Clean, Spacious Horizontal Row */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-7 w-7 rounded-lg bg-white p-0.5 border border-slate-300 shadow-2xs group-hover:scale-105 transition-transform">
                <img
                  src="/logo.jpg"
                  alt="Concept Automation Technologies"
                  className="h-full w-full object-contain"
                  width={28}
                  height={28}
                />
              </div>
              <div className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-tight text-slate-900">
                CONCEPT <span className="text-[#ea580c]">AUTOMATION</span> TECHNOLOGIES
              </div>
            </Link>

            <div className="text-xs font-semibold text-slate-600 text-center sm:text-right">
              Copyright © {new Date().getFullYear()} <strong className="text-slate-900 font-bold">Concept Automation Technologies</strong>. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
