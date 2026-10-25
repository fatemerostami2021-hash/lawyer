import type { Locale } from "@/lib/i18n";
type L3 = Record<Locale, string>;
type L3A = Record<Locale, string[]>;

// NOTE: placeholder (virtual) names — replace with the real team.
export const TEAM: { id: string; initials: string; name: L3; role: L3; intro: L3; branches: L3A; tip: L3 }[] = [
  { id: "neda", initials: "NK", name: { en: "Dr. Neda Karimi", fa: "دکتر ندا کریمی", ar: "الدكتورة ندى كريمي" }, role: { en: "Corporate & governance", fa: "حقوق شرکت‌ها و حاکمیت", ar: "الشركات والحوكمة" },
    intro: { en: "Builds company structures that stay clear as the business grows.", fa: "ساختارهای شرکتی می‌سازد که با رشد کسب‌وکار روشن می‌مانند.", ar: "تبني هياكل شركات تبقى واضحة مع نمو الأعمال." },
    branches: { en: ["Company formation", "Shareholder agreements", "General meetings"], fa: ["تأسیس شرکت", "توافق‌نامه‌ی سهامداران", "مجامع عمومی"], ar: ["تأسيس الشركات", "اتفاقات المساهمين", "الجمعيات العمومية"] },
    tip: { en: "Write the exit rules into the shareholder agreement on day one, while everyone still agrees.", fa: "قواعد خروج از شرکت را همان روز اول، وقتی همه هنوز موافق‌اند، در توافق‌نامه بنویسید.", ar: "اكتب قواعد الخروج في اتفاق المساهمين منذ اليوم الأول بينما الجميع متفق." } },
  { id: "arman", initials: "AR", name: { en: "Arman Rahimi", fa: "آرمان رحیمی", ar: "أرمان رحيمي" }, role: { en: "Contracts & commercial", fa: "قراردادها و تجارت", ar: "العقود والتجارة" },
    intro: { en: "Turns commercial deals into precise, enforceable paper.", fa: "توافق‌های تجاری را به سندی دقیق و قابل اجرا تبدیل می‌کند.", ar: "يحوّل الصفقات التجارية إلى وثائق دقيقة وقابلة للتنفيذ." },
    branches: { en: ["Supply & distribution", "Service agreements", "Negotiation"], fa: ["تأمین و توزیع", "قراردادهای خدمات", "مذاکره"], ar: ["التوريد والتوزيع", "عقود الخدمات", "التفاوض"] },
    tip: { en: "If a clause cannot be explained in one sentence to your team, it will be argued about later.", fa: "اگر بندی را نتوانید در یک جمله به تیم خود توضیح دهید، بعداً بر سرش بحث می‌شود.", ar: "إذا تعذّر شرح البند بجملة واحدة لفريقك فسيُختلف عليه لاحقاً." } },
  { id: "leila", initials: "LF", name: { en: "Leila Fathi", fa: "لیلا فتحی", ar: "ليلى فتحي" }, role: { en: "Foreign investment", fa: "سرمایه‌گذاری خارجی", ar: "الاستثمار الأجنبي" },
    intro: { en: "Guides international clients through entering the Iranian market.", fa: "مشتریان بین‌المللی را در ورود به بازار ایران راهنمایی می‌کند.", ar: "ترشد العملاء الدوليين في دخول السوق الإيراني." },
    branches: { en: ["Market-entry mapping", "Local partners", "Approvals"], fa: ["نقشه‌ی ورود به بازار", "شریک محلی", "مجوزها"], ar: ["خريطة دخول السوق", "الشركاء المحليون", "الموافقات"] },
    tip: { en: "Map the approvals before the budget — the order of steps often decides the timeline.", fa: "پیش از بودجه، مجوزها را ترسیم کنید؛ ترتیب گام‌ها معمولاً زمان‌بندی را تعیین می‌کند.", ar: "ارسم الموافقات قبل الميزانية؛ فترتيب الخطوات غالباً يحدد الجدول الزمني." } },
  { id: "kaveh", initials: "KM", name: { en: "Kaveh Mansouri", fa: "کاوه منصوری", ar: "كاوه منصوري" }, role: { en: "Arbitration & disputes", fa: "داوری و اختلافات", ar: "التحكيم والمنازعات" },
    intro: { en: "Prepares disputes early, so they end faster and cost less.", fa: "اختلاف‌ها را زود آماده می‌کند تا سریع‌تر و ارزان‌تر تمام شوند.", ar: "يُعدّ النزاعات مبكراً لتنتهي أسرع وبكلفة أقل." },
    branches: { en: ["Arbitration clauses", "Negotiation strategy", "Settlements"], fa: ["شرط داوری", "راهبرد مذاکره", "تسویه"], ar: ["شروط التحكيم", "استراتيجية التفاوض", "التسويات"] },
    tip: { en: "Keep every notice, message and payment record in one folder from the first disagreement.", fa: "از اولین اختلاف، همه‌ی اخطارها، پیام‌ها و رسید پرداخت‌ها را در یک پوشه نگه دارید.", ar: "احتفظ بكل إخطار ورسالة وإيصال دفع في مجلد واحد منذ أول خلاف." } },
  { id: "mina", initials: "MS", name: { en: "Mina Sadeghi", fa: "مینا صادقی", ar: "مينا صادقي" }, role: { en: "Brands & IP", fa: "برند و مالکیت فکری", ar: "العلامات والملكية الفكرية" },
    intro: { en: "Protects names and ideas before they reach the market.", fa: "نام‌ها و ایده‌ها را پیش از رسیدن به بازار محافظت می‌کند.", ar: "تحمي الأسماء والأفكار قبل وصولها إلى السوق." },
    branches: { en: ["Trademark filing", "Trade names", "Confidentiality"], fa: ["ثبت علامت تجاری", "نام تجاری", "محرمانگی"], ar: ["تسجيل العلامات", "الأسماء التجارية", "السرية"] },
    tip: { en: "Search the name and file the mark before printing packaging or launching a domain.", fa: "پیش از چاپ بسته‌بندی یا خرید دامنه، نام را جست‌وجو و علامت را ثبت کنید.", ar: "ابحث عن الاسم وسجّل العلامة قبل طباعة العبوات أو إطلاق النطاق." } },
];

