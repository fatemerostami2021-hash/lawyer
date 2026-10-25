import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { loc, photoFor, type Insight } from "@/content/insightsI18n";

export default function InsightCard({ p, locale, n = 0 }: { p: Insight; locale: Locale; n?: number }) {
  const v = loc(p, locale);
  return (
    <Link href={`/insights/${p.slug}`} className="insight-card ic">
      <span className="ic-img"><img src={photoFor(p, n)} alt="" loading="lazy" /></span>
      <span className="ic-body">
        <span className="ic-meta"><b>{p.accent}</b><i>{v.category}</i></span>
        <h3>{v.title}</h3>
        <p>{v.deck}</p>
        <span className="ic-foot"><em>{v.read}</em><ArrowUpRight size={17} /></span>
      </span>
    </Link>
  );
}
