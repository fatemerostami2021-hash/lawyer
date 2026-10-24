import { createContext, lazy, Suspense, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, ChevronDown, Instagram, Linkedin, Mail, Menu, MessageCircle, Search, Send, X } from "lucide-react";
import gsap from "gsap";
import AnimatedScaleMark from "./AnimatedScaleMark";
import WaveText from "./WaveText";
import { Flag } from "./Flags";
import SearchOverlay from "./SearchOverlay";
import ChatHub from "./ChatHub";
import MouseMotion from "./MouseMotion";
import { AREAS, UI, type Locale } from "@/lib/i18n";
import { insights } from "@/content/legalContent";
import { SITE } from "@/lib/site";

const CosmicScene = lazy(() => import("./CosmicScene"));

type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void; openSearch: (q?: string) => void };
const LanguageContext = createContext<LanguageContextValue>({ locale: "en", setLocale: () => undefined, openSearch: () => undefined });
export const useLanguage = () => useContext(LanguageContext);
export type { Locale };

const languageOptions: { id: Locale; label: string }[] = [
  { id: "ar", label: "العربية" }, { id: "fa", label: "فارسی" }, { id: "en", label: "English" },
];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [locale, setLocaleState] = useState<Locale>(() => (localStorage.getItem("snl-locale") as Locale) || "fa");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mega, setMega] = useState<"expertise" | "help" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const direction = locale === "en" ? "ltr" : "rtl";
  const t = (k: keyof typeof UI) => UI[k][locale];

  const setLocale = (next: Locale) => { setLocaleState(next); localStorage.setItem("snl-locale", next); };
  const openSearch = (q = "") => { setSearchQ(q); setSearchOpen(true); setMega(null); };

  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = direction; }, [locale, direction]);
  useEffect(() => {
    setMenuOpen(false); setMega(null);
    document.title = `SOBHAN NIKSERESHT LAW — ${t("footer")}`;
    gsap.fromTo(".route-layer", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
    window.scrollTo({ top: 0 });
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);

  const nav = (href: string, label: string) => <Link href={href} className={location === href ? "active" : ""}><WaveText text={label} locale={locale} /></Link>;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, openSearch }}>
      <div className="site-shell dynamic-shell" dir={direction}>
        <div className="cosmic-background"><Suspense fallback={<div className="webgl-fallback" />}><CosmicScene route={location} opacity={0.95} /></Suspense></div>
        <header className="site-header dynamic-header" onMouseLeave={() => setMega(null)}>
          <div className="header-inner page-width">
            <Link className="brand-lockup" href="/" aria-label="Sobhan Nikseresht Law home"><AnimatedScaleMark /><span className="brand-type"><strong>SOBHAN NIKSERESHT</strong><small>LAW</small></span></Link>
            <nav className="desktop-nav" aria-label="Primary navigation">
              {nav("/about", t("about"))}
              <div className="nav-item" onMouseEnter={() => setMega("expertise")}><Link href="/expertise" className={location === "/expertise" ? "active" : ""}><WaveText text={t("expertise")} locale={locale} /><ChevronDown size={12} /></Link></div>
              {nav("/approach", t("approach"))}
              <div className="nav-item" onMouseEnter={() => setMega("help")}><button type="button" className="nav-btn"><WaveText text={t("legalHelp")} locale={locale} /><ChevronDown size={12} /></button></div>
              {nav("/contact", t("contact"))}
            </nav>
            <div className="header-actions">
              <button type="button" className="icon-btn" onClick={() => openSearch()} aria-label={t("search")}><Search size={17} /></button>
              <div className="language-switcher flag-switcher" aria-label="Language">
                {languageOptions.map(o => <button key={o.id} type="button" className={locale === o.id ? "active" : ""} onClick={() => setLocale(o.id)} aria-label={o.label} title={o.label}><Flag code={o.id} /></button>)}
              </div>
              <Link className="header-cta" href="/contact"><WaveText text={t("consult")} locale={locale} /><ArrowUpRight size={15} strokeWidth={1.5} /></Link>
              <button className="menu-trigger" type="button" aria-label={menuOpen ? t("close") : t("menu")} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
            </div>
          </div>
          {mega && (
            <div className="mega" onMouseEnter={() => setMega(mega)}>
              <div className="page-width mega-inner">
                {mega === "expertise" ? (
                  <>
                    <div className="mega-grid">{AREAS.map((a, n) => <Link key={a.id} href="/expertise" className="mega-link"><span>{String(n + 1).padStart(2, "0")}</span><strong>{a.title[locale]}</strong><small>{a.body[locale].slice(0, 72)}…</small></Link>)}</div>
                    <button type="button" className="mega-cta" onClick={() => openSearch()}><Search size={15} />{t("megaCta")}</button>
                  </>
                ) : (
                  <>
                    <div className="mega-grid mega-help">
                      <Link href="/insights" className="mega-link"><span>01</span><strong>{t("blog")}</strong><small>{insights[0] ? (locale === "fa" ? insights[0].titleFa : insights[0].title) : ""}</small></Link>
                      <Link href="/faq" className="mega-link"><span>02</span><strong>{t("faq")}</strong><small>{t("faqTitle")}</small></Link>
                      <button type="button" className="mega-link" onClick={() => openSearch()}><span>03</span><strong>{t("search")}</strong><small>{t("searchPh")}</small></button>
                      <Link href="/contact" className="mega-link"><span>04</span><strong>{t("consult")}</strong><small>{t("disclaimer")}</small></Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {menuOpen && <div className="mobile-panel"><Link href="/">{t("home")}</Link><Link href="/about">{t("about")}</Link><Link href="/expertise">{t("expertise")}</Link><Link href="/approach">{t("approach")}</Link><Link href="/insights">{t("blog")}</Link><Link href="/faq">{t("faq")}</Link><Link href="/contact">{t("contact")}</Link><button type="button" onClick={() => openSearch()}>{t("search")}</button></div>}
        </header>
        <div className="route-layer">{children}</div>
        <footer className="site-footer dynamic-footer">
          <div className="page-width footer-inner">
            <Link className="brand-lockup footer-brand" href="/"><AnimatedScaleMark /><span className="brand-type"><strong>SOBHAN NIKSERESHT</strong><small>LAW</small></span></Link>
            <span className="footer-line">{t("footer")}</span>
            <div className="footer-contact"><span dir="ltr">{SITE.phoneDisplay}</span><a href={`mailto:${SITE.email}`}><Mail size={13} />{SITE.email}</a><strong>{SITE.address}</strong></div>
            <div className="footer-social"><a href={SITE.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a><a href={SITE.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram"><Send size={15} /></a><a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={15} /></a><a href={SITE.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={15} /></a></div>
            <div className="footer-end"><span className="footer-copy">© {new Date().getFullYear()} Sobhan Nikseresht Law</span><a className="designer-link" href={SITE.designerUrl} target="_blank" rel="noreferrer">{t("designer")}<ArrowUpRight size={12} /></a></div>
          </div>
        </footer>
        <ChatHub locale={locale} />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} locale={locale} initial={searchQ} />
        <MouseMotion routeKey={location} />
      </div>
    </LanguageContext.Provider>
  );
}
