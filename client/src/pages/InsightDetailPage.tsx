import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { BackToInsights, LanguageNote, Reveal } from "@/components/PageParts";
import { insightBySlug } from "@/content/legalContent";
import NotFound from "./NotFound";

export default function InsightDetailPage() {
  const [, params] = useRoute<{ slug: string }>("/insights/:slug");
  const article = insightBySlug(params?.slug || "");
  const { locale } = useLanguage(); const fa = locale === "fa";
  if (!article) return <NotFound />;
  return <main className="route-page insight-detail"><div className="page-width detail-header"><BackToInsights /><span className="section-kicker">{article.category} · {article.accent}</span><h1>{fa ? article.titleFa : article.title}</h1><p className="detail-deck">{article.deck}</p><div className="detail-meta"><span><Clock3 size={15} />{article.readTime}</span><span><BookOpen size={15} />{article.date}</span><LanguageNote /></div></div><div className="page-width detail-layout"><article className="article-body">{article.paragraphs.map((paragraph, index) => <Reveal key={paragraph}><p className={index === 0 ? "lead-paragraph" : ""}>{paragraph}</p></Reveal>)}<Reveal><div className="article-points"><span className="section-kicker">Key points</span>{article.points.map(point => <div key={point}><i />{point}</div>)}</div></Reveal><Reveal><div className="article-caveat"><strong>Educational note</strong><p>{article.caveat}</p></div></Reveal><Reveal><div className="article-sources"><span className="section-kicker">Sources</span>{article.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={14} /></a>)}</div></Reveal></article><aside className="article-aside"><span>SN / LAW</span><div className="aside-rule" /><p>Corporate & Commercial Law in Iran</p><Link className="button button-outline" href="/contact">Discuss a question<ArrowUpRight size={16} /></Link></aside></div></main>;
}
