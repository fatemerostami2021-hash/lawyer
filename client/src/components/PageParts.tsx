import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { useLanguage } from "./SiteChrome";
import { X } from "@/content/ui2";

type Img = "office" | "themis" | "gold-scales" | "meeting";


/** Plain photo frame (the 3D scales live on the page-wide backdrop, glued to the .hero-anchor next to it). */
export function HeroVisual({ image, compact = false }: { image?: Img; compact?: boolean }) {
  return (
    <figure className={`page-hero-photo hero-visual${compact ? " compact" : ""}`} data-tilt>
      <div className="image-frame mm-layer" data-depth="8">
        {image && <img className="hv-bg" src={`/assets/photos/${image}.webp`} alt="" loading="eager" />}
      </div>
      <span className="corner tl" /><span className="corner br" />
    </figure>
  );
}

export function PageIntro({ index, kicker, title, children, image }: { index: string; kicker: string; title: string; children?: ReactNode; image?: Img }) {
  return (
    <section className="page-intro page-width page-hero has-image">
      <div className="page-hero-text">
        <div className="page-index"><span>{index}</span><i /></div>
        <span className="section-kicker">{kicker}</span>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      <div className="hero-anchor" data-scene-anchor aria-hidden="true" />
      <HeroVisual image={image} />
    </section>
  );
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`reveal ${className}`}>{children}</div>; }

export function GoldLink({ href, children }: { href: string; children: ReactNode }) { return <Link className="gold-link" href={href}>{children}<ArrowUpRight size={16} /></Link>; }

export function BackToInsights() { const { locale } = useLanguage(); return <Link className="back-link" href="/insights"><ArrowDownRight size={15} /> {X.backToInsights[locale]}</Link>; }

export function LanguageNote() {
  const { locale } = useLanguage();
  return <span className="language-note">{locale === "fa" ? "محتوای آموزشی عمومی · با منابع رسمی" : locale === "ar" ? "محتوى تعليمي عام · مع مصادر رسمية" : "General educational content · sourced"}</span>;
}

export function SectionArrow({ href }: { href: string }) { return <Link className="section-arrow" href={href}><ChevronRight size={18} /></Link>; }
