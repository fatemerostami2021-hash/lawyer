import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { useLanguage } from "./SiteChrome";

export function PageIntro({ index, kicker, title, children }: { index: string; kicker: string; title: string; children?: ReactNode }) {
  return <section className="page-intro page-width"><div className="page-index"><span>{index}</span><i /></div><span className="section-kicker">{kicker}</span><h1>{title}</h1>{children && <p>{children}</p>}</section>;
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) { return <div className={`reveal ${className}`}>{children}</div>; }

export function GoldLink({ href, children }: { href: string; children: ReactNode }) { return <Link className="gold-link" href={href}>{children}<ArrowUpRight size={16} /></Link>; }

export function BackToInsights() { return <Link className="back-link" href="/insights"><ArrowDownRight size={15} /> Back to insights</Link>; }

export function LanguageNote() {
  const { locale } = useLanguage();
  return <span className="language-note">{locale === "fa" ? "محتوای آموزشی عمومی · با منابع رسمی" : locale === "ar" ? "محتوى تعليمي عام · مع مصادر رسمية" : "General educational content · sourced"}</span>;
}

export function SectionArrow({ href }: { href: string }) { return <Link className="section-arrow" href={href}><ChevronRight size={18} /></Link>; }
