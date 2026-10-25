import { lazy, Suspense, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { useLanguage } from "./SiteChrome";
import { X } from "@/content/ui2";

const CosmicScene = lazy(() => import("./CosmicScene"));
type Img = "office" | "themis" | "gold-scales" | "meeting";

const ROT: Record<string, number> = { "/about": 0.35, "/expertise": -0.35, "/approach": 0.3, "/insights": -0.3, "/faq": 0.35, "/contact": -0.25 };

/** Photo frame with the 3D scales floating in front of it — used on every inner page. */
export function HeroVisual({ image, compact = false }: { image?: Img; compact?: boolean }) {
  const { locale } = useLanguage(); const [path] = useLocation();
  const key = "/" + (path.split("/")[1] ?? "");
  const pose = { x: 0, y: -0.45, scale: compact ? 0.62 : 0.8, rotY: ROT[key] ?? -0.3 };
  return (
    <figure className={`page-hero-photo hero-visual${compact ? " compact" : ""}`} data-tilt>
      <div className="image-frame mm-layer" data-depth="8">
        {image && <img className="hv-bg" src={`/assets/photos/${image}.webp`} alt="" loading="eager" />}
        <div className="hv-stage"><Suspense fallback={null}><CosmicScene route={path} pose={pose} dir={locale === "en" ? "ltr" : "rtl"} opacity={1} /></Suspense></div>
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
