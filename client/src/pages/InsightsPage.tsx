import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { PageIntro, Reveal, LanguageNote } from "@/components/PageParts";
import { insights } from "@/content/legalContent";

export default function InsightsPage() {
  const { locale } = useLanguage(); const fa = locale === "fa";
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(insights.map(item => item.category)))];
  const visible = useMemo(() => filter === "All" ? insights : insights.filter(item => item.category === filter), [filter]);
  return <main className="route-page inner-page"><PageIntro index="04" kicker={fa ? "بینش حقوقی" : "Legal insights"} title={fa ? "نوشتن برای تصمیم‌های روشن‌تر." : "Writing for clearer decisions."}>{fa ? "مقالات آموزشی درباره حقوق شرکت‌ها، قراردادها، سرمایه‌گذاری، داوری و مالکیت فکری در ایران." : "Educational writing on corporate law, contracts, investment, arbitration and intellectual property in Iran."}</PageIntro><section className="insights-toolbar page-width"><LanguageNote /><div className="insights-filter"><Search size={15} />{categories.map(category => <button key={category} type="button" className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div></section><section className="insights-grid page-width">{visible.map((item, index) => <Reveal key={item.slug} className="insight-card-wrap"><Link className="insight-card" href={`/insights/${item.slug}`}><div className="insight-card-top"><span>{item.accent}</span><span>{item.category}</span></div><div className="insight-card-symbol">◌</div><h2>{fa ? item.titleFa : item.title}</h2><p>{item.deck}</p><div className="insight-card-bottom"><span>{item.readTime}</span><ArrowUpRight size={17} /></div></Link></Reveal>)}</section></main>;
}
