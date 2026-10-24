import { useEffect } from "react";
import gsap from "gsap";

// Mouse-driven motion for text, images and cards (desktop mouse only).
// Uses the CSS `translate` property so it never fights GSAP transforms.
const TEXT = ".home-hero h1, .page-intro h1, .section-heading h2, .manifesto-copy h2, .closing-panel h2, .detail-header h1, [data-mm]";
const CARD = "[data-tilt], .area-card, .mini-service, .insight-card, .faq-item";
const BTN = ".button, .header-cta, .chat-fab";

export default function MouseMotion({ routeKey }: { routeKey: string }) {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, px = 0, py = 0, cx = -999, cy = -999; let target: Element | null = null; let active: HTMLElement | null = null;
    const tilt = new WeakMap<HTMLElement, { rx: (v: number) => void; ry: (v: number) => void }>();
    const getTilt = (el: HTMLElement) => { let t = tilt.get(el); if (!t) { gsap.set(el, { transformPerspective: 900 }); t = { rx: gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" }), ry: gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" }) }; tilt.set(el, t); } return t; };
    const reset = (el: HTMLElement) => { const t = getTilt(el); t.rx(0); t.ry(0); el.style.setProperty("--gx", "50%"); el.style.setProperty("--gy", "50%"); el.querySelectorAll<HTMLElement>(".mm-layer").forEach(n => { n.style.translate = "0 0"; }); };

    const frame = () => {
      raf = 0;
      document.querySelectorAll<HTMLElement>(TEXT).forEach(el => {
        const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        const d = Number(el.dataset.mm) || 14;
        el.style.translate = `${(px * d).toFixed(1)}px ${(py * d * 0.6).toFixed(1)}px`;
      });
      const card = target ? (target.closest(CARD) as HTMLElement | null) : null;
      if (active && active !== card) reset(active);
      active = card;
      if (card) {
        const r = card.getBoundingClientRect(); const nx = ((cx - r.left) / r.width) * 2 - 1, ny = ((cy - r.top) / r.height) * 2 - 1;
        const t = getTilt(card); t.ry(nx * 8); t.rx(-ny * 8);
        card.style.setProperty("--gx", `${((cx - r.left) / r.width) * 100}%`); card.style.setProperty("--gy", `${((cy - r.top) / r.height) * 100}%`);
        card.querySelectorAll<HTMLElement>(".mm-layer").forEach(n => { const dep = Number(n.dataset.depth) || 8; n.style.translate = `${(nx * dep).toFixed(1)}px ${(ny * dep).toFixed(1)}px`; });
      }
      const fr = target ? (target.closest(".image-frame") as HTMLElement | null) : null;
      document.querySelectorAll<HTMLElement>(".image-frame.is-hot").forEach(f => { if (f !== fr) { f.classList.remove("is-hot"); f.querySelectorAll<HTMLElement>("img").forEach(n => { n.style.translate = "0 0"; }); } });
      if (fr) { fr.classList.add("is-hot"); const r = fr.getBoundingClientRect(); const nx = ((cx - r.left) / r.width) * 2 - 1, ny = ((cy - r.top) / r.height) * 2 - 1; fr.querySelectorAll<HTMLElement>("img").forEach(n => { n.style.translate = `${(-nx * 16).toFixed(1)}px ${(-ny * 16).toFixed(1)}px`; }); }
      document.querySelectorAll<HTMLElement>(BTN).forEach(b => { const r = b.getBoundingClientRect(); const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2); const near = Math.hypot(dx, dy) < Math.max(r.width, 90) * 0.7 + 30; b.style.translate = near ? `${Math.max(-10, Math.min(10, dx * 0.18)).toFixed(1)}px ${Math.max(-8, Math.min(8, dy * 0.25)).toFixed(1)}px` : "0 0"; });
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType && e.pointerType !== "mouse") return; cx = e.clientX; cy = e.clientY; px = (cx / innerWidth) * 2 - 1; py = (cy / innerHeight) * 2 - 1; target = e.target as Element; if (!raf) raf = requestAnimationFrame(frame); };
    const onLeave = () => { px = 0; py = 0; target = null; cx = -999; cy = -999; if (!raf) raf = requestAnimationFrame(frame); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => { window.removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("pointerleave", onLeave); if (raf) cancelAnimationFrame(raf); if (active) reset(active); };
  }, [routeKey]);
  return null;
}
