export type Locale = "en" | "fa" | "ar";
export type L3 = Record<Locale, string>;
export const pick = (v: L3, l: Locale) => v[l];

export const UI = {
  home: { en: "Home", fa: "خانه", ar: "الرئيسية" },
  about: { en: "About", fa: "درباره ما", ar: "عن المكتب" },
  expertise: { en: "Expertise", fa: "حوزه‌های تخصصی", ar: "مجالات الخبرة" },
  approach: { en: "Approach", fa: "رویکرد", ar: "منهجيتنا" },
  legalHelp: { en: "Legal help", fa: "راهنمای حقوقی", ar: "مساعدة قانونية" },
  blog: { en: "Blog", fa: "وبلاگ", ar: "المدونة" },
  faq: { en: "FAQ", fa: "سؤالات متداول", ar: "الأسئلة الشائعة" },
  contact: { en: "Contact", fa: "تماس", ar: "تواصل" },
  consult: { en: "Request consultation", fa: "درخواست مشاوره", ar: "طلب استشارة" },
  search: { en: "Search", fa: "جست‌وجو", ar: "بحث" },
  searchPh: { en: "Search a legal question…", fa: "یک مسئله‌ی حقوقی را جست‌وجو کنید…", ar: "ابحث عن مسألة قانونية…" },
  noResults: { en: "No match yet. Try another word, or ask us directly.", fa: "نتیجه‌ای پیدا نشد. کلمه‌ی دیگری امتحان کنید یا مستقیم بپرسید.", ar: "لا توجد نتائج. جرّب كلمة أخرى أو اسألنا مباشرة." },
  groupAreas: { en: "Practice areas", fa: "حوزه‌های تخصصی", ar: "مجالات الخبرة" },
  groupBlog: { en: "Blog", fa: "وبلاگ", ar: "المدونة" },
  groupFaq: { en: "FAQ", fa: "سؤالات متداول", ar: "الأسئلة الشائعة" },
  all: { en: "All", fa: "همه", ar: "الكل" },
  heroKicker: { en: "Corporate & Commercial Law · Iran", fa: "حقوق شرکت‌ها و تجارت · ایران", ar: "قانون الشركات والتجارة · إيران" },
  heroTitle: { en: "Clarity for every legal decision.", fa: "وضوح برای هر تصمیم حقوقی.", ar: "وضوح لكل قرار قانوني." },
  heroSub: { en: "Corporate structuring, contracts, investment, arbitration and brands — explained clearly, handled precisely.", fa: "ساختار شرکتی، قرارداد، سرمایه‌گذاری، داوری و برند؛ روشن توضیح داده می‌شود و دقیق پیگیری می‌شود.", ar: "هيكلة الشركات والعقود والاستثمار والتحكيم والعلامات؛ شرح واضح ومتابعة دقيقة." },
  heroChips: { en: "Start a company|Contract review|Foreign investment|Arbitration|Trademark", fa: "تأسیس شرکت|بررسی قرارداد|سرمایه‌گذاری خارجی|داوری|ثبت برند", ar: "تأسيس شركة|مراجعة عقد|استثمار أجنبي|تحكيم|علامة تجارية" },
  explore: { en: "Explore practice areas", fa: "مشاهده حوزه‌های تخصصی", ar: "استعرض مجالات الخبرة" },
  readMore: { en: "Read more", fa: "ادامه", ar: "اقرأ المزيد" },
  latestBlog: { en: "From the blog", fa: "از وبلاگ", ar: "من المدونة" },
  faqTitle: { en: "Questions people ask first", fa: "سؤال‌هایی که اول می‌پرسند", ar: "أسئلة تُطرح أولاً" },
  allFaq: { en: "All questions", fa: "همه‌ی سؤال‌ها", ar: "كل الأسئلة" },
  ctaTitle: { en: "Bring the question. We'll shape the route.", fa: "سؤال را بیاورید؛ مسیر را می‌سازیم.", ar: "احضر السؤال؛ ونحن نرسم المسار." },
  disclaimer: { en: "General information, not legal advice for a specific case.", fa: "اطلاعات عمومی است و مشاوره‌ی حقوقی برای پرونده‌ی مشخص نیست.", ar: "معلومات عامة وليست استشارة لقضية محددة." },
  chatTitle: { en: "Legal assistant", fa: "دستیار حقوقی", ar: "المساعد القانوني" },
  chatHello: { en: "Hello! Pick a question or type your own.", fa: "سلام! یک سؤال را انتخاب کنید یا سؤال خودتان را بنویسید.", ar: "مرحباً! اختر سؤالاً أو اكتب سؤالك." },
  chatPh: { en: "Type your question…", fa: "سؤال خود را بنویسید…", ar: "اكتب سؤالك…" },
  chatSend: { en: "Send", fa: "ارسال", ar: "إرسال" },
  chatFallback: { en: "I couldn't find a close answer. Our team can answer this personally on WhatsApp.", fa: "پاسخ نزدیکی پیدا نکردم. تیم ما می‌تواند در واتساپ شخصاً پاسخ دهد.", ar: "لم أجد إجابة قريبة. يمكن لفريقنا الإجابة شخصياً عبر واتساب." },
  chatWa: { en: "Continue on WhatsApp", fa: "ادامه در واتساپ", ar: "تابع عبر واتساب" },
  chatHints: { en: "Need help choosing?|Free first conversation|Ask a legal question", fa: "برای انتخاب راهنمایی می‌خواهید؟|اولین گفت‌وگو رایگان|سؤال حقوقی بپرسید", ar: "هل تحتاج مساعدة؟|أول محادثة مجانية|اسأل سؤالاً قانونياً" },
  footer: { en: "Corporate & Commercial Law in Iran", fa: "حقوق شرکت‌ها و تجارت در ایران", ar: "قانون الشركات والتجارة في إيران" },
  designer: { en: "Design studio", fa: "استودیو طراحی", ar: "استوديو التصميم" },
  menu: { en: "Menu", fa: "منو", ar: "القائمة" },
  close: { en: "Close", fa: "بستن", ar: "إغلاق" },
  filterTitle: { en: "Filter by type", fa: "فیلتر بر اساس نوع", ar: "تصفية حسب النوع" },
  megaCta: { en: "Not sure where to start? Search a question.", fa: "نمی‌دانید از کجا شروع کنید؟ یک سؤال جست‌وجو کنید.", ar: "لست متأكداً من أين تبدأ؟ ابحث عن سؤال." },
  imgOffice: { en: "A calm, precise practice.", fa: "یک دفتر آرام و دقیق.", ar: "مكتب هادئ ودقيق." },
  imgScales: { en: "Balance in every position.", fa: "تعادل در هر موضع.", ar: "توازن في كل موقف." },
  imgThemis: { en: "Law that sees clearly.", fa: "حقوقی که روشن می‌بیند.", ar: "قانون يرى بوضوح." },
} satisfies Record<string, L3>;

