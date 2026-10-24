import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { PageIntro } from "@/components/PageParts";
import { AREAS, TYPES, UI, type AreaType } from "@/lib/i18n";

export default function ExpertisePage() {
  const { locale } = useLanguage();
  const [type, setType] = useState<AreaType | "all">("all");
  const list = useMemo(() => AREAS.filter(a => type === "all" || a.type === type), [type]);
  return <main className="route-page inner-page">
    <PageIntro image="office" index="02" kicker={UI.expertise[locale]} title={UI.heroTitle[locale]}>{UI.heroSub[locale]}</PageIntro>
    <section className="filter-bar page-width"><span>{UI.filterTitle[locale]}</span>
      {(["all", "advisory", "transactions", "disputes"] as const).map(k => <button key={k} type="button" className={type === k ? "active" : ""} onClick={() => setType(k)}>{k === "all" ? UI.all[locale] : TYPES[k][locale]}</button>)}
    </section>
    <section className="area-grid page-width">{list.map((a, n) => <Link key={a.id} href="/contact" className="area-card"><span className="area-no mm-layer" data-depth="8">{String(n + 1).padStart(2, "0")}</span><small className="area-type">{TYPES[a.type][locale]}</small><h3 className="mm-layer" data-depth="5">{a.title[locale]}</h3><p>{a.body[locale]}</p><ArrowUpRight size={18} /></Link>)}</section>
  </main>;
}
