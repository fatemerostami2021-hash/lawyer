import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "./SiteChrome";
import ClickCard from "./ClickCard";
import { Carousel } from "./Slider";
import { RESOURCES, TEAM, TEAM_UI } from "@/content/team";

export function TeamSection() {
  const { locale } = useLanguage();
  return (
    <section className="team-section page-width">
      <div className="section-heading"><span className="section-kicker">{TEAM_UI.kicker[locale]}</span><h2>{TEAM_UI.title[locale]}</h2></div>
      <Carousel perView={{ base: 1, md: 2, lg: 4 }} gap={20} autoplay={6000}>
        {TEAM.map(m => (
          <ClickCard key={m.id} href="/about" className="team-card" tilt>
            <div className="team-avatar mm-layer" data-depth="8">{m.initials}</div>
            <h3>{m.name[locale]}</h3>
            <strong>{m.role[locale]}</strong>
            <p>{m.intro[locale]}</p>
            <ul>{m.branches[locale].map(b => <li key={b}>{b}</li>)}</ul>
          </ClickCard>
        ))}
      </Carousel>
      <div className="resources">
        <span className="section-kicker">{TEAM_UI.resources[locale]}</span>
        <div className="resource-grid">
          {RESOURCES.map(r => <a key={r.href} href={r.href} target="_blank" rel="noreferrer noopener" className="resource-card"><strong>{r.name[locale]}<ArrowUpRight size={15} /></strong><small>{r.desc[locale]}</small></a>)}
        </div>
      </div>
    </section>
  );
}

export function TeamTips() {
  const { locale } = useLanguage();
  return (
    <section className="team-tips page-width">
      <div className="section-heading"><span className="section-kicker">{TEAM_UI.kicker[locale]}</span><h2>{TEAM_UI.tipsTitle[locale]}</h2></div>
      <Carousel perView={{ base: 1, md: 2, lg: 4 }} gap={18} autoplay={7000}>
        {TEAM.map(m => <ClickCard key={m.id} href="/contact" className="tip-card" tilt><span className="tip-by"><i>{m.initials}</i>{m.name[locale]} · {m.role[locale]}</span><p>{m.tip[locale]}</p></ClickCard>)}
      </Carousel>
    </section>
  );
}
