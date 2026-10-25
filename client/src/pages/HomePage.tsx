import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Gavel, Globe, Scale, Search, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { AREAS, FAQS, UI } from "@/lib/i18n";
import { insights } from "@/content/legalContent";
import { TeamSection } from "@/components/TeamSection";
import { DETAILS, DOCTOR, HOME_UI, QUOTES, SITUATIONS, STEPS } from "@/content/home";

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

  return <main className="route-page home-page">
    <section className="home-hero page-width">
      <div className="home-hero-copy reveal is-visible">
        <span className="eyebrow">{t("heroKicker")}</span>
        <h1>{t("heroTitle")}</h1>
        <p>{t("heroSub")}</p>
        <form className="hero-search" onSubmit={e => { e.preventDefault(); openSearch(q); }}><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t("searchPh")} /><button type="submit" className="button button-gold">{t("search")}</button></form>
        <div className="hero-chips">{chips.map(c => <button key={c} type="button" onClick={() => openSearch(c)}>{c}</button>)}</div>
      </div>
    </section>

    <section className="pick-section page-width">
      <div className="section-heading"><span className="section-kicker">01</span><h2>{HOME_UI.pickTitle[locale]}</h2><p>{HOME_UI.pickSub[locale]}</p></div>
      <div className="pick-grid">
        <div className="pick-list">{SITUATIONS.map((s, n) => <button key={s.area} type="button" className={pick === n ? "active" : ""} onClick={() => setPick(n)}><span>{String(n + 1).padStart(2, "0")}</span>{s.text[locale]}</button>)}</div>
        <div className="pick-result" key={sit.area}>
          <small>{HOME_UI.firstStep[locale]}</small>
          <h3>{sitArea.title[locale]}</h3>
          <p>{sit.first[locale]}</p>
          <div className="pick-actions"><Link className="button button-gold" href="/contact">{t("consult")}<ArrowUpRight size={15} /></Link><button type="button" className="button button-ghost" onClick={() => openSearch(sitArea.title[locale])}>{t("search")}</button></div>
        </div>
      </div>
    </section>

    <section className="services-section page-width">
      <div className="section-heading"><span className="section-kicker">02</span><h2>{HOME_UI.servicesTitle[locale]}</h2></div>
      {AREAS.map((a, n) => { const Icon = ICONS[a.id]; const d = DETAILS[a.id]; return (
        <article key={a.id} className={`service-row ${n % 2 ? "flip" : ""}`}>
          <div className="service-icon" data-tilt><Icon size={64} strokeWidth={1.2} /><span className="area-no">{String(n + 1).padStart(2, "0")}</span></div>
          <div className="service-copy">
            <h3>{a.title[locale]}</h3>
            <p>{a.body[locale]}</p>
            <ul>{d.bullets[locale].map(b => <li key={b}>{b}</li>)}</ul>
            <blockquote><strong>{HOME_UI.example[locale]}:</strong> {d.example[locale]}</blockquote>
            <Link className="gold-link" href="/expertise">{t("readMore")}<ArrowUpRight size={16} /></Link>
          </div>
        </article>); })}
    </section>

    <section className="doctor-section page-width">
      <DoctorPhoto />
      <div className="doctor-copy">
        <span className="section-kicker">{HOME_UI.doctorKicker[locale]}</span>
        <h2>{DOCTOR.name[locale]}</h2>
        <strong className="doctor-role">{DOCTOR.role[locale]}</strong>
        <p>{DOCTOR.bio[locale]}</p>
        <ul>{DOCTOR.points[locale].map(p => <li key={p}>{p}</li>)}</ul>
        <Link className="button button-gold" href="/about">{t("about")}<ArrowUpRight size={15} /></Link>
      </div>
    </section>

    <TeamSection />

    <section className="steps-section page-width">
      <div className="section-heading"><span className="section-kicker">03</span><h2>{HOME_UI.stepsTitle[locale]}</h2></div>
      <div className="steps-grid">{STEPS.map((s, n) => <div key={n} className="step-card" data-tilt><span className="area-no">{String(n + 1).padStart(2, "0")}</span><h3>{s.t[locale]}</h3><p>{s.d[locale]}</p></div>)}</div>
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

    <section className="blog-teaser page-width">
      <div className="section-heading"><span className="section-kicker">{t("blog")}</span><h2>{t("latestBlog")}</h2></div>
      <div className="area-grid">{insights.slice(0, 3).map(p => <Link key={p.slug} href={`/insights/${p.slug}`} className="insight-card"><span className="area-no">{p.accent}</span><h3>{locale === "fa" ? p.titleFa : p.title}</h3><p>{p.deck}</p><ArrowUpRight size={18} /></Link>)}</div>
    </section>

    <section className="closing-panel page-width"><h2>{t("ctaTitle")}</h2><Link className="button button-gold" href="/contact">{t("consult")}<ArrowUpRight size={15} /></Link></section>
  </main>;
}
