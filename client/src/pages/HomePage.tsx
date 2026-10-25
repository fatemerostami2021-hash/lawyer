import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Gavel, Globe, Scale, Search, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { AREAS, FAQS, UI } from "@/lib/i18n";
import { insights } from "@/content/legalContent";
import { TeamSection } from "@/components/TeamSection";
import ClickCard from "@/components/ClickCard";
import InsightCard from "@/components/InsightCard";
import { Carousel, FadeSlider, type Slide } from "@/components/Slider";
import { DETAILS, DOCTOR, HOME_UI, QUOTES, SITUATIONS, STEPS } from "@/content/home";
import { GALLERY, X, photoUrl } from "@/content/ui2";

const CosmicScene = lazy(() => import("@/components/CosmicScene"));
const ICONS: Record<string, typeof Scale> = { corporate: Scale, contracts: FileText, "market-entry": Globe, disputes: Gavel, ip: ShieldCheck };

function DoctorPhoto() {
  const [ok, setOk] = useState(true);
  const { locale } = useLanguage();
  return (
    <figure className="doctor-photo" data-tilt>
      <div className="image-frame mm-layer" data-depth="8">
        {ok ? <img src="/assets/photos/doctor.webp" alt={DOCTOR.name[locale]} onError={() => setOk(false)} /> : <div className="doctor-ph"><span>SN</span><small>{HOME_UI.photoHint[locale]}</small></div>}
      </div>
      <span className="corner tl" /><span className="corner br" />
    </figure>
  );
}

