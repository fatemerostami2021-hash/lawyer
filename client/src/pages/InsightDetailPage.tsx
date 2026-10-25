import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { BackToInsights, Reveal } from "@/components/PageParts";
import InsightCard from "@/components/InsightCard";
import AnimatedScaleMark from "@/components/AnimatedScaleMark";
import { insightBySlug, insights } from "@/content/legalContent";
import { loc, photoFor } from "@/content/insightsI18n";
import { ART_UI, articleBody, dateLabel } from "@/content/articleI18n";
import { X } from "@/content/ui2";
import NotFound from "./NotFound";

export default function InsightDetailPage() {
  const [, params] = useRoute<{ slug: string }>("/insights/:slug");
  const article = insightBySlug(params?.slug || "");
  const { locale } = useLanguage();
  if (!article) return <NotFound />;
  const v = loc(article, locale);
  const b = articleBody(article, locale);
  const related = insights.filter(i => i.slug !== article.slug).slice(0, 3);
  return <main className="route-page insight-detail">
    <div className="page-width detail-header">
      <BackToInsights />
      <span className="section-kicker">{v.category} · {article.accent}</span>
      <h1>{v.title}</h1>
      <p className="detail-deck">{v.deck}</p>
      <div className="detail-meta"><span><Clock3 size={15} />{v.read}</span><span><BookOpen size={15} />{dateLabel(locale)}</span></div>
    </div>
    <figure className="page-width detail-photo"><div className="image-frame"><img src={photoFor(article)} alt="" loading="eager" /></div></figure>
    <div className="page-width detail-layout">
      <article className="article-body">
        {b.paragraphs.map((paragraph, index) => <Reveal key={index}><p className={index === 0 ? "lead-paragraph" : ""}>{paragraph}</p></Reveal>)}
        <Reveal><div className="article-points"><span className="section-kicker">{ART_UI.keyPoints[locale]}</span>{b.points.map(point => <div key={point}><i />{point}</div>)}</div></Reveal>
        <Reveal><div className="article-caveat"><strong>{ART_UI.note[locale]}</strong><p>{b.caveat}</p></div></Reveal>
        <Reveal><div className="article-sources"><span className="section-kicker">{ART_UI.sources[locale]}</span>{article.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" dir="ltr">{source.title}<ArrowUpRight size={14} /></a>)}<small>{ART_UI.sourcesNote[locale]}</small></div></Reveal>
      </article>
      <aside className="article-aside"><span className="aside-mark"><AnimatedScaleMark /></span><span>SN / LAW</span><div className="aside-rule" /><p>{ART_UI.tagline[locale]}</p><Link className="button button-outline" href="/contact">{ART_UI.discuss[locale]}<ArrowUpRight size={16} /></Link></aside>
    </div>
    <section className="page-width related-posts"><div className="section-heading"><span className="section-kicker">{X.relatedArticles[locale]}</span></div><div className="insights-grid-inner">{related.map((p, n) => <InsightCard key={p.slug} p={p} locale={locale} n={n} />)}</div></section>
  </main>;
}
