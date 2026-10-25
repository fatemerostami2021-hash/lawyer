import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { PageIntro } from "@/components/PageParts";
import ClickCard from "@/components/ClickCard";
import { AREAS, TYPES, UI, type AreaType } from "@/lib/i18n";
import { AREA_CAT, X } from "@/content/ui2";

export default function ExpertisePage() {
  const { locale } = useLanguage();
  const [type, setType] = useState<AreaType | "all">("all");
  const list = useMemo(() => AREAS.filter(a => type === "all" || a.type === type), [type]);
  useEffect(() => { const h = window.location.hash.slice(1); if (h) setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: "smooth", block: "center" }), 500); }, []);
  return <main className="route-page inner-page">
    <PageIntro image="office" index="02" kicker={UI.expertise[locale]} title={UI.heroTitle[locale]}>{UI.heroSub[locale]}</PageIntro>
    <section className="filter-bar page-width"><span>{UI.filterTitle[locale]}</span>
      {(["all", "advisory", "transactions", "disputes"] as const).map(k => <button key={k} type="button" className={type === k ? "active" : ""} onClick={() => setType(k)}>{k === "all" ? UI.all[locale] : TYPES[k][locale]}</button>)}
    </section>
    <section className="area-grid page-width">{list.map((a, n) => (
      <ClickCard key={a.id} id={a.id} href={`/insights?cat=${encodeURIComponent(AREA_CAT[a.id])}`} className="area-card" tilt>
        <span className="area-no mm-layer" data-depth="8">{String(n + 1).padStart(2, "0")}</span>
        <small className="area-type">{TYPES[a.type][locale]}</small>
        <h3 className="mm-layer" data-depth="5">{a.title[locale]}</h3>
        <p>{a.body[locale]}</p>
        <span className="area-actions"><Link className="gold-link" href={`/insights?cat=${encodeURIComponent(AREA_CAT[a.id])}`}>{X.relatedArticles[locale]}<ArrowUpRight size={15} /></Link><Link className="gold-link" href="/contact">{UI.consult[locale]}<ArrowUpRight size={15} /></Link></span>
      </ClickCard>))}
    </section>
  </main>;
}
