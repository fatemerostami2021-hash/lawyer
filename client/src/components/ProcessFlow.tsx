import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./SiteChrome";
import ClickCard from "./ClickCard";
import { STEPS } from "@/content/home";

/** Animated timeline: the gold line draws itself and the steps light up one after another when scrolled into view. */
export default function ProcessFlow() {
  const { locale } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`process-flow${on ? " is-on" : ""}`} style={{ ["--n" as string]: STEPS.length }}>
      <div className="pf-line"><i /></div>
      {STEPS.map((s, n) => (
        <ClickCard key={n} href="/approach" className="pf-step">
          <span className="pf-node" style={{ ["--i" as string]: n }}><b>{String(n + 1).padStart(2, "0")}</b></span>
          <h3>{s.t[locale]}</h3>
          <p>{s.d[locale]}</p>
        </ClickCard>
      ))}
    </div>
  );
}
