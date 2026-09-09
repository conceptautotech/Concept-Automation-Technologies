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
      <footer className="bg-slate-100 text-slate-700 border-t border-slate-200">
        {/* Accent Top Line */}
        <div className="h-0.5 w-full bg-slate-300" />

        {/* Main 4-Column Layout */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 sm:px-6">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* COLUMN 1: BRANDS */}
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-800 mb-5">
                BRANDS
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-600">
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
              </ul>
            </div>

            {/* COLUMN 2: CATEGORIES */}
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-800 mb-5">
                CATEGORIES
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-600">
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
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-800 mb-5">
                QUICK LINKS
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-600">
                {QUICK_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      to="/products"
                      search={{ q: link.query }}
                      className="hover:text-primary transition-colors block leading-relaxed"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 4: CONTACT INFORMATION */}
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-800 mb-5">
                CONTACT US
              </h3>
              
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 font-medium leading-relaxed">
                <p>
                  <strong className="text-slate-800 font-extrabold">Contact:</strong>{" "}
                  <a href={`tel:${company.phoneRaw}`} className="hover:text-primary font-mono font-bold text-slate-800">
                    {company.phone}
                  </a>
                </p>
                <p className="break-all">
                  <strong className="text-slate-800 font-extrabold">Email:</strong>{" "}
                  <a href={`mailto:${company.email}`} className="hover:text-primary text-slate-800 font-semibold">
                    {company.email}
                  </a>
                </p>
                <p>
                  <strong className="text-slate-800 font-extrabold">Hours:</strong> Monday – Saturday (10:00am – 07:00pm IST)
                </p>
                <div>
                  <strong className="text-slate-800 font-extrabold">Address:</strong>{" "}
                  <span className="text-slate-600 leading-relaxed block mt-1">
                    D-303, 3rd Floor, Titanium Business Park, Makarba Road, Makarba, Ahmedabad - 380051, Gujarat, India
                  </span>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-[#ea580c] active:scale-98 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-white" /> Request Price Quote
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Centered Brand & Logo Section */}
          <div className="mt-10 pt-6 border-t border-slate-200 text-center flex flex-col items-center justify-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform">
                <img
                  src="/logo.jpg"
                  alt="Concept Automation Technologies"
                  className="h-full w-full object-contain"
                  width={36}
                  height={36}
                />
              </div>
              <div className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-slate-800">
                CONCEPT <span className="text-[#ea580c]">AUTOMATION</span> TECHNOLOGIES
              </div>
            </Link>
          </div>

          {/* Copyright Footer Bar */}
          <div className="mt-3 text-center text-xs font-medium text-slate-500">
            <p>
              Copyright © {new Date().getFullYear()} <strong className="text-slate-800 font-semibold">Concept Automation Technologies</strong>. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}