export type AreaType = "advisory" | "transactions" | "disputes";
export const TYPES: Record<AreaType, L3> = {
  advisory: { en: "Advisory", fa: "مشاوره‌ای", ar: "استشاري" },
  transactions: { en: "Transactions", fa: "معاملاتی", ar: "معاملات" },
  disputes: { en: "Disputes", fa: "اختلافات", ar: "منازعات" },
};

export type Area = { id: string; type: AreaType; title: L3; body: L3 };
export const AREAS: Area[] = [
  { id: "corporate", type: "advisory",
    title: { en: "Corporate structuring & governance", fa: "ساختاردهی و حاکمیت شرکتی", ar: "هيكلة الشركات وحوكمتها" },
    body: { en: "Company formation, charters, shareholder arrangements, boards, general meetings and registration of changes.", fa: "تأسیس شرکت، اساسنامه، توافق‌های سهامداری، هیئت‌مدیره، مجامع عمومی و ثبت تغییرات.", ar: "تأسيس الشركات والنظام الأساسي واتفاقات المساهمين ومجالس الإدارة والجمعيات العمومية وتسجيل التغييرات." } },
  { id: "contracts", type: "transactions",
    title: { en: "Commercial contracts", fa: "قراردادهای تجاری", ar: "العقود التجارية" },
    body: { en: "Drafting, review and negotiation with clear allocation of risk, deliverables, payment and termination.", fa: "تنظیم، بررسی و مذاکره‌ی قرارداد با تقسیم روشن ریسک، تعهدات، پرداخت و پایان همکاری.", ar: "صياغة العقود ومراجعتها والتفاوض عليها مع توزيع واضح للمخاطر والالتزامات والدفع والإنهاء." } },
  { id: "market-entry", type: "transactions",
    title: { en: "Foreign investment & market entry", fa: "سرمایه‌گذاری خارجی و ورود به بازار", ar: "الاستثمار الأجنبي ودخول السوق" },
    body: { en: "Legal mapping for entering the Iranian market, local partners and investment structures.", fa: "نقشه‌ی حقوقی ورود به بازار ایران، شریک محلی و ساختارهای سرمایه‌گذاری.", ar: "خريطة قانونية لدخول السوق الإيراني والشركاء المحليين وهياكل الاستثمار." } },
  { id: "disputes", type: "disputes",
    title: { en: "Dispute resolution & arbitration", fa: "حل اختلاف و داوری", ar: "تسوية المنازعات والتحكيم" },
    body: { en: "Dispute strategy, arbitration clauses, negotiation and settlement design.", fa: "راهبرد حل اختلاف، شرط داوری، مذاکره و طراحی تسویه.", ar: "استراتيجية حل النزاعات وشروط التحكيم والتفاوض وتصميم التسويات." } },
  { id: "ip", type: "advisory",
    title: { en: "Brands & intellectual property", fa: "برند و مالکیت فکری", ar: "العلامات والملكية الفكرية" },
    body: { en: "Brand protection, trademark strategy, trade names and confidentiality arrangements.", fa: "حمایت از برند، راهبرد ثبت علامت تجاری، نام تجاری و ترتیبات محرمانگی.", ar: "حماية العلامة وإستراتيجية تسجيلها والأسماء التجارية وترتيبات السرية." } },
];

