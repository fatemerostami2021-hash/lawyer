import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "./SiteChrome";
import { HOME_UI } from "@/content/home";

type PV = { base: number; md?: number; lg?: number };

function usePerView(pv: PV) {
  const calc = () => { const w = typeof window === "undefined" ? 1200 : window.innerWidth; return w >= 1100 ? (pv.lg ?? pv.md ?? pv.base) : w >= 700 ? (pv.md ?? pv.base) : pv.base; };
  const [n, setN] = useState(calc);
  useEffect(() => { const f = () => setN(calc()); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, [pv.base, pv.md, pv.lg]); // eslint-disable-line react-hooks/exhaustive-deps
  return n;
}

/** Multi-card carousel: arrows, dots, swipe/drag, optional autoplay. Works in LTR and RTL. */
export function Carousel({ children, perView = { base: 1 }, gap = 20, autoplay = 0, className = "" }: { children: ReactNode; perView?: PV; gap?: number; autoplay?: number; className?: string }) {
  const { locale } = useLanguage(); const rtl = locale !== "en";
  const items = Children.toArray(children);
  const pv = usePerView(perView);
  const max = Math.max(0, items.length - pv);
  const [i, setI] = useState(0); const [hover, setHover] = useState(false);
  const idx = Math.min(i, max);
  const go = useCallback((n: number) => setI(Math.max(0, Math.min(max, n))), [max]);
  const start = useRef<number | null>(null); const dragged = useRef(false);
  useEffect(() => { if (!autoplay || hover || max === 0) return; const t = setInterval(() => setI(v => (v >= max ? 0 : v + 1)), autoplay); return () => clearInterval(t); }, [autoplay, hover, max]);
  const end = (x: number) => {
    if (start.current === null) return; const dx = x - start.current; start.current = null;
    if (Math.abs(dx) > 40) { dragged.current = true; const forward = rtl ? dx > 0 : dx < 0; go(idx + (forward ? 1 : -1)); }
  };
  const sign = rtl ? 1 : -1;
  const step = `((100% - ${gap * (pv - 1)}px) / ${pv} + ${gap}px)`;
  return (
    <div className={`car ${className}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="car-viewport" onPointerDown={e => { start.current = e.clientX; dragged.current = false; }} onPointerUp={e => end(e.clientX)} onPointerCancel={() => { start.current = null; }} onClickCapture={e => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}>
        <div className="car-track" style={{ gap, transform: `translateX(calc(${sign * idx} * ${step}))` }}>
          {items.map((c, k) => <div key={k} className="car-item" style={{ flex: `0 0 calc((100% - ${gap * (pv - 1)}px) / ${pv})` }}>{c}</div>)}
        </div>
      </div>
      {max > 0 && (
        <div className="car-ctrl">
          <button type="button" className="car-btn" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label={HOME_UI.prev[locale]}><ChevronLeft size={18} /></button>
          <div className="car-dots">{Array.from({ length: max + 1 }).map((_, k) => <button key={k} type="button" className={k === idx ? "on" : ""} onClick={() => go(k)} aria-label={String(k + 1)} />)}</div>
          <button type="button" className="car-btn" onClick={() => go(idx + 1)} disabled={idx === max} aria-label={HOME_UI.next[locale]}><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
}

export type Slide = { img: string; kicker?: string; title?: string; text?: string; href?: string; cta?: string };

/** Full-width photo slider (cross-fade). `children` is a static overlay (e.g. title + search). */
export function FadeSlider({ slides, autoplay = 6500, className = "", children }: { slides: Slide[]; autoplay?: number; className?: string; children?: ReactNode }) {
  const { locale } = useLanguage();
  const [i, setI] = useState(0); const [paused, setPaused] = useState(false);
  const n = slides.length; const x0 = useRef<number | null>(null);
  const go = (k: number) => setI(((k % n) + n) % n);
  useEffect(() => { if (!autoplay || paused || n < 2) return; const t = setInterval(() => setI(v => (v + 1) % n), autoplay); return () => clearInterval(t); }, [autoplay, paused, n]);
  if (!n) return null;
  const s = slides[Math.min(i, n - 1)];
  const rtl = locale !== "en";
  return (
    <div className={`fs ${className}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { x0.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (x0.current === null) return; const dx = e.changedTouches[0].clientX - x0.current; x0.current = null; if (Math.abs(dx) > 45) { const forward = rtl ? dx > 0 : dx < 0; go(i + (forward ? 1 : -1)); } }}>
      <div className="fs-slides">{slides.map((sl, k) => <div key={k} className={`fs-slide${k === i ? " on" : ""}`} aria-hidden={k !== i}><img src={sl.img} alt="" loading={k === 0 ? "eager" : "lazy"} /></div>)}</div>
      <div className="fs-shade" />
      {children && <div className="fs-overlay">{children}</div>}
      <div className="fs-bar">
        <div className="fs-caption" key={i}>
          {s.kicker && <small>{s.kicker}</small>}
          {s.title && <strong>{s.title}</strong>}
          {s.text && <p>{s.text}</p>}
          {s.href && <Link className="fs-cta" href={s.href}>{s.cta}<ArrowUpRight size={15} /></Link>}
        </div>
        {n > 1 && (
          <div className="fs-ctrl">
            <button type="button" className="fs-btn" onClick={() => go(i - 1)} aria-label={HOME_UI.prev[locale]}><ChevronLeft size={18} /></button>
            <div className="fs-dots">{slides.map((_, k) => <button key={k} type="button" className={k === i ? "on" : ""} onClick={() => go(k)} aria-label={String(k + 1)} />)}</div>
            <button type="button" className="fs-btn" onClick={() => go(i + 1)} aria-label={HOME_UI.next[locale]}><ChevronRight size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
