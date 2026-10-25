import { ArrowUpRight, Eye, Layers3, MoveRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { PageIntro } from "@/components/PageParts";
import ClickCard from "@/components/ClickCard";

const steps = [
  { number: "01", icon: Eye, t: { en: "Understand", fa: "درک", ar: "الفهم" }, b: { en: "We map the commercial objective, the legal context and the decisions that sit beneath the brief.", fa: "هدف تجاری، زمینه حقوقی و تصمیم‌های پشت درخواست را ترسیم می‌کنیم.", ar: "نرسم الهدف التجاري والسياق القانوني والقرارات الكامنة وراء الطلب." }, href: "/faq#first-consultation" },
  { number: "02", icon: Layers3, t: { en: "Structure", fa: "ساختار", ar: "الهيكلة" }, b: { en: "We create a focused legal route, bringing clarity to risk, rights, obligations and timing.", fa: "مسیری حقوقی و متمرکز می‌سازیم و ریسک، حقوق، تعهدات و زمان‌بندی را روشن می‌کنیم.", ar: "ننشئ مساراً قانونياً مركّزاً يوضح المخاطر والحقوق والالتزامات والتوقيت." }, href: "/expertise" },
  { number: "03", icon: MoveRight, t: { en: "Execute", fa: "اجرا", ar: "التنفيذ" }, b: { en: "We stay close to implementation so the advice holds when strategy meets reality.", fa: "به پیاده‌سازی نزدیک می‌مانیم تا مشاوره در برخورد با واقعیت پابرجا باشد.", ar: "نبقى قريبين من التطبيق حتى يصمد الرأي عند اصطدام الاستراتيجية بالواقع." }, href: "/contact" },
];

export default function ApproachPage() {
  const { locale } = useLanguage();
  const L = (en: string, fa: string, ar: string) => (locale === "fa" ? fa : locale === "ar" ? ar : en);
  return <main className="route-page inner-page">
    <PageIntro image="meeting" index="03" kicker={L("A measured method", "روش سنجیده", "منهج مدروس")} title={L("Understand. Structure. Execute.", "درک. ساختار. اجرا.", "افهم. هيكل. نفّذ.")}>
      {L("Every engagement begins with listening, moves through disciplined analysis and ends with a position you can act on.", "هر همکاری با شنیدن آغاز می‌شود، با تحلیل منضبط پیش می‌رود و به موضعی ختم می‌شود که بتوانید بر اساس آن اقدام کنید.", "يبدأ كل تعاون بالإصغاء، ويمر بتحليل منضبط، وينتهي بموقف يمكنك التصرف على أساسه.")}
    </PageIntro>
    <section className="approach-rail page-width">{steps.map((s, index) => { const Icon = s.icon; return (
      <ClickCard key={s.number} href={s.href} className="approach-card" tilt>
        <div className="approach-number">{s.number}</div><Icon size={30} strokeWidth={1.1} /><h2>{s.t[locale]}</h2><p>{s.b[locale]}</p>{index < 2 && <span className="approach-line" />}
      </ClickCard>); })}</section>
    <section className="approach-note page-width"><span className="section-kicker">{L("The working principle", "اصل همکاری", "مبدأ العمل")}</span><h2>{L("Clarity is not only an outcome. It is a way of working.", "وضوح یک خروجی نیست؛ یک روش کار است.", "الوضوح ليس نتيجة فقط، بل أسلوب عمل.")}</h2><Link className="button button-gold" href="/contact">{L("Request a consultation", "درخواست مشاوره", "طلب استشارة")}<ArrowUpRight size={17} /></Link></section>
  </main>;
}
