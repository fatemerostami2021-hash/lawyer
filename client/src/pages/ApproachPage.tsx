import { ArrowUpRight, Eye, Layers3, MoveRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { PageIntro, Reveal } from "@/components/PageParts";

const steps = [
  { number: "01", icon: Eye, title: "Understand", fa: "درک", body: "We map the commercial objective, the legal context and the decisions that sit beneath the brief.", bodyFa: "هدف تجاری، زمینه حقوقی و تصمیم‌های پشت درخواست را ترسیم می‌کنیم." },
  { number: "02", icon: Layers3, title: "Structure", fa: "ساختار", body: "We create a focused legal route, bringing clarity to risk, rights, obligations and timing.", bodyFa: "مسیری حقوقی و متمرکز می‌سازیم و ریسک، حقوق، تعهدات و زمان‌بندی را روشن می‌کنیم." },
  { number: "03", icon: MoveRight, title: "Execute", fa: "اجرا", body: "We stay close to implementation so the advice holds when strategy meets reality.", bodyFa: "به پیاده‌سازی نزدیک می‌مانیم تا مشاوره در برخورد با واقعیت پابرجا باشد." },
];

export default function ApproachPage() { const { locale } = useLanguage(); const fa = locale === "fa"; return <main className="route-page inner-page"><PageIntro index="03" kicker={fa ? "روش سنجیده" : "A measured method"} title={fa ? "درک. ساختار. اجرا." : "Understand. Structure. Execute."}>{fa ? "هر همکاری با شنیدن آغاز می‌شود، با تحلیل منضبط پیش می‌رود و به موضعی ختم می‌شود که بتوانید بر اساس آن اقدام کنید." : "Every engagement begins with listening, moves through disciplined analysis and ends with a position you can act on."}</PageIntro><section className="approach-rail page-width">{steps.map((step, index) => { const Icon = step.icon; return <Reveal key={step.number} className="approach-card"><div className="approach-number">{step.number}</div><Icon size={30} strokeWidth={1.1} /><h2>{fa ? step.fa : step.title}</h2><p>{fa ? step.bodyFa : step.body}</p>{index < 2 && <span className="approach-line" />}</Reveal>; })}</section><section className="approach-note page-width"><span className="section-kicker">{fa ? "اصل همکاری" : "The working principle"}</span><h2>{fa ? "وضوح یک خروجی نیست؛ یک روش کار است." : "Clarity is not only an outcome. It is a way of working."}</h2><Link className="button button-gold" href="/contact">{fa ? "درخواست مشاوره" : "Request a consultation"}<ArrowUpRight size={17} /></Link></section></main>; }
