import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { ThemeProvider } from "../lib/theme";
import { Toaster } from "../components/ui/sonner";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Router Caught Error:", error);
  const router = useRouter();

  const handleReset = () => {
    try {
      router.invalidate();
      reset();
    } catch {
      window.location.href = "/products";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 font-black text-xl">
            !
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Product Details Refreshing
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {error?.message && !error.message.includes("Object")
              ? error.message
              : "We're updating product stock & specifications. Click below to view the catalog."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-blue-700 shadow-md cursor-pointer"
            >
              Reload Page
            </button>
            <a
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800 transition-all hover:bg-slate-100 shadow-2xs"
            >
              Browse 725+ Catalog Items
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Concept Automation Technologies | PLC, HMI & VFD Supplier" },
      {
        name: "description",
        content:
          "Importer, exporter and supplier of factory automation products — Siemens, Mitsubishi, Allen Bradley, Omron, Delta, Schneider PLC, HMI, VFD and servo systems in Ahmedabad.",
      },
      { name: "author", content: "Concept Automation Technologies" },
      { property: "og:title", content: "Concept Automation Technologies | PLC, HMI & VFD Supplier" },
      {
        property: "og:description",
        content:
          "Importer, exporter and supplier of factory automation products — Siemens, Mitsubishi, Allen Bradley, Omron, Delta, Schneider PLC, HMI, VFD and servo systems in Ahmedabad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Concept Automation Technologies | PLC, HMI & VFD Supplier" },
      { name: "twitter:description", content: "Importer, exporter and supplier of factory automation products — Siemens, Mitsubishi, Allen Bradley, Omron, Delta, Schneider PLC, HMI, VFD and servo systems in Ahmedabad." },
      { property: "og:image", content: "/logo.jpg" },
      { name: "twitter:image", content: "/logo.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),

  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

