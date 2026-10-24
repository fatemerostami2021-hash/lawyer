import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useLanguage } from "@/components/SiteChrome";
import { AREAS, FAQS, UI } from "@/lib/i18n";
import { insights } from "@/content/legalContent";

export default function HomePage() {
  const { locale, openSearch } = useLanguage();
  const t = (k: keyof typeof UI) => UI[k][locale];
  const [q, setQ] = useState("");
  const chips = t("heroChips").split("|");
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

    <section className="photo-band page-width">
      {([["office", "imgOffice"], ["gold-scales", "imgScales"], ["themis", "imgThemis"]] as const).map(([img, cap], n) => (
        <figure key={img} className={`photo photo-${n}`} data-tilt><div className="image-frame mm-layer" data-depth="6"><img src={`/assets/photos/${img}.webp`} alt={t(cap)} loading="lazy" /></div><figcaption className="mm-layer" data-depth="10">{t(cap)}</figcaption></figure>
      ))}
    </section>

    <section className="areas-section page-width">
      <div className="section-heading"><span className="section-kicker">{t("expertise")}</span><h2>{t("heroTitle")}</h2></div>
      <div className="area-grid">{AREAS.map((a, n) => <Link key={a.id} href="/expertise" className="area-card"><span className="area-no mm-layer" data-depth="8">{String(n + 1).padStart(2, "0")}</span><h3 className="mm-layer" data-depth="5">{a.title[locale]}</h3><p>{a.body[locale]}</p><ArrowUpRight size={18} /></Link>)}</div>
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
