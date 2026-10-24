import { createContext, lazy, Suspense, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Instagram, Linkedin, Mail, Menu, MessageCircle, Send, X } from "lucide-react";
import gsap from "gsap";
import AnimatedScaleMark from "./AnimatedScaleMark";
import { SITE } from "@/lib/site";

const CosmicScene = lazy(() => import("./CosmicScene"));

type Locale = "en" | "fa" | "ar";
type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void };
const LanguageContext = createContext<LanguageContextValue>({ locale: "en", setLocale: () => undefined });
export const useLanguage = () => useContext(LanguageContext);

const labels = {
  en: { about: "About", expertise: "Expertise", approach: "Approach", insights: "Insights", contact: "Contact", consult: "Request consultation", menu: "Menu", close: "Close", footer: "Corporate & Commercial Law in Iran", designer: "Design studio" },
  fa: { about: "درباره ما", expertise: "حوزه‌های تخصصی", approach: "رویکرد", insights: "مقالات", contact: "تماس", consult: "درخواست مشاوره", menu: "منو", close: "بستن", footer: "حقوق شرکت‌ها و تجارت در ایران", designer: "استودیو طراحی" },
  ar: { about: "عن المكتب", expertise: "مجالات الخبرة", approach: "منهجيتنا", insights: "المقالات", contact: "تواصل", consult: "طلب استشارة", menu: "القائمة", close: "إغلاق", footer: "قانون الشركات والتجارة في إيران", designer: "استوديو التصميم" },
};
const languageOptions: { id: Locale; flag: string; label: string }[] = [
  { id: "fa", flag: "🇮🇷", label: "فارسی" },
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "ar", flag: "🇦🇪", label: "العربية" },
];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [locale, setLocaleState] = useState<Locale>(() => (localStorage.getItem("snl-locale") as Locale) || "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = labels[locale];
  const direction = locale === "en" ? "ltr" : "rtl";

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("snl-locale", next);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  useEffect(() => {
    setMenuOpen(false);
    document.title = location.startsWith("/insights") ? `Insights — SOBHAN NIKSERESHT LAW` : `SOBHAN NIKSERESHT LAW — Corporate & Commercial Law`;
    gsap.fromTo(".route-layer", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }, [location]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <div className="site-shell dynamic-shell" dir={direction}>
        <div className="cosmic-background"><Suspense fallback={<div className="webgl-fallback" />}><CosmicScene opacity={0.7} /></Suspense></div>
        <header className="site-header dynamic-header">
          <div className="header-inner page-width">
            <Link className="brand-lockup" href="/" aria-label="Sobhan Nikseresht Law home"><AnimatedScaleMark /><span className="brand-type"><strong>SOBHAN NIKSERESHT</strong><small>LAW</small></span></Link>
            <nav className="desktop-nav" aria-label="Primary navigation">
              <Link href="/about">{copy.about}</Link><Link href="/expertise">{copy.expertise}</Link><Link href="/approach">{copy.approach}</Link><Link href="/insights">{copy.insights}</Link><Link href="/contact">{copy.contact}</Link>
            </nav>
            <div className="header-actions">
              <div className="language-switcher flag-switcher" aria-label="Language">
                {languageOptions.map(option => <button key={option.id} type="button" className={locale === option.id ? "active" : ""} onClick={() => setLocale(option.id)} aria-label={option.label} title={option.label}><span>{option.flag}</span></button>)}
              </div>
              <Link className="header-cta" href="/contact">{copy.consult}<ArrowUpRight size={15} strokeWidth={1.5} /></Link>
              <button className="menu-trigger" type="button" aria-label={menuOpen ? copy.close : copy.menu} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
            </div>
          </div>
          {menuOpen && <div className="mobile-panel"><Link href="/about">{copy.about}</Link><Link href="/expertise">{copy.expertise}</Link><Link href="/approach">{copy.approach}</Link><Link href="/insights">{copy.insights}</Link><Link href="/contact">{copy.contact}</Link></div>}
        </header>
        <div className="route-layer">{children}</div>
        <footer className="site-footer dynamic-footer">
          <div className="page-width footer-inner">
            <Link className="brand-lockup footer-brand" href="/"><AnimatedScaleMark /><span className="brand-type"><strong>SOBHAN NIKSERESHT</strong><small>LAW</small></span></Link>
            <span className="footer-line">{copy.footer}</span>
            <div className="footer-contact"><span>{SITE.phoneDisplay}</span><a href={`mailto:${SITE.email}`}><Mail size={13} />{SITE.email}</a><strong>{SITE.address}</strong></div>
            <div className="footer-social"><a href={SITE.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a><a href={SITE.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram"><Send size={15} /></a><a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={15} /></a><a href={SITE.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={15} /></a></div>
            <div className="footer-end"><span className="footer-copy">© {new Date().getFullYear()} Sobhan Nikseresht Law</span><a className="designer-link" href={SITE.designerUrl} target="_blank" rel="noreferrer">{copy.designer}<ArrowUpRight size={12} /></a></div>
          </div>
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}
