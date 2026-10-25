import type { Locale } from "@/lib/i18n";
export type L3 = Record<Locale, string>;

export const X = {
  blogHeroKicker: { en: "Legal insights", fa: "بینش حقوقی", ar: "رؤى قانونية" },
  blogHeroTitle: { en: "Read our articles", fa: "مقالات ما را بخوانید", ar: "اقرأ مقالاتنا" },
  blogHeroSub: { en: "Educational writing on corporate law, contracts, investment, arbitration and intellectual property in Iran.", fa: "مقالات آموزشی درباره حقوق شرکت‌ها، قراردادها، سرمایه‌گذاری، داوری و مالکیت فکری در ایران.", ar: "مقالات تعليمية عن قانون الشركات والعقود والاستثمار والتحكيم والملكية الفكرية في إيران." },
  searchArticles: { en: "Search articles…", fa: "جست‌وجو در مقالات…", ar: "ابحث في المقالات…" },
  startReading: { en: "Start reading", fa: "شروع مطالعه", ar: "ابدأ القراءة" },
  readArticle: { en: "Read the article", fa: "خواندن مقاله", ar: "اقرأ المقال" },
  articlesCount: { en: "articles", fa: "مقاله", ar: "مقالات" },
  noArticles: { en: "No article matches. Try another word or choose All.", fa: "مقاله‌ای پیدا نشد. کلمه‌ی دیگری امتحان کنید یا «همه» را انتخاب کنید.", ar: "لا يوجد مقال مطابق. جرّب كلمة أخرى أو اختر «الكل»." },
  backToInsights: { en: "Back to insights", fa: "بازگشت به مقالات", ar: "العودة إلى المقالات" },
  allArticles: { en: "All articles", fa: "همه‌ی مقالات", ar: "كل المقالات" },
  relatedArticles: { en: "Related articles", fa: "مقالات مرتبط", ar: "مقالات ذات صلة" },
  discover: { en: "Discover", fa: "بیشتر بدانید", ar: "اكتشف المزيد" },
  meetTeam: { en: "Meet the team", fa: "آشنایی با تیم", ar: "تعرّف على الفريق" },
  searchTitle: { en: "Search a legal question", fa: "یک مسئله‌ی حقوقی را جست‌وجو کنید", ar: "ابحث عن مسألة قانونية" },
  keyPoints: { en: "Key points", fa: "نکات کلیدی", ar: "النقاط الرئيسية" },
  eduNote: { en: "Educational note", fa: "نکته‌ی آموزشی", ar: "ملاحظة تعليمية" },
  sources: { en: "Sources", fa: "منابع", ar: "المصادر" },
  discuss: { en: "Discuss a question", fa: "گفت‌وگو درباره‌ی یک پرسش", ar: "ناقش سؤالاً" },
  moreArticles: { en: "Keep reading", fa: "ادامه‌ی مطالعه", ar: "تابع القراءة" },
  servicesTitle: { en: "Our legal services", fa: "خدمات حقوقی ما", ar: "خدماتنا القانونية" },
  pickTitle: { en: "What is your legal matter?", fa: "موضوع حقوقی شما چیست؟", ar: "ما هي مسألتك القانونية؟" },
  pickSub: { en: "Choose the situation closest to yours and see the first step.", fa: "نزدیک‌ترین موقعیت به مسئله‌ی خود را انتخاب کنید تا نخستین گام را ببینید.", ar: "اختر الحالة الأقرب إلى مسألتك لترى الخطوة الأولى." },
  stepsTitle: { en: "How a case is handled", fa: "فرایند انجام کار", ar: "مراحل سير العمل" },
  teamKicker: { en: "Our team", fa: "تیم ما", ar: "فريقنا" },
  teamTitle: { en: "Meet the lawyers and advisers", fa: "با حقوقدانان و مشاوران دفتر آشنا شوید", ar: "تعرّف على المحامين والمستشارين" },
  tipsTitle: { en: "Practical tips from our team", fa: "توصیه‌های کاربردی تیم ما", ar: "نصائح عملية من فريقنا" },
  wisdomTitle: { en: "Notable words on law", fa: "سخنان ماندگار درباره‌ی حقوق", ar: "أقوال خالدة عن القانون" },
  readMoreDoctor: { en: "Read more", fa: "ادامه‌ی معرفی", ar: "اقرأ المزيد" },
  readLessDoctor: { en: "Show less", fa: "بستن", ar: "إخفاء" },
  quickLinks: { en: "Quick links", fa: "دسترسی سریع", ar: "روابط سريعة" },
} satisfies Record<string, L3>;

export const AREA_CAT: Record<string, string> = {
  corporate: "Corporate law",
  contracts: "Commercial contracts",
  "market-entry": "Market entry",
  disputes: "Dispute resolution",
  ip: "Intellectual property",
};

export const PHOTOS = ["office", "themis", "meeting", "gold-scales"] as const;
export const photoUrl = (n: number) => `/assets/photos/${PHOTOS[Math.abs(n) % PHOTOS.length]}.webp`;

export const GALLERY: { img: string; cap: L3; sub: L3; href: string }[] = [
  { img: "gold-scales", href: "/expertise",
    cap: { en: "Balance in every position.", fa: "تعادل در هر موضع.", ar: "توازن في كل موقف." },
    sub: { en: "Five practice areas, one clear method.", fa: "پنج حوزه‌ی تخصصی، یک روش روشن.", ar: "خمسة مجالات خبرة، ومنهج واحد واضح." } },
  { img: "office", href: "/about",
    cap: { en: "A calm, precise practice.", fa: "یک دفتر آرام و دقیق.", ar: "مكتب هادئ ودقيق." },
    sub: { en: "Plain language, written scope, clear next steps.", fa: "زبان ساده، دامنه‌ی کار مکتوب، گام‌های روشن.", ar: "لغة بسيطة ونطاق عمل مكتوب وخطوات واضحة." } },
  { img: "themis", href: "/approach",
    cap: { en: "Law that sees clearly.", fa: "حقوقی که روشن می‌بیند.", ar: "قانون يرى بوضوح." },
    sub: { en: "Understand. Structure. Execute.", fa: "درک. ساختار. اجرا.", ar: "افهم. هيكل. نفّذ." } },
  { img: "meeting", href: "/contact",
    cap: { en: "Every case starts with a conversation.", fa: "هر پرونده با یک گفت‌وگو آغاز می‌شود.", ar: "كل قضية تبدأ بحديث." },
    sub: { en: "Send a short description — we reply within one working day.", fa: "شرح کوتاهی بفرستید؛ ظرف یک روز کاری پاسخ می‌دهیم.", ar: "أرسل وصفاً موجزاً؛ نرد خلال يوم عمل واحد." } },
];