export type Faq = { id: string; q: L3; a: L3 };
export const FAQS: Faq[] = [
  { id: "start-company",
    q: { en: "How do I start a company in Iran?", fa: "چگونه در ایران شرکت تأسیس کنم؟", ar: "كيف أؤسس شركة في إيران؟" },
    a: { en: "You choose the company type, prepare the charter and capital details, then register with the competent registration authority. The right type depends on partners, liability and growth plans, so it is worth deciding before filing.", fa: "نوع شرکت انتخاب می‌شود، اساسنامه و جزئیات سرمایه تنظیم می‌شود و سپس در مرجع ثبت صالح ثبت می‌شود. نوع مناسب به شرکا، مسئولیت و برنامه‌ی رشد بستگی دارد؛ بهتر است قبل از ثبت تصمیم گرفته شود.", ar: "تختار نوع الشركة وتُعدّ النظام الأساسي وبيانات رأس المال ثم تسجّل لدى جهة التسجيل المختصة. يعتمد النوع المناسب على الشركاء والمسؤولية وخطط النمو، لذا يُفضَّل تحديده قبل التقديم." } },
  { id: "foreign-investor",
    q: { en: "Can a foreign investor invest in Iran?", fa: "آیا سرمایه‌گذار خارجی می‌تواند در ایران سرمایه‌گذاری کند؟", ar: "هل يمكن للمستثمر الأجنبي الاستثمار في إيران؟" },
    a: { en: "There are legal pathways for foreign investment, and they depend on the sector, structure and approvals involved. A short legal mapping before committing capital avoids costly surprises.", fa: "مسیرهای حقوقی برای سرمایه‌گذاری خارجی وجود دارد و به حوزه، ساختار و مجوزهای لازم بستگی دارد. یک نقشه‌ی حقوقی کوتاه پیش از تعهد سرمایه از غافلگیری‌های پرهزینه جلوگیری می‌کند.", ar: "توجد مسارات قانونية للاستثمار الأجنبي وتعتمد على القطاع والهيكل والموافقات. خريطة قانونية قصيرة قبل الالتزام برأس المال تتجنب مفاجآت مكلفة." } },
  { id: "contract-must-have",
    q: { en: "What should a commercial contract include?", fa: "یک قرارداد تجاری باید شامل چه چیزهایی باشد؟", ar: "ماذا يجب أن يتضمن العقد التجاري؟" },
    a: { en: "Clear parties and subject, obligations and deadlines, price and payment terms, evidence and notice rules, remedies for breach, termination and the dispute-resolution method.", fa: "طرفین و موضوع روشن، تعهدات و مهلت‌ها، قیمت و شرایط پرداخت، قواعد اثبات و ابلاغ، ضمانت اجرای نقض، پایان قرارداد و روش حل اختلاف.", ar: "أطراف وموضوع واضحان، الالتزامات والمواعيد، السعر وشروط الدفع، قواعد الإثبات والإخطار، جزاءات الإخلال، الإنهاء وطريقة تسوية النزاع." } },
  { id: "arbitration-vs-court",
    q: { en: "Arbitration or court — which is better?", fa: "داوری بهتر است یا دادگاه؟", ar: "التحكيم أم القضاء — أيهما أفضل؟" },
    a: { en: "Arbitration can be faster and more private and lets parties choose the arbitrators; courts offer a familiar process. The choice belongs in the contract, before any dispute exists.", fa: "داوری می‌تواند سریع‌تر و محرمانه‌تر باشد و طرفین داور را انتخاب می‌کنند؛ دادگاه فرایند آشناتری دارد. این انتخاب باید پیش از بروز اختلاف در قرارداد تعیین شود.", ar: "قد يكون التحكيم أسرع وأكثر سرية ويتيح اختيار المحكّمين، بينما يوفر القضاء إجراءً مألوفاً. يجب تحديد الاختيار في العقد قبل نشوء أي نزاع." } },
  { id: "register-trademark",
    q: { en: "How do I protect my brand name?", fa: "چگونه نام برند خود را حفظ کنم؟", ar: "كيف أحمي اسم علامتي؟" },
    a: { en: "Search for conflicting marks, choose the classes that match your products, and file the trademark application early. Contracts with partners and staff should also protect confidentiality.", fa: "ابتدا تعارض با علامت‌های موجود بررسی می‌شود، طبقه‌های متناسب با محصولات انتخاب می‌شود و درخواست ثبت علامت زود ارائه می‌شود. قراردادهای شرکا و کارکنان نیز باید محرمانگی را پوشش دهد.", ar: "يُفحص التعارض مع العلامات القائمة وتُختار الفئات المناسبة وتُقدَّم طلبات التسجيل مبكراً، كما يجب أن تحمي العقود مع الشركاء والموظفين السرية." } },
  { id: "first-consultation",
    q: { en: "How does the first consultation work?", fa: "اولین جلسه‌ی مشاوره چگونه است؟", ar: "كيف تتم أول استشارة؟" },
    a: { en: "You send a short description and the key documents. We map the objective, the risks and the next steps, then agree the scope before any work starts.", fa: "شرح کوتاه و مدارک اصلی را می‌فرستید. هدف، ریسک‌ها و گام‌های بعدی ترسیم می‌شود و پیش از شروع کار، دامنه‌ی خدمت توافق می‌شود.", ar: "ترسل وصفاً موجزاً والمستندات الأساسية. نحدد الهدف والمخاطر والخطوات التالية ثم نتفق على نطاق العمل قبل البدء." } },
  { id: "confidentiality",
    q: { en: "Is what I share kept confidential?", fa: "آیا اطلاعاتی که می‌دهم محرمانه می‌ماند؟", ar: "هل ما أشاركه يبقى سرياً؟" },
    a: { en: "Client information is treated as confidential. Share what is needed for the question and avoid sending sensitive originals until we confirm the secure channel.", fa: "اطلاعات موکل محرمانه تلقی می‌شود. فقط آنچه برای سؤال لازم است ارسال شود و تا تأیید کانال امن، اصل مدارک حساس فرستاده نشود.", ar: "تُعامل معلومات العميل بسرية. شارك ما يلزم للمسألة وتجنب إرسال الأصول الحساسة قبل تأكيد القناة الآمنة." } },
  { id: "languages",
    q: { en: "Which languages do you work in?", fa: "به چه زبان‌هایی خدمات می‌دهید؟", ar: "بأي لغات تعملون؟" },
    a: { en: "Persian, English and Arabic — documents and conversations can follow the language of your business.", fa: "فارسی، انگلیسی و عربی؛ مدارک و گفت‌وگوها می‌تواند به زبان کسب‌وکار شما باشد.", ar: "الفارسية والإنجليزية والعربية؛ يمكن أن تتم المستندات والمحادثات بلغة عملك." } },
];

const norm = (s: string) => s.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[\u064B-\u065F]/g, "").trim();

export type Hit = { kind: "area" | "blog" | "faq"; id: string; title: string; snippet: string; href: string; score: number };

export function searchAll(query: string, locale: Locale, posts: { slug: string; title: string; titleFa: string; deck: string }[]): Hit[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const score = (text: string) => { const t = norm(text); return tokens.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0); };
  const hits: Hit[] = [];
  AREAS.forEach(a => { const s = score(a.title[locale] + " " + a.body[locale]); if (s) hits.push({ kind: "area", id: a.id, title: a.title[locale], snippet: a.body[locale], href: "/expertise", score: s + 0.2 }); });
  FAQS.forEach(f => { const s = score(f.q[locale] + " " + f.a[locale]); if (s) hits.push({ kind: "faq", id: f.id, title: f.q[locale], snippet: f.a[locale], href: `/faq#${f.id}`, score: s + 0.4 }); });
  posts.forEach(p => { const title = locale === "fa" ? p.titleFa : p.title; const s = score(title + " " + p.deck); if (s) hits.push({ kind: "blog", id: p.slug, title, snippet: p.deck, href: `/insights/${p.slug}`, score: s }); });
  return hits.sort((a, b) => b.score - a.score);
}
