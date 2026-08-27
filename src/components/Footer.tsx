import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Mail, Send, CheckCircle2, MessageSquare, ExternalLink, ArrowRight } from "lucide-react";
import { company, brands } from "@/data/catalog";
import { subscribeNewsletter } from "@/lib/supabase";
import { toast } from "sonner";
import { InquiryModal } from "./InquiryModal";

const POPULAR_CATEGORIES = [
  { name: "Siemens PLC", query: "Siemens PLC" },
  { name: "Siemens VFD", query: "Siemens VFD" },
  { name: "Siemens HMI", query: "Siemens HMI" },
  { name: "Omron PLC", query: "Omron PLC" },
  { name: "Mitsubishi PLC", query: "Mitsubishi" },
  { name: "Pepperl+Fuchs Sensors", query: "Pepperl+Fuchs" },
  { name: "Allen Bradley Controllers", query: "Allen Bradley" },
  { name: "Delta VFD", query: "Delta VFD" },
  { name: "Schneider HMI & VFD", query: "Schneider" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    await subscribeNewsletter(email);
    setSubscribed(true);
    toast.success("Subscribed!", { description: "You'll receive stock updates & price drops." });
  };

  return (
    <>
      {/* WARM LIGHT SAND FOOTER */}
      <footer className="bg-slate-100 text-slate-800 border-t border-slate-200">
        {/* Ochre Gold Top Accent Bar */}
        <div className="h-1.5 w-full bg-accent" />

        {/* Newsletter Banner */}
        <div className="border-b border-slate-200 bg-slate-200/40">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:px-6 md:flex-row">
            <div>
              <h3 className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950">
                Subscribe for OEM Stock & Price Updates
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-700 font-bold">
                Monthly availability reports for Siemens, Mitsubishi, Omron, P+F & Allen Bradley.
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" /> Subscribed!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex w-full max-w-md items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your work email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent/90 transition-colors shadow"
                >
                  <Send className="h-3.5 w-3.5" /> Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
               <img
                 src="/logo.jpg"
                 alt="Concept Automation"
                 className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-sm"
                 width={48}
                 height={48}
               />
              <span className="font-display text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-950">
                Concept Automation <span className="text-accent">Technologies</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 font-bold">
              Importer, exporter, stockist and supplier of factory automation hardware — PLC, HMI, VFD, DC drives, servo systems and industrial sensors.
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-950 font-extrabold font-mono">GSTIN: {company.gst}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setInquiryOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 border border-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-all shadow-sm"
              >
                <MessageSquare className="h-3.5 w-3.5 text-accent" /> Direct Inquiry
              </button>
              <a
                href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}?text=Hello%20Concept%20Automation%20team,%20I%20need%20a%20price%20quotation.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all"
              >
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-950 mb-2">
              Quick Navigation
            </h3>
            <ul className="space-y-1.5 text-xs font-extrabold">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "Company Profile" },
                { to: "/products", label: "Complete Catalog" },
                { to: "/contact", label: "Contact & Location" },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors">
                    <ArrowRight className="h-3 w-3 text-accent" /> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-950 mb-2">
              Popular Hardware
            </h3>
            <ul className="space-y-1.5 text-xs font-extrabold">
              {POPULAR_CATEGORIES.map((cat) => (
                <li key={cat.name}>
                  <Link to="/products" search={{ q: cat.query }}
                    className="text-slate-700 hover:text-primary transition-colors block text-[11px]">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-950 mb-2">
              OEM Brands
            </h3>
            <div className="flex flex-wrap gap-1.5 text-xs mb-3">
              {brands.slice(0, 8).map((brand) => (
                <Link key={brand} to="/products" search={{ q: brand }}
                  className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-extrabold text-slate-800 hover:bg-accent hover:text-white transition-all border border-slate-300">
                  {brand}
                </Link>
              ))}
            </div>

            <h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-950 mb-2">
              Headquarters
            </h3>
            <ul className="space-y-1.5 text-xs font-extrabold">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent mt-0.5" />
                <a href="https://maps.google.com/?q=Titanium+Business+Park+Makarba+Ahmedabad" target="_blank" rel="noreferrer"
                  className="hover:text-primary text-slate-700 flex items-center gap-1 transition-colors leading-snug">
                  Makarba, Ahmedabad <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-accent" />
                <a href={`tel:${company.phoneRaw}`} className="hover:text-primary font-mono text-[11px] text-slate-700">{company.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-accent" />
                <a href={`mailto:${company.email}`} className="hover:text-primary text-[11px] text-slate-700">{company.email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 bg-slate-200/50 py-3 text-center text-xs font-extrabold text-slate-600">
          <p>© {new Date().getFullYear()} Concept Automation Technologies. All rights reserved.</p>
        </div>
      </footer>

      <InquiryModal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </>
  );
}
