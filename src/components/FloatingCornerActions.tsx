import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, ArrowUp, X, Send, CheckCircle2, Home, Package, MessageSquare } from "lucide-react";
import { company } from "@/data/catalog";
import { submitContactForm } from "@/lib/supabase";
import { toast } from "sonner";
import { InquiryModal } from "./InquiryModal";

export function FloatingCornerActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSubmitted, setChatSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 250);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleAssistantSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    const res = await submitContactForm({
      name: "Assistant Visitor", email: "chat@concept-auto-tech.com",
      phone: company.phoneRaw, subject: "Support Chat", message: chatMessage,
    });
    setChatLoading(false);
    if (res.success) {
      setChatSubmitted(true);
      toast.success("Message sent!", { description: "An engineer will assist you shortly." });
      setChatMessage("");
    }
  };

  return (
    <>
      {/* Left edge quick actions — hidden on mobile */}
      <div className="fixed left-0 top-1/2 z-40 -translate-y-1/2 hidden sm:flex flex-col gap-1.5 p-2">
        <button
          onClick={() => setInquiryModalOpen(true)}
          title="Email Inquiry"
          className="group flex h-10 w-10 items-center justify-center rounded-r-xl bg-primary text-primary-foreground shadow-md hover:w-32 hover:bg-accent transition-all duration-200"
        >
          <Mail className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="ml-2 hidden text-[10px] font-bold uppercase tracking-wider group-hover:inline">Email</span>
        </button>

        <a
          href={`tel:${company.phoneRaw}`}
          title="Call Us"
          className="group flex h-10 w-10 items-center justify-center rounded-r-xl bg-primary/90 text-primary-foreground shadow-md hover:w-32 hover:bg-accent transition-all duration-200"
        >
          <Phone className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="ml-2 hidden text-[10px] font-bold uppercase tracking-wider group-hover:inline">Call</span>
        </a>

        <a
          href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}?text=Hello%20Concept%20Automation,%20I%20need%20assistance%20with:`}
          target="_blank" rel="noreferrer"
          title="WhatsApp"
          className="group flex h-10 w-10 items-center justify-center rounded-r-xl bg-emerald-600 text-white shadow-md hover:w-32 hover:bg-emerald-500 transition-all duration-200"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="ml-2 hidden text-[10px] font-bold uppercase tracking-wider group-hover:inline">WhatsApp</span>
        </a>
      </div>

      {/* Bottom right floating widgets (desktop only) */}
      <div className="fixed right-4 bottom-4 sm:right-5 sm:bottom-5 z-40 hidden sm:flex flex-col items-end gap-3">
        {showScrollTop && (
          <button onClick={scrollToTop} title="Back to Top"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-lg hover:scale-110 transition-transform">
            <ArrowUp className="h-4 w-4 text-accent" />
          </button>
        )}

        {/* Assistant panel */}
        {assistantOpen && (
          <div className="w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs">
                  CA
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border-2 border-primary" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold">Automation Assistant</h4>
                  <p className="text-[10px] text-slate-300">Online · Quick Support</p>
                </div>
              </div>
              <button onClick={() => setAssistantOpen(false)} className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              <div className="rounded-xl bg-muted p-3 text-xs text-foreground font-medium leading-relaxed">
                👋 Welcome to <strong>Concept Automation</strong>. How can we help you today?
              </div>

              <div className="rounded-xl border border-border p-3 space-y-1.5 text-xs">
                <a href={`tel:${company.phoneRaw}`} className="flex items-center gap-2 text-foreground hover:text-accent">
                  <Phone className="h-3.5 w-3.5 text-accent" /> <span className="font-mono">{company.phone}</span>
                </a>
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-foreground hover:text-accent">
                  <Mail className="h-3.5 w-3.5 text-accent" /> <span>{company.email}</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setAssistantOpen(false); setInquiryModalOpen(true); }}
                  className="rounded-xl border border-border bg-muted py-2 text-[11px] font-bold text-foreground hover:bg-accent hover:text-white transition-all">
                  Request Quote
                </button>
                <a href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-all text-center">
                  WhatsApp
                </a>
              </div>

              {chatSubmitted ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" /> Message received. We'll respond shortly!
                </div>
              ) : (
                <form onSubmit={handleAssistantSend} className="flex gap-2 pt-2 border-t border-border">
                  <input type="text" placeholder="Type part code or query..."
                    value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button type="submit" disabled={chatLoading}
                    className="rounded-xl bg-primary px-3 py-2 text-white hover:bg-accent transition-colors">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Trigger bubble */}
        <button onClick={() => setAssistantOpen((v) => !v)}
          className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:scale-110 hover:bg-emerald-500 transition-all animate-whatsapp-pulse">
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white border-2 border-white shadow">
            1
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE STICKY BOTTOM NAVIGATION BAR (User Request)     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <nav className="block sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md text-slate-700 border-t border-border shadow-lg">
        <div className="grid grid-cols-5 items-center py-2 px-1 text-center font-semibold">
          <Link to="/" className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-primary transition-colors">
            <Home className="h-4 w-4 text-primary mb-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Home</span>
          </Link>

          <Link to="/products" className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-primary transition-colors">
            <Package className="h-4 w-4 text-primary mb-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Catalog</span>
          </Link>

          <button onClick={() => setInquiryModalOpen(true)} className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-primary transition-colors">
            <MessageSquare className="h-4 w-4 text-accent mb-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Quote</span>
          </button>

          <a href={`tel:${company.phoneRaw}`} className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-primary transition-colors">
            <Phone className="h-4 w-4 text-emerald-600 mb-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Call</span>
          </a>

          <button onClick={scrollToTop} className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-primary transition-colors">
            <ArrowUp className="h-4 w-4 text-accent mb-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-tight">Top</span>
          </button>
        </div>
      </nav>

      <InquiryModal isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} />
    </>
  );
}
