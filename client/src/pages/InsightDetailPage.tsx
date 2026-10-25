import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { BackToInsights, HeroVisual, LanguageNote, Reveal } from "@/components/PageParts";
import InsightCard from "@/components/InsightCard";
import { Carousel } from "@/components/Slider";
import { insightBySlug, insights } from "@/content/legalContent";
import { body, dateFor, loc, photoNameFor } from "@/content/insightsI18n";
import { X } from "@/content/ui2";
import { UI } from "@/lib/i18n";
import NotFound from "./NotFound";

export default function InsightDetailPage() {
  const [, params] = useRoute<{ slug: string }>("/insights/:slug");
  const article = insightBySlug(params?.slug || "");
  const { locale } = useLanguage();
  if (!article) return <NotFound />;
  const v = loc(article, locale); const b = body(article, locale);
  const others = insights.filter(p => p.slug !== article.slug);
  return <main className="route-page insight-detail">
    <div className="page-width detail-top">
      <div className="detail-header">
        <BackToInsights />
        <span className="section-kicker">{v.category} · {article.accent}</span>
        <h1>{v.title}</h1>
        <p className="detail-deck">{v.deck}</p>
        <div className="detail-meta"><span><Clock3 size={15} />{v.read}</span><span><BookOpen size={15} />{dateFor(article, locale)}</span><LanguageNote /></div>
      </div>
      <div className="hero-anchor" data-scene-anchor aria-hidden="true" />
      <HeroVisual image={photoNameFor(article)} compact />
    </div>
    <div className="page-width detail-layout">
      <article className="article-body">
        {b.paragraphs.map((paragraph, index) => <Reveal key={paragraph}><p className={index === 0 ? "lead-paragraph" : ""}>{paragraph}</p></Reveal>)}
        <Reveal><div className="article-points"><span className="section-kicker">{X.keyPoints[locale]}</span>{b.points.map(point => <div key={point}><i />{point}</div>)}</div></Reveal>
        <Reveal><div className="article-caveat"><strong>{X.eduNote[locale]}</strong><p>{b.caveat}</p></div></Reveal>
        <Reveal><div className="article-sources"><span className="section-kicker">{X.sources[locale]}</span>{article.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={14} /></a>)}</div></Reveal>
      </article>
      <aside className="article-aside"><span>SN / LAW</span><div className="aside-rule" /><p>{UI.footer[locale]}</p><Link className="button button-outline" href="/contact">{X.discuss[locale]}<ArrowUpRight size={16} /></Link></aside>
    </div>
    {others.length > 0 && <section className="page-width more-articles"><div className="section-heading"><span className="section-kicker">{X.moreArticles[locale]}</span><h2>{X.allArticles[locale]}</h2></div><Carousel perView={{ base: 1, md: 2, lg: 3 }} gap={22}>{others.map((p, n) => <InsightCard key={p.slug} p={p} locale={locale} n={n} />)}</Carousel></section>}
  </main>;
}
