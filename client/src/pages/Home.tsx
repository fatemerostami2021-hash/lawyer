import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Menu,
  MoveDown,
  Phone,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { SITE } from "@/lib/site";

type Locale = "en" | "fa" | "ar";

type Copy = {
  nav: { about: string; expertise: string; approach: string; contact: string };
  ui: { menu: string; close: string; language: string; submit: string; success: string };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    primary: string;
    secondary: string;
    scroll: string;
    visualNote: string;
  };
  trust: { items: { value: string; label: string }[] };
  about: { kicker: string; title: string; body: string; link: string; quote: string };
  expertise: {
    kicker: string;
    title: string;
    body: string;
    cards: { number: string; title: string; body: string; tag: string }[];
  };
  approach: {
    kicker: string;
    title: string;
    body: string;
    steps: { number: string; title: string; body: string }[];
  };
  contact: {
    kicker: string;
    title: string;
    body: string;
    name: string;
    contact: string;
    brief: string;
    placeholderName: string;
    placeholderContact: string;
    placeholderBrief: string;
    submit: string;
    note: string;
    success: string;
  };
  footer: { line: string; contact: string; placeholder: string };
};

const copies: Record<Locale, Copy> = {
  en: {
    nav: { about: "About", expertise: "Expertise", approach: "Approach", contact: "Contact" },
    ui: { menu: "Open menu", close: "Close menu", language: "Language", submit: "Submit", success: "Thank you" },
    hero: {
      eyebrow: "Corporate & Commercial Law · Iran",
      title: "Clarity for decisions",
      accent: "that carry weight.",
      description:
        "Strategic counsel for companies, investors and founders navigating Iran’s corporate and commercial landscape.",
      primary: "Request a consultation",
      secondary: "Explore our perspective",
      scroll: "Scroll to explore",
      visualNote: "A considered position",
    },
    trust: {
      items: [
        { value: "01", label: "Corporate Counsel" },
        { value: "02", label: "Cross-border Perspective" },
        { value: "03", label: "Discreet by Design" },
      ],
    },
    about: {
      kicker: "The practice",
      title: "Law is structure. Counsel is perspective.",
      body:
        "Sobhan Nikseresht Law advises clients at the point where commercial ambition meets legal consequence. We turn complexity into an intelligible path forward—rooted in Iran, shaped for an international audience.",
      link: "Discover the practice",
      quote: "For important decisions, clarity is an advantage.",
    },
    expertise: {
      kicker: "Where we add clarity",
      title: "Built for the moments that matter.",
      body:
        "Focused advice for the legal architecture behind growth, transactions and durable commercial relationships.",
      cards: [
        { number: "01", title: "Corporate Structuring", body: "Entity design, governance and strategic restructuring for businesses operating in or entering Iran.", tag: "Structure" },
        { number: "02", title: "Commercial Contracts", body: "Precise agreements that protect relationships, allocate risk and keep execution moving.", tag: "Execute" },
        { number: "03", title: "Market Entry in Iran", body: "A clear route through local requirements, partners, investment questions and commercial opportunity.", tag: "Perspective" },
      ],
    },
    approach: {
      kicker: "A measured method",
      title: "Understand. Structure. Execute.",
      body: "Every engagement begins with listening, moves through disciplined analysis and ends with a position you can act on.",
      steps: [
        { number: "01", title: "Understand", body: "We map the commercial objective, the legal context and the decisions that sit beneath the brief." },
        { number: "02", title: "Structure", body: "We create a focused legal route, bringing clarity to risk, rights, obligations and timing." },
        { number: "03", title: "Execute", body: "We stay close to implementation so the advice holds when the strategy meets reality." },
      ],
    },
    contact: {
      kicker: "Start a conversation",
      title: "Bring the question. Leave with a clearer position.",
      body: "Tell us, in confidence, what you are considering. We will respond using the contact details you provide.",
      name: "Your name",
      contact: "Email or phone",
      brief: "A short description",
      placeholderName: "Name",
      placeholderContact: "contact@example.com",
      placeholderBrief: "What would you like to discuss?",
      submit: "Request a consultation",
      note: "Confidential, direct and considered.",
      success: "Your request has been noted. We will be in touch shortly.",
    },
    footer: { line: "Corporate & Commercial Law in Iran", contact: "Contact", placeholder: "Contact details coming soon" },
  },
  fa: {
    nav: { about: "درباره ما", expertise: "حوزه‌های تخصصی", approach: "رویکرد", contact: "تماس" },
    ui: { menu: "باز کردن منو", close: "بستن منو", language: "زبان", submit: "ارسال", success: "متشکریم" },
    hero: {
      eyebrow: "حقوق شرکت‌ها و تجارت · ایران",
      title: "شفافیت برای تصمیم‌هایی",
      accent: "که اهمیت دارند.",
      description: "مشاوره راهبردی برای شرکت‌ها، سرمایه‌گذاران و بنیان‌گذارانی که در فضای حقوق شرکت‌ها و تجارت ایران فعالیت می‌کنند.",
      primary: "درخواست مشاوره",
      secondary: "آشنایی با رویکرد ما",
      scroll: "برای ادامه اسکرول کنید",
      visualNote: "یک موضع سنجیده",
    },
    trust: { items: [{ value: "۰۱", label: "مشاوره شرکتی" }, { value: "۰۲", label: "نگاه فرامرزی" }, { value: "۰۳", label: "محرمانگی در طراحی" }] },
    about: {
      kicker: "درباره این مجموعه",
      title: "حقوق، ساختار است؛ مشاوره، نگاه است.",
      body: "دفتر حقوقی سبحان نیکسرشت در نقطه‌ای همراه مشتریان است که جاه‌طلبی تجاری با پیامد حقوقی تلاقی می‌کند. ما پیچیدگی را به مسیری روشن و قابل تصمیم‌گیری تبدیل می‌کنیم؛ ریشه‌دار در ایران و طراحی‌شده برای مخاطب بین‌المللی.",
      link: "آشنایی با مجموعه",
      quote: "برای تصمیم‌های مهم، وضوح یک مزیت است.",
    },
    expertise: {
      kicker: "جایی که وضوح می‌آفرینیم",
      title: "برای لحظه‌هایی که اهمیت دارند.",
      body: "مشاوره متمرکز برای معماری حقوقی رشد، معاملات و روابط تجاری پایدار.",
      cards: [
        { number: "۰۱", title: "ساختاردهی شرکتی", body: "طراحی ساختار، حاکمیت و بازطراحی راهبردی برای کسب‌وکارهای فعال یا ورودی به ایران.", tag: "ساختار" },
        { number: "۰۲", title: "قراردادهای تجاری", body: "توافق‌های دقیق برای حفاظت از روابط، تخصیص ریسک و پیشبرد مطمئن اجرا.", tag: "اجرا" },
        { number: "۰۳", title: "ورود به بازار ایران", body: "مسیری روشن از میان الزامات محلی، شرکا، سرمایه‌گذاری و فرصت‌های تجاری.", tag: "نگاه" },
      ],
    },
    approach: {
      kicker: "روش سنجیده",
      title: "درک. ساختار. اجرا.",
      body: "هر همکاری با شنیدن آغاز می‌شود، با تحلیل منضبط پیش می‌رود و به موضعی ختم می‌شود که بتوانید بر اساس آن اقدام کنید.",
      steps: [
        { number: "۰۱", title: "درک", body: "هدف تجاری، زمینه حقوقی و تصمیم‌های پشت درخواست را ترسیم می‌کنیم." },
        { number: "۰۲", title: "ساختار", body: "مسیری حقوقی و متمرکز می‌سازیم و ریسک، حقوق، تعهدات و زمان‌بندی را روشن می‌کنیم." },
        { number: "۰۳", title: "اجرا", body: "به پیاده‌سازی نزدیک می‌مانیم تا مشاوره در برخورد با واقعیت هم پابرجا باشد." },
      ],
    },
    contact: {
      kicker: "شروع یک گفت‌وگو",
      title: "سؤال را مطرح کنید؛ با موضعی روشن‌تر خارج شوید.",
      body: "آنچه را در ذهن دارید، محرمانه با ما در میان بگذارید. با اطلاعات تماسی که ثبت می‌کنید پاسخ خواهیم داد.",
      name: "نام شما",
      contact: "ایمیل یا شماره تماس",
      brief: "شرح کوتاه",
      placeholderName: "نام",
      placeholderContact: "contact@example.com",
      placeholderBrief: "درباره چه موضوعی مایل به گفت‌وگو هستید؟",
      submit: "درخواست مشاوره",
      note: "محرمانه، مستقیم و سنجیده.",
      success: "درخواست شما ثبت شد. به‌زودی با شما تماس می‌گیریم.",
    },
    footer: { line: "حقوق شرکت‌ها و تجارت در ایران", contact: "تماس", placeholder: "اطلاعات تماس به‌زودی اعلام می‌شود" },
  },
  ar: {
    nav: { about: "عن المكتب", expertise: "مجالات الخبرة", approach: "منهجيتنا", contact: "تواصل" },
    ui: { menu: "فتح القائمة", close: "إغلاق القائمة", language: "اللغة", submit: "إرسال", success: "شكراً" },
    hero: {
      eyebrow: "قانون الشركات والتجارة · إيران",
      title: "وضوح لقرارات",
      accent: "تصنع الفرق.",
      description: "استشارات استراتيجية للشركات والمستثمرين والمؤسسين في المشهد التجاري والقانوني الإيراني.",
      primary: "طلب استشارة",
      secondary: "اكتشف منهجيتنا",
      scroll: "مرّر للاستكشاف",
      visualNote: "موقف مدروس",
    },
    trust: { items: [{ value: "٠١", label: "استشارات الشركات" }, { value: "٠٢", label: "منظور عابر للحدود" }, { value: "٠٣", label: "السرية في التصميم" }] },
    about: {
      kicker: "عن الممارسة",
      title: "القانون هيكل؛ والاستشارة منظور.",
      body: "يقدّم مكتب سبحان نيكسرشت للمحاماة المشورة عند التقاء الطموح التجاري بالنتيجة القانونية. نحوّل التعقيد إلى مسار مفهوم، متجذّر في إيران ومصمم لجمهور دولي.",
      link: "اكتشف الممارسة",
      quote: "في القرارات المهمة، الوضوح ميزة.",
    },
    expertise: {
      kicker: "حيث نضيف الوضوح",
      title: "مصمم للحظات المهمة.",
      body: "مشورة مركّزة للهندسة القانونية للنمو والمعاملات والعلاقات التجارية المستدامة.",
      cards: [
        { number: "٠١", title: "هيكلة الشركات", body: "تصميم الكيانات والحوكمة وإعادة الهيكلة الاستراتيجية للأعمال في إيران أو المتجهة إليها.", tag: "هيكلة" },
        { number: "٠٢", title: "العقود التجارية", body: "اتفاقيات دقيقة تحمي العلاقات وتوزّع المخاطر وتحافظ على سير التنفيذ.", tag: "تنفيذ" },
        { number: "٠٣", title: "دخول السوق الإيراني", body: "طريق واضح عبر المتطلبات المحلية والشركاء والاستثمار والفرص التجارية.", tag: "منظور" },
      ],
    },
    approach: {
      kicker: "منهجية متزنة",
      title: "نفهم. ننظم. ننفذ.",
      body: "تبدأ كل علاقة بالاستماع، ثم التحليل المنضبط، وتنتهي بموقف يمكنك التصرف على أساسه.",
      steps: [
        { number: "٠١", title: "نفهم", body: "نحدد الهدف التجاري والسياق القانوني والقرارات الكامنة وراء الطلب." },
        { number: "٠٢", title: "ننظم", body: "نبني مساراً قانونياً مركزاً يوضح المخاطر والحقوق والالتزامات والتوقيت." },
        { number: "٠٣", title: "ننفذ", body: "نبقى قريبين من التنفيذ حتى تصمد المشورة عندما تلتقي الاستراتيجية بالواقع." },
      ],
    },
    contact: {
      kicker: "ابدأ حواراً",
      title: "اطرح السؤال. غادر بموقف أوضح.",
      body: "شاركنا ما تفكر فيه بسرية. سنجيب باستخدام بيانات التواصل التي تقدمها.",
      name: "اسمك",
      contact: "البريد أو الهاتف",
      brief: "وصف مختصر",
      placeholderName: "الاسم",
      placeholderContact: "contact@example.com",
      placeholderBrief: "ما الموضوع الذي ترغب في مناقشته؟",
      submit: "طلب استشارة",
      note: "بسرية، مباشرة وبعناية.",
      success: "تم تسجيل طلبك. سنتواصل معك قريباً.",
    },
    footer: { line: "قانون الشركات والتجارة في إيران", contact: "تواصل", placeholder: "بيانات التواصل قريباً" },
  },
};

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark-shield">SN</span>
      <span className="brand-mark-line" />
    </span>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const copy = copies[locale];
  const direction = locale === "en" ? "ltr" : "rtl";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [locale]);

  const heroStyle = useMemo(
    () => ({ "--pointer-x": `${pointer.x}px`, "--pointer-y": `${pointer.y}px` }) as CSSProperties,
    [pointer],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x: Number((x * 9).toFixed(2)), y: Number((y * 7).toFixed(2)) });
  };

  const resetPointer = () => setPointer({ x: 0, y: 0 });

  const changeLocale = (next: Locale) => {
    setLocale(next);
    setMenuOpen(false);
    window.setTimeout(() => document.documentElement.lang = next === "en" ? "en" : next, 0);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="site-shell" dir={direction}>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          <a className="brand-lockup" href="#top" aria-label="Sobhan Nikseresht Law home">
            <BrandMark />
            <span className="brand-type">
              <strong>SOBHAN NIKSERESHT</strong>
              <small>LAW</small>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#about">{copy.nav.about}</a>
            <a href="#expertise">{copy.nav.expertise}</a>
            <a href="#approach">{copy.nav.approach}</a>
            <a href="#contact">{copy.nav.contact}</a>
          </nav>

          <div className="header-actions">
            <div className="language-switcher" aria-label={copy.ui.language}>
              {(["en", "fa", "ar"] as Locale[]).map(item => (
                <button key={item} className={locale === item ? "active" : ""} onClick={() => changeLocale(item)} type="button">
                  {item === "en" ? "EN" : item === "fa" ? "فا" : "ع"}
                </button>
              ))}
            </div>
            <a className="header-cta" href="#contact">{copy.nav.contact}<ArrowUpRight size={15} strokeWidth={1.5} /></a>
            <button className="menu-trigger" type="button" aria-label={menuOpen ? copy.ui.close : copy.ui.menu} onClick={() => setMenuOpen(value => !value)}>
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-panel">
            <a href="#about" onClick={() => setMenuOpen(false)}>{copy.nav.about}</a>
            <a href="#expertise" onClick={() => setMenuOpen(false)}>{copy.nav.expertise}</a>
            <a href="#approach" onClick={() => setMenuOpen(false)}>{copy.nav.approach}</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>{copy.nav.contact}</a>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero-section" ref={heroRef} style={heroStyle} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
          <div className="hero-image-wrap" aria-hidden="true">
            <picture className="hero-picture">
              <source media="(max-width: 620px)" srcSet="/assets/hero-scales-portrait.png" />
              <img className="hero-image" src="/assets/hero-scales.jpg" alt="" />
            </picture>
            <div className="hero-image-tint" />
            <div className="hero-grid" />
          </div>
          <div className="hero-stage" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="gold-beam beam-one" />
            <div className="gold-beam beam-two" />
            <span className="light-node node-one" />
            <span className="light-node node-two" />
            <span className="light-node node-three" />
          </div>
          <div className="hero-noise" aria-hidden="true" />

          <div className="hero-inner page-width">
            <div className="hero-copy reveal is-visible">
              <div className="eyebrow"><span className="eyebrow-line" />{copy.hero.eyebrow}</div>
              <h1>{copy.hero.title}<em>{copy.hero.accent}</em></h1>
              <p>{copy.hero.description}</p>
              <div className="hero-actions">
                <a className="button button-gold" href="#contact">{copy.hero.primary}<ArrowUpRight size={17} strokeWidth={1.6} /></a>
                <a className="text-link" href="#about">{copy.hero.secondary}<ArrowDownRight size={17} strokeWidth={1.5} /></a>
              </div>
            </div>

            <div className="hero-side-note reveal is-visible">
              <span className="side-note-index">/ 01</span>
              <span>{copy.hero.visualNote}</span>
              <span className="side-note-rule" />
            </div>

            <div className="hero-bottom-line">
              <span className="scroll-cue"><MoveDown size={15} />{copy.hero.scroll}</span>
              <span>Tehran · Dubai · International</span>
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div className="page-width trust-inner">
            {copy.trust.items.map((item, index) => (
              <div className="trust-item" key={item.value}>
                <span className="trust-number">{item.value}</span>
                <span>{item.label}</span>
                {index < copy.trust.items.length - 1 && <span className="trust-divider" />}
              </div>
            ))}
          </div>
        </section>

        <section className="section section-about" id="about">
          <div className="page-width about-layout">
            <div className="section-index reveal"><span>02</span><span className="index-rule" /></div>
            <div className="about-copy reveal">
              <span className="section-kicker">{copy.about.kicker}</span>
              <h2>{copy.about.title}</h2>
              <p>{copy.about.body}</p>
              <a className="arrow-link" href="#expertise">{copy.about.link}<ChevronRight size={17} /></a>
            </div>
            <div className="about-statement reveal">
              <div className="statement-ring"><ShieldCheck size={22} strokeWidth={1.1} /></div>
              <span>{copy.about.quote}</span>
              <small>SOBHAN NIKSERESHT LAW</small>
            </div>
          </div>
        </section>

        <section className="section section-expertise" id="expertise">
          <div className="page-width expertise-layout">
            <div className="expertise-intro reveal">
              <div className="section-index"><span>03</span><span className="index-rule" /></div>
              <span className="section-kicker">{copy.expertise.kicker}</span>
              <h2>{copy.expertise.title}</h2>
              <p>{copy.expertise.body}</p>
              <div className="expertise-orb" aria-hidden="true"><Scale size={35} strokeWidth={0.8} /><span /></div>
            </div>
            <div className="expertise-list">
              {copy.expertise.cards.map((card, index) => (
                <article className="expertise-card reveal" key={card.number} style={{ "--card-delay": `${index * 100}ms` } as CSSProperties}>
                  <div className="card-topline"><span>{card.number}</span><span className="card-tag">{card.tag}</span></div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <span className="card-arrow"><ArrowUpRight size={19} strokeWidth={1.4} /></span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-approach" id="approach">
          <div className="page-width approach-layout">
            <div className="approach-heading reveal">
              <div className="section-index"><span>04</span><span className="index-rule" /></div>
              <span className="section-kicker">{copy.approach.kicker}</span>
              <h2>{copy.approach.title}</h2>
              <p>{copy.approach.body}</p>
            </div>
            <div className="approach-steps">
              {copy.approach.steps.map((step, index) => (
                <div className="approach-step reveal" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <div className="step-content"><h3>{step.title}</h3><p>{step.body}</p></div>
                  {index < copy.approach.steps.length - 1 && <span className="step-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-glow" aria-hidden="true" />
          <img className="contact-art" src="/assets/justice-portrait.png" alt="" aria-hidden="true" />
          <div className="page-width contact-layout">
            <div className="contact-copy reveal">
              <span className="section-kicker">{copy.contact.kicker}</span>
              <h2>{copy.contact.title}</h2>
              <p>{copy.contact.body}</p>
              <div className="contact-meta"><Globe2 size={17} strokeWidth={1.3} /><span>IRAN · فارسی · ENGLISH · العربية</span></div>
              <div className="contact-details">
                <a href={SITE.phoneHref}><Phone size={15} strokeWidth={1.3} /><span>{SITE.phoneDisplay}</span></a>
                <a href={`mailto:${SITE.email}`}><Mail size={15} strokeWidth={1.3} /><span>{SITE.email}</span></a>
                <span><MapPin size={15} strokeWidth={1.3} /><span>{SITE.address}</span></span>
              </div>
              <div className="social-links" aria-label="Social media">
                <a href={SITE.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={16} /></a>
                <a href={SITE.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram"><Send size={16} /></a>
                <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={16} /></a>
                <a href={SITE.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>
              </div>
            </div>
            <div className="contact-form-wrap reveal">
              {submitted ? (
                <div className="form-success"><Sparkles size={26} strokeWidth={1.2} /><strong>{copy.ui.success}</strong><p>{copy.contact.success}</p><button type="button" className="text-link" onClick={() => setSubmitted(false)}>{copy.contact.submit}</button></div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <label><span>{copy.contact.name}</span><input name="name" required placeholder={copy.contact.placeholderName} /></label>
                  <label><span>{copy.contact.contact}</span><input name="contact" required placeholder={copy.contact.placeholderContact} /></label>
                  <label><span>{copy.contact.brief}</span><textarea name="brief" required placeholder={copy.contact.placeholderBrief} rows={3} /></label>
                  <button className="button button-gold form-submit" type="submit">{copy.contact.submit}<ArrowUpRight size={17} strokeWidth={1.5} /></button>
                  <small>{copy.contact.note}</small>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-inner">
          <a className="brand-lockup footer-brand" href="#top"><BrandMark /><span className="brand-type"><strong>SOBHAN NIKSERESHT</strong><small>LAW</small></span></a>
          <span className="footer-line">{copy.footer.line}</span>
          <div className="footer-contact"><span>{copy.footer.contact}</span><a href={SITE.phoneHref}>{SITE.phoneDisplay}</a><a href={`mailto:${SITE.email}`}>{SITE.email}</a><strong>{SITE.address}</strong></div>
          <div className="footer-end"><span className="footer-copy">© {new Date().getFullYear()} Sobhan Nikseresht Law</span><a className="designer-link" href={SITE.designerUrl} target="_blank" rel="noreferrer">Design studio <ArrowUpRight size={12} /></a></div>
        </div>
      </footer>
    </div>
  );
}
