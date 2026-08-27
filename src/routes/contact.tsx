import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Phone, MapPin, User, Building2, CheckCircle2, Mail, Send, MessageSquare, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { company } from "@/data/catalog";
import { submitContactForm } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Concept Automation Technologies, Ahmedabad" },
      { name: "description", content: "Contact Concept Automation Technologies for PLC, HMI, VFD and servo system inquiries. Call +91 87994 47337." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", companyName: "", subject: "Industrial Automation Inquiry", message: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error("Please fill in your Name, Phone, and Requirement.");
      return;
    }
    setLoading(true);
    const res = await submitContactForm({
      name: formData.name, email: formData.email || "no-email@concept-auto-tech.com",
      phone: formData.phone, company: formData.companyName, subject: formData.subject, message: formData.message,
    });
    setLoading(false);
    if (res.success) {
      setSent(true);
      toast.success("Message Sent!", { description: "Our team will contact you shortly." });
    }
  };

  const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Banner */}
        <section className="bg-gradient-to-r from-blue-50/50 to-slate-50/50 py-12 sm:py-16 text-foreground border-b border-border">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-7xl px-4 sm:px-6"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Direct Support & Inquiries</span>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              Contact Concept Automation
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed sm:text-base">
              Send your part number or technical specs. Our sales desk responds with stock availability and quotations.
            </p>
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_1.4fr]">
          {/* Left: Company Details */}
          <motion.div 
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <Building2 className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <h3 className="font-display text-sm font-bold text-stone-900">{company.name}</h3>
                  <p className="text-xs text-accent font-semibold font-mono">GSTIN: {company.gst}</p>
                </div>
              </div>

              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <User className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-stone-900">{company.proprietor}</div>
                    <div className="text-stone-500 text-xs">Proprietor</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Phone / WhatsApp</div>
                    <a href={`tel:${company.phoneRaw}`} className="font-mono font-semibold text-stone-900 hover:text-primary transition-colors">
                      {company.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Sales Email</div>
                    <a href={`mailto:${company.email}`} className="font-semibold text-stone-900 hover:text-primary transition-colors">
                      {company.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">Office & Warehouse</div>
                    <div className="font-medium text-stone-700 leading-relaxed text-sm">{company.address}</div>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(company.address)}`} target="_blank" rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/90">
                      View on Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* WhatsApp */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-emerald-800">
                <MessageSquare className="h-4 w-4 text-emerald-600" /> WhatsApp Technical Desk
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Need urgent part availability during breakdown? Message us directly.
              </p>
              <a
                href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}?text=Hello%20Concept%20Automation,%20I%20need%20a%20quotation%20for:`}
                target="_blank" rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm"
          >
            <h2 className="font-display text-xl font-bold text-stone-900 sm:text-2xl">
              Send Your Inquiry & Part List
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              We'll respond with a formal quotation via email or WhatsApp.
            </p>

            {sent ? (
              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center animate-scale-in">
                <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
                <h3 className="mt-3 font-display text-xl font-bold text-stone-900">Message Received!</h3>
                <p className="mt-2 text-sm text-stone-500">
                  Thank you <strong className="text-stone-900">{formData.name}</strong>. An automation engineer will contact you shortly.
                </p>
                <button
                  onClick={() => { setSent(false); setFormData({ name: "", phone: "", email: "", companyName: "", subject: "Industrial Automation Inquiry", message: "" }); }}
                  className="mt-5 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-accent transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name *</label>
                    <input type="text" required placeholder="Your name" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Mobile / WhatsApp *</label>
                    <input type="tel" required placeholder="+91 98765 43210" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email</label>
                    <input type="email" placeholder="name@company.com" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Company</label>
                    <input type="text" placeholder="Company name" value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Subject</label>
                  <input type="text" placeholder="e.g. Quotation for Siemens S7-1200" value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Requirement / Part List *</label>
                  <textarea rows={4} required placeholder="List exact part numbers, model codes, quantities..." value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${inputClass} resize-none`} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-accent transition-colors disabled:opacity-50">
                  {loading ? "Submitting..." : <><Send className="h-4 w-4" /> Send Message</>}
                </button>
              </form>
            )}
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