export const RESOURCES: { href: string; name: L3; desc: L3 }[] = [
  { href: "https://www.rrk.ir", name: { en: "Official Gazette of Iran", fa: "روزنامه رسمی", ar: "الجريدة الرسمية الإيرانية" }, desc: { en: "Published laws, regulations and company announcements.", fa: "قوانین، مقررات و آگهی‌های رسمی شرکت‌ها.", ar: "القوانين واللوائح وإعلانات الشركات الرسمية." } },
  { href: "https://rc.majlis.ir", name: { en: "Majlis Research Center", fa: "مرکز پژوهش‌های مجلس", ar: "مركز أبحاث مجلس الشورى" }, desc: { en: "Law texts, reports and legislative research.", fa: "متن قوانین، گزارش‌ها و پژوهش‌های قانون‌گذاری.", ar: "نصوص القوانين والتقارير والأبحاث التشريعية." } },
  { href: "https://www.wipo.int", name: { en: "WIPO", fa: "سازمان جهانی مالکیت فکری (WIPO)", ar: "المنظمة العالمية للملكية الفكرية (WIPO)" }, desc: { en: "International guidance on trademarks and intellectual property.", fa: "راهنمای بین‌المللی علائم تجاری و مالکیت فکری.", ar: "إرشادات دولية حول العلامات والملكية الفكرية." } },
  { href: "https://uncitral.un.org", name: { en: "UNCITRAL", fa: "کمیسیون حقوق تجارت بین‌الملل سازمان ملل (UNCITRAL)", ar: "لجنة الأمم المتحدة للقانون التجاري الدولي (UNCITRAL)" }, desc: { en: "Model laws and texts on international trade and arbitration.", fa: "قوانین نمونه و متون تجارت بین‌الملل و داوری.", ar: "قوانين نموذجية ونصوص التجارة الدولية والتحكيم." } },
  { href: "https://iccwbo.org", name: { en: "International Chamber of Commerce", fa: "اتاق بازرگانی بین‌المللی (ICC)", ar: "غرفة التجارة الدولية (ICC)" }, desc: { en: "Arbitration rules and commercial practice standards.", fa: "قواعد داوری و استانداردهای رویه‌ی تجاری.", ar: "قواعد التحكيم ومعايير الممارسة التجارية." } },
];

export const TEAM_UI = {
  kicker: { en: "Team", fa: "هم‌تیمی‌ها", ar: "الفريق" } as L3,
  title: { en: "The people behind the practice", fa: "افرادی که پشت این دفتر هستند", ar: "الأشخاص وراء المكتب" } as L3,
  resources: { en: "Reliable resources", fa: "منابع معتبر", ar: "مصادر موثوقة" } as L3,
  tipsTitle: { en: "Tips from the team", fa: "نکته‌هایی از تیم", ar: "نصائح من الفريق" } as L3,
  tip: { en: "Tip", fa: "نکته", ar: "نصيحة" } as L3,
};
