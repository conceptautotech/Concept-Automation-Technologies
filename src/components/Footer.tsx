import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { company } from "@/data/catalog";
import { InquiryModal } from "./InquiryModal";

const FOOTER_BRANDS = [
  "Siemens",
  "Mitsubishi",
  "Allen Bradley",
  "Omron",
  "Pepperl+Fuchs",
  "Autonics",
  "Delta",
  "Danfoss",
  "Schneider",
  "Proface",
  "Weintek",
  "Fuji",
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
  { name: "Omron Sensor Stockist in Ahmedabad", query: "Omron Sensor" },
  { name: "Autonics Encoder Dealer in Gujarat", query: "Autonics" },
  { name: "Delta VFD Drive Supplier in India", query: "Delta VFD" },
  { name: "Pepperl+Fuchs Sensors Stockist", query: "Pepperl+Fuchs" },
  { name: "Siemens PLC Supplier in Ahmedabad", query: "Siemens PLC" },
  { name: "Mitsubishi VFD Dealer in India", query: "Mitsubishi" },
];

export function Footer() {
  const [inquiryOpen, setInquiryOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-200 text-slate-800 border-t border-slate-300">
        {/* Subtle Accent Top Line */}
        <div className="h-0.5 w-full bg-slate-300" />

        {/* Main 4-Column Layout - Short Height */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-7 sm:px-6">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* COLUMN 1: BRANDS — 2-column compact layout */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-2">
                BRANDS
              </h3>
              <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-semibold text-slate-700">
                {FOOTER_BRANDS.map((b) => (
                  <li key={b}>
                    <Link
                      to="/products"
                      search={{ q: b }}
                      className="hover:text-primary transition-colors block truncate"
                    >
                      {b}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 2: CATEGORIES */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-2">
                CATEGORIES
              </h3>
              <ul className="space-y-1 text-xs font-semibold text-slate-700">
                {FOOTER_CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      to="/products"
                      search={{ q: cat.query }}
                      className="hover:text-primary transition-colors block truncate"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: QUICK LINKS */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-2">
                QUICK LINKS
              </h3>
              <ul className="space-y-1 text-xs font-semibold text-slate-700">
                {QUICK_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      to="/products"
                      search={{ q: link.query }}
                      className="hover:text-primary transition-colors block truncate"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 4: CONTACT INFORMATION */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-2">
                CONTACT US
              </h3>
              
              <div className="text-xs text-slate-700 space-y-1 font-medium leading-snug">
                <p>
                  <strong className="text-slate-900 font-extrabold">Contact:</strong>{" "}
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
                  <strong className="text-slate-900 font-extrabold">Address:</strong> D-303, Titanium Business Park, Makarba, Ahmedabad
                </p>

                <div className="pt-1.5">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-[#ea580c] active:scale-98 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-white" /> Request Price Quote
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Logo & Copyright in one compact horizontal row */}
          <div className="mt-4 pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="h-6 w-6 rounded-lg bg-white p-0.5 border border-slate-300 shadow-2xs group-hover:scale-105 transition-transform">
                <img
                  src="/logo.jpg"
                  alt="Concept Automation Technologies"
                  className="h-full w-full object-contain"
                  width={24}
                  height={24}
                />
              </div>
              <div className="font-display text-xs font-extrabold uppercase tracking-tight text-slate-900">
                CONCEPT <span className="text-[#ea580c]">AUTOMATION</span> TECHNOLOGIES
              </div>
            </Link>

            <div className="text-[11px] font-semibold text-slate-600 text-center sm:text-right">
              Copyright © {new Date().getFullYear()} <strong className="text-slate-900 font-bold">Concept Automation Technologies</strong>. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
