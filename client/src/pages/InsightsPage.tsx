import { useMemo, useRef, useState } from "react";
import { ArrowDown, Search } from "lucide-react";
import { TeamTips } from "@/components/TeamSection";
import { useLanguage } from "@/components/SiteChrome";
import { LanguageNote } from "@/components/PageParts";
import InsightCard from "@/components/InsightCard";
import { FadeSlider, type Slide } from "@/components/Slider";
import { insights } from "@/content/legalContent";
import { CAT, loc, matches, photoFor } from "@/content/insightsI18n";
import { X } from "@/content/ui2";
import { UI } from "@/lib/i18n";

export default function InsightsPage() {
  const { locale } = useLanguage();
  const categories = ["All", ...Array.from(new Set(insights.map(item => String(item.category))))];
  const fromUrl = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("cat") : null;
  const [filter, setFilter] = useState(fromUrl && categories.includes(fromUrl) ? fromUrl : "All");
  const [q, setQ] = useState("");
  const listRef = useRef<HTMLElement>(null);
  const visible = useMemo(() => insights.filter(p => (filter === "All" || p.category === filter) && matches(p, q, locale)), [filter, q, locale]);
  const label = (c: string) => (c === "All" ? UI.all[locale] : (CAT[c]?.[locale] ?? c));
  const toList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const slides: Slide[] = insights.slice(0, 5).map((p, n) => { const v = loc(p, locale); return { img: photoFor(p, n), kicker: v.category, title: v.title, text: v.deck, href: `/insights/${p.slug}`, cta: X.readArticle[locale] }; });

  return <main className="route-page inner-page insights-page">
    <section className="blog-hero-wrap page-width">
      <FadeSlider slides={slides} autoplay={6500} className="blog-hero">
        <div className="blog-hero-copy">
          <span className="section-kicker">{X.blogHeroKicker[locale]}</span>
          <h1>{X.blogHeroTitle[locale]}</h1>
          <p>{X.blogHeroSub[locale]}</p>
          <form className="hero-search" onSubmit={e => { e.preventDefault(); toList(); }}><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={X.searchArticles[locale]} /><button type="submit" className="button button-gold">{UI.search[locale]}</button></form>
          <button type="button" className="blog-start" onClick={toList}><span>{X.startReading[locale]}</span><ArrowDown size={16} /></button>
        </div>
      </FadeSlider>
    </section>

    <section className="insights-toolbar page-width" ref={listRef}>
      <LanguageNote />
      <div className="insights-filter"><Search size={15} />{categories.map(c => <button key={c} type="button" className={filter === c ? "active" : ""} onClick={() => setFilter(c)}>{label(c)}</button>)}</div>
      <span className="insights-count">{visible.length} {X.articlesCount[locale]}</span>
    </section>

    <section className="insights-grid page-width">
      {visible.map((p, n) => <InsightCard key={p.slug} p={p} locale={locale} n={n} />)}
      {visible.length === 0 && <p className="insights-empty">{X.noArticles[locale]}</p>}
    </section>
    <TeamTips />
  </main>;
}
