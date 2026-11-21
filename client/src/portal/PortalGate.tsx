import { lazy, ReactNode, Suspense } from "react";
import { useLocation } from "wouter";

// The portal/admin code is lazy-loaded so the public website's bundle (and PageSpeed score) is not affected.
const PortalApp = lazy(() => import("./PortalApp"));
export default function PortalGate({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  if (/^\/(portal|admin)(\/|$)/.test(loc)) return <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#07101d", color: "#f4d487", display: "grid", placeItems: "center", fontFamily: "Vazirmatn,sans-serif" }}>در حال بارگذاری…</div>}><PortalApp /></Suspense>;
  return <>{children}</>;
}