export default function HomePage() {
  const { locale, openSearch } = useLanguage();
  const t = (k: keyof typeof UI) => UI[k][locale];
  const [q, setQ] = useState("");
  const [pick, setPick] = useState(0);
  const [qi, setQi] = useState(0);
  const chips = t("heroChips").split("|");
  useEffect(() => { const id = setInterval(() => setQi(v => (v + 1) % QUOTES.length), 7000); return () => clearInterval(id); }, []);
  const quote = QUOTES[qi];
  const sit = SITUATIONS[pick];
  const sitArea = AREAS.find(a => a.id === sit.area)!;
  const gallery: Slide[] = GALLERY.map(g => ({ img: `/assets/photos/${g.img}.webp`, title: g.cap[locale], text: g.sub[locale], href: g.href, cta: X.discover[locale] }));

  return <main className="route-page home-page">
    {/* 1 — Doctor first: photo + text + 3D scales in one screen (also on mobile) */}
    <section className="doctor-section doctor-first page-width">
      <div className="hero-stage" aria-hidden="true"><Suspense fallback={null}><CosmicScene route="/" dir={locale === "en" ? "ltr" : "rtl"} opacity={1} /></Suspense></div>
      <DoctorPhoto />
      <div className="doctor-copy">
        <div className="doctor-head">
          <span className="section-kicker">{HOME_UI.doctorKicker[locale]}</span>
          <h2>{DOCTOR.name[locale]}</h2>
          <strong className="doctor-role">{DOCTOR.role[locale]}</strong>
        </div>
        <div className="doctor-more">
          <p>{DOCTOR.bio[locale]}</p>
          <ul>{DOCTOR.points[locale].map(p => <li key={p}>{p}</li>)}</ul>
          <div className="doctor-actions">
            <Link className="button button-gold" href="/about">{t("about")}<ArrowUpRight size={15} /></Link>
            <Link className="button button-ghost" href="/contact">{t("consult")}</Link>
          </div>
        </div>
      </div>
      <div className="hero-slot" aria-hidden="true" />
    </section>

    {/* 2 — Photo slider */}
    <section className="gallery-section page-width"><FadeSlider slides={gallery} autoplay={5500} className="gallery-slider" /></section>

    {/* 3 — Search */}
    <section className="search-hero page-width">
      <span className="eyebrow">{t("heroKicker")}</span>
      <h1>{t("heroTitle")}</h1>
      <p>{t("heroSub")}</p>
      <form className="hero-search" onSubmit={e => { e.preventDefault(); openSearch(q); }}><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t("searchPh")} /><button type="submit" className="button button-gold">{t("search")}</button></form>
      <div className="hero-chips">{chips.map(c => <button key={c} type="button" onClick={() => openSearch(c)}>{c}</button>)}</div>
    </section>

    <section className="pick-section page-width">
      <div className="section-heading"><span className="section-kicker">01</span><h2>{HOME_UI.pickTitle[locale]}</h2><p>{HOME_UI.pickSub[locale]}</p></div>
      <div className="pick-grid">
        <div className="pick-list">{SITUATIONS.map((s, n) => <button key={s.area} type="button" className={pick === n ? "active" : ""} onClick={() => setPick(n)}><span>{String(n + 1).padStart(2, "0")}</span>{s.text[locale]}</button>)}</div>
        <div className="pick-result" key={sit.area}>
          <small>{HOME_UI.firstStep[locale]}</small>
          <h3>{sitArea.title[locale]}</h3>
          <p>{sit.first[locale]}</p>
          <div className="pick-actions"><Link className="button button-gold" href="/contact">{t("consult")}<ArrowUpRight size={15} /></Link><Link className="button button-ghost" href={`/expertise#${sitArea.id}`}>{t("readMore")}</Link><button type="button" className="button button-ghost" onClick={() => openSearch(sitArea.title[locale])}>{t("search")}</button></div>
        </div>
      </div>
    </section>

    {/* 4 — Services slider */}
    <section className="services-section page-width">
      <div className="section-heading"><span className="section-kicker">02</span><h2>{HOME_UI.servicesTitle[locale]}</h2></div>
      <Carousel perView={{ base: 1, md: 2, lg: 3 }} gap={22} autoplay={6500}>
        {AREAS.map((a, n) => { const Icon = ICONS[a.id]; const d = DETAILS[a.id]; return (
          <ClickCard key={a.id} href={`/expertise#${a.id}`} className="service-card" tilt>
            <div className="sc-img"><img src={photoUrl(n)} alt="" loading="lazy" /><span className="sc-icon"><Icon size={26} strokeWidth={1.3} /></span><span className="area-no">{String(n + 1).padStart(2, "0")}</span></div>
            <div className="sc-body">
              <h3>{a.title[locale]}</h3>
              <p>{a.body[locale]}</p>
              <ul>{d.bullets[locale].map(b => <li key={b}>{b}</li>)}</ul>
              <blockquote><strong>{HOME_UI.example[locale]}:</strong> {d.example[locale]}</blockquote>
              <Link className="gold-link" href={`/expertise#${a.id}`}>{t("readMore")}<ArrowUpRight size={16} /></Link>
            </div>
          </ClickCard>); })}
      </Carousel>
    </section>

    <TeamSection />

    <section className="steps-section page-width">
      <div className="section-heading"><span className="section-kicker">03</span><h2>{HOME_UI.stepsTitle[locale]}</h2></div>
      <div className="steps-grid">{STEPS.map((s, n) => <ClickCard key={n} href="/contact" className="step-card" tilt><span className="area-no">{String(n + 1).padStart(2, "0")}</span><h3>{s.t[locale]}</h3><p>{s.d[locale]}</p></ClickCard>)}</div>
    </section>

    <section className="wisdom-section page-width">
      <span className="section-kicker">{HOME_UI.wisdomTitle[locale]}</span>
      <blockquote key={qi} className="wisdom-quote"><p>{quote.text[locale]}</p><cite>{quote.by[locale]}</cite></blockquote>
      <div className="wisdom-nav"><button type="button" onClick={() => setQi((qi + QUOTES.length - 1) % QUOTES.length)} aria-label={HOME_UI.prev[locale]}><ChevronLeft size={20} /></button><span>{qi + 1} / {QUOTES.length}</span><button type="button" onClick={() => setQi((qi + 1) % QUOTES.length)} aria-label={HOME_UI.next[locale]}><ChevronRight size={20} /></button></div>
    </section>

    <section className="faq-teaser page-width">
      <div className="section-heading"><span className="section-kicker">{t("faq")}</span><h2>{t("faqTitle")}</h2><Link className="gold-link" href="/faq">{t("allFaq")}<ArrowUpRight size={16} /></Link></div>
      <div className="faq-list">{FAQS.slice(0, 4).map(f => <Link key={f.id} href={`/faq#${f.id}`} className="faq-item"><strong>{f.q[locale]}</strong><ArrowUpRight size={16} /></Link>)}</div>
    </section>

    {/* Blog slider */}
    <section className="blog-teaser page-width">
      <div className="section-heading"><span className="section-kicker">{t("blog")}</span><h2>{t("latestBlog")}</h2><Link className="gold-link" href="/insights">{X.allArticles[locale]}<ArrowUpRight size={16} /></Link></div>
      <Carousel perView={{ base: 1, md: 2, lg: 3 }} gap={22} autoplay={7000}>
        {insights.map((p, n) => <InsightCard key={p.slug} p={p} locale={locale} n={n} />)}
      </Carousel>
    </section>

    <section className="closing-panel page-width"><h2>{t("ctaTitle")}</h2><p className="closing-sub">{t("ctaSub")}</p><Link className="button button-gold" href="/contact">{t("consult")}<ArrowUpRight size={15} /></Link></section>
  </main>;
}
