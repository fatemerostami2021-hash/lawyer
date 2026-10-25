import { lazy, Suspense, useEffect, useState } from "react";

const CosmicScene = lazy(() => import("./CosmicScene"));

/** One fixed, page-wide canvas with the 3D scales. Mounted once (see main.tsx), shared by every page. */
export default function SceneBackdrop() {
  const read = () => ({ path: window.location.pathname, dir: (document.documentElement.dir === "rtl" ? "rtl" : "ltr") as "rtl" | "ltr" });
  const [s, setS] = useState(read);
  useEffect(() => {
    const f = () => setS(prev => { const n = read(); return n.path === prev.path && n.dir === prev.dir ? prev : n; });
    const ev = ["popstate", "pushState", "replaceState"]; ev.forEach(e => window.addEventListener(e, f));
    const mo = new MutationObserver(f); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["dir", "lang"] });
    const id = window.setInterval(f, 500);
    return () => { ev.forEach(e => window.removeEventListener(e, f)); mo.disconnect(); window.clearInterval(id); };
  }, []);
  return <Suspense fallback={null}><CosmicScene route={s.path} dir={s.dir} opacity={1} mode="backdrop" /></Suspense>;
}
