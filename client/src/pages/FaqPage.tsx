import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/SiteChrome";
import { PageIntro } from "@/components/PageParts";
import { FAQS, UI } from "@/lib/i18n";

export default function FaqPage() {
  const { locale, openSearch } = useLanguage();
  const [open, setOpen] = useState<string | null>(typeof location !== "undefined" ? location.hash.slice(1) || FAQS[0].id : FAQS[0].id);
  useEffect(() => { const h = location.hash.slice(1); if (h) { setOpen(h); setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: "smooth", block: "center" }), 400); } }, []);
  return <main className="route-page inner-page">
    <PageIntro index="05" kicker={UI.faq[locale]} title={UI.faqTitle[locale]}>{UI.disclaimer[locale]}</PageIntro>
    <section className="faq-wrap page-width">
      <button type="button" className="faq-search" onClick={() => openSearch()}>{UI.searchPh[locale]}</button>
      {FAQS.map(f => <div key={f.id} id={f.id} className={`faq-row ${open === f.id ? "open" : ""}`}>
        <button type="button" className="faq-q" onClick={() => setOpen(open === f.id ? null : f.id)} aria-expanded={open === f.id}><span>{f.q[locale]}</span><Plus size={20} /></button>
        <div className="faq-a"><p>{f.a[locale]}</p></div>
      </div>)}
    </section>
  </main>;
}
