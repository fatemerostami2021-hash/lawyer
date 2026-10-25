import { Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/SiteChrome";
import { PageIntro, Reveal, GoldLink } from "@/components/PageParts";
import ClickCard from "@/components/ClickCard";

export default function AboutPage() {
  const { locale } = useLanguage();
  const L = (en: string, fa: string, ar: string) => (locale === "fa" ? fa : locale === "ar" ? ar : en);
  return <main className="route-page inner-page">
    <PageIntro image="themis" index="01"
      kicker={L("The practice", "درباره مجموعه", "عن المكتب")}
      title={L("Law is valuable when it makes the route clearer.", "قانون، وقتی ارزشمند است که مسیر را روشن کند.", "القانون يكتسب قيمته عندما يوضح الطريق.")}>
      {L("Sobhan Nikseresht Law is a focused practice for companies, founders, investors and international partners navigating corporate and commercial questions in Iran.",
        "دفتر حقوقی سبحان نیک‌سرشت مجموعه‌ای متمرکز بر حقوق شرکت‌ها و تجارت در ایران است؛ برای بنیان‌گذاران، سرمایه‌گذاران، شرکت‌ها و شرکای بین‌المللی.",
        "مكتب سبحان نيك سرشت للمحاماة مكتب متخصص في قانون الشركات والتجارة في إيران، يخدم المؤسسين والمستثمرين والشركات والشركاء الدوليين.")}
    </PageIntro>
    <section className="content-split page-width">
      <Reveal className="content-lead"><span className="section-kicker">{L("Our position", "موضع ما", "موقفنا")}</span><h2>{L("Precise. Considered. International.", "دقیق، متین، بین‌المللی.", "دقيق. متزن. دولي.")}</h2></Reveal>
      <Reveal className="content-body">
        <p>{L("We do not begin with generic answers. We build the structure of the decision. Every engagement starts by understanding the commercial objective, mapping the legal context and identifying what must be clear before execution.",
          "ما به جای پاسخ‌های کلی، ساختار تصمیم را می‌سازیم. هر همکاری با فهم هدف تجاری، نقشه‌برداری از زمینه حقوقی و شناسایی نقاطی که باید پیش از اجرا روشن شوند آغاز می‌شود.",
          "لا نبدأ بإجابات عامة، بل نبني هيكل القرار. يبدأ كل تعاون بفهم الهدف التجاري ورسم السياق القانوني وتحديد ما يجب توضيحه قبل التنفيذ.")}</p>
        <p>{L("Rooted in Iran and ready for international conversation, our aim is to turn complexity into a position you can act on—with discretion, precision and attention to detail.",
          "ریشه‌دار در ایران و آماده برای گفت‌وگوی بین‌المللی، هدف ما تبدیل پیچیدگی به یک موضع قابل اقدام است؛ با محرمانگی، دقت و توجه به جزئیات.",
          "نحن متجذرون في إيران ومنفتحون على الحوار الدولي، وهدفنا تحويل التعقيد إلى موقف يمكنك البناء عليه، بسرية ودقة وعناية بالتفاصيل.")}</p>
        <GoldLink href="/approach">{L("Our approach", "رویکرد ما", "منهجيتنا")}</GoldLink>
      </Reveal>
    </section>
    <section className="principles-band"><div className="page-width principle-grid">
      <ClickCard href="/faq#confidentiality" className="principle"><ShieldCheck /><strong>{L("Discretion", "محرمانگی", "السرية")}</strong><span>{L("Every conversation respects the sensitivity of the decision.", "هر گفت‌وگو با احترام به حساسیت تصمیم آغاز می‌شود.", "كل محادثة تبدأ باحترام حساسية القرار.")}</span></ClickCard>
      <ClickCard href="/approach" className="principle"><Sparkles /><strong>{L("Clarity", "وضوح", "الوضوح")}</strong><span>{L("We translate complexity into a position you can use.", "پیچیدگی را به زبان قابل تصمیم‌گیری تبدیل می‌کنیم.", "نحوّل التعقيد إلى لغة تصلح لاتخاذ القرار.")}</span></ClickCard>
      <ClickCard href="/expertise" className="principle"><Globe2 /><strong>{L("Perspective", "چشم‌انداز", "المنظور")}</strong><span>{L("We read Iran through a commercial and international lens.", "ایران را با نگاه تجاری و بین‌المللی می‌خوانیم.", "نقرأ إيران بعين تجارية ودولية.")}</span></ClickCard>
    </div></section>
    <section className="closing-panel page-width"><span className="section-kicker">{L("The next conversation", "گفت‌وگوی بعدی", "المحادثة التالية")}</span><h2>{L("Bring the question. Continue from a clearer position.", "سؤال را مطرح کنید؛ از جایی روشن‌تر ادامه دهید.", "اطرح السؤال، وانطلق من موقف أوضح.")}</h2><Link className="button button-gold" href="/contact">{L("Start a conversation", "شروع گفت‌وگو", "ابدأ المحادثة")}</Link></section>
  </main>;
}
