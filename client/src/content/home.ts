import type { Locale } from "@/lib/i18n";
type L3 = Record<Locale, string>;
type L3A = Record<Locale, string[]>;

export const SITUATIONS: { area: string; text: L3; first: L3 }[] = [
  { area: "corporate", text: { en: "I want to start or restructure a company", fa: "می‌خواهم شرکت تأسیس یا ساختار آن را اصلاح کنم", ar: "أريد تأسيس شركة أو إعادة هيكلتها" }, first: { en: "Start with the company type, the partners and the charter. Decide these before registration.", fa: "از نوع شرکت، شرکا و اساسنامه شروع کنید؛ این‌ها را پیش از ثبت تصمیم بگیرید.", ar: "ابدأ بنوع الشركة والشركاء والنظام الأساسي، وقرّرها قبل التسجيل." } },
  { area: "contracts", text: { en: "I am signing or reviewing a contract", fa: "در حال امضا یا بررسی یک قرارداد هستم", ar: "أنا بصدد توقيع عقد أو مراجعته" }, first: { en: "Send the draft and your commercial terms. We mark risks, missing clauses and what to negotiate.", fa: "پیش‌نویس و شرایط تجاری را بفرستید؛ ریسک‌ها، بندهای ناقص و نکات مذاکره مشخص می‌شود.", ar: "أرسل المسودة والشروط التجارية؛ نحدد المخاطر والبنود الناقصة ونقاط التفاوض." } },
  { area: "market-entry", text: { en: "I want to invest or enter the Iranian market", fa: "می‌خواهم سرمایه‌گذاری کنم یا وارد بازار ایران شوم", ar: "أريد الاستثمار أو دخول السوق الإيراني" }, first: { en: "A short legal map of your sector, structure and approvals comes before committing capital.", fa: "پیش از تعهد سرمایه، یک نقشه‌ی حقوقی کوتاه از حوزه، ساختار و مجوزها تهیه می‌شود.", ar: "خريطة قانونية قصيرة للقطاع والهيكل والموافقات قبل الالتزام برأس المال." } },
  { area: "disputes", text: { en: "I have a dispute with a partner or client", fa: "با شریک یا مشتری اختلاف دارم", ar: "لدي نزاع مع شريك أو عميل" }, first: { en: "Gather the contract, messages and payments. We decide between negotiation, arbitration and court.", fa: "قرارداد، پیام‌ها و پرداخت‌ها را جمع کنید؛ بین مذاکره، داوری و دادگاه تصمیم می‌گیریم.", ar: "اجمع العقد والرسائل والمدفوعات؛ ونقرّر بين التفاوض والتحكيم والقضاء." } },
  { area: "ip", text: { en: "I want to protect my brand", fa: "می‌خواهم از برندم محافظت کنم", ar: "أريد حماية علامتي التجارية" }, first: { en: "Check conflicting marks first, then file in the right classes before launching.", fa: "اول تعارض با علامت‌های موجود بررسی می‌شود، سپس پیش از عرضه در طبقه‌های مناسب ثبت می‌شود.", ar: "نفحص أولاً تعارض العلامات ثم نسجّل في الفئات المناسبة قبل الإطلاق." } },
];

export const DETAILS: Record<string, { bullets: L3A; example: L3 }> = {
  corporate: { bullets: { en: ["Choosing the right company type", "Charter and shareholder agreements", "Boards, meetings and registrations"], fa: ["انتخاب نوع مناسب شرکت", "اساسنامه و توافق‌نامه‌ی سهامداران", "هیئت‌مدیره، مجامع و ثبت تغییرات"], ar: ["اختيار نوع الشركة المناسب", "النظام الأساسي واتفاقات المساهمين", "مجالس الإدارة والجمعيات والتسجيل"] },
    example: { en: "Two founders, one idea, nothing in writing — a short shareholder agreement prevents the most common deadlock.", fa: "دو مؤسس، یک ایده و هیچ سند مکتوب؛ یک توافق‌نامه‌ی کوتاه سهامداری رایج‌ترین بن‌بست را پیشگیری می‌کند.", ar: "مؤسسان وفكرة واحدة وبلا مستند مكتوب؛ اتفاق مساهمين قصير يمنع أشيع حالات الجمود." } },
  contracts: { bullets: { en: ["Drafting from your commercial terms", "Risk, payment and delivery clauses", "Negotiation and amendments"], fa: ["تنظیم بر پایه‌ی شرایط تجاری شما", "بندهای ریسک، پرداخت و تحویل", "مذاکره و اصلاحات"], ar: ["الصياغة وفق شروطك التجارية", "بنود المخاطر والدفع والتسليم", "التفاوض والتعديلات"] },
    example: { en: "A supplier delays delivery. A clear deadline, notice and remedy clause turns an argument into a procedure.", fa: "تأمین‌کننده تحویل را به تأخیر می‌اندازد؛ بند روشن مهلت، ابلاغ و ضمانت اجرا، بحث را به یک روش مشخص تبدیل می‌کند.", ar: "مورّد يتأخر في التسليم؛ بند واضح للمهلة والإخطار والجزاء يحوّل الجدال إلى إجراء." } },
  "market-entry": { bullets: { en: ["Sector and approval mapping", "Local partner structures", "Investment documentation"], fa: ["نقشه‌ی حوزه و مجوزها", "ساختارهای شراکت محلی", "مستندسازی سرمایه‌گذاری"], ar: ["خريطة القطاع والموافقات", "هياكل الشراكة المحلية", "توثيق الاستثمار"] },
    example: { en: "A foreign company wants a local partner. The structure chosen on day one decides control, profit and exit.", fa: "یک شرکت خارجی شریک محلی می‌خواهد؛ ساختار روز اول، کنترل، سود و خروج را تعیین می‌کند.", ar: "شركة أجنبية تريد شريكاً محلياً؛ الهيكل المختار في اليوم الأول يحدد السيطرة والربح والخروج." } },
  disputes: { bullets: { en: ["Early negotiation strategy", "Arbitration clauses and proceedings", "Settlement agreements"], fa: ["راهبرد مذاکره‌ی زودهنگام", "شرط داوری و فرایند داوری", "توافق‌نامه‌ی تسویه"], ar: ["استراتيجية التفاوض المبكر", "شروط التحكيم وإجراءاته", "اتفاقات التسوية"] },
    example: { en: "The cheapest dispute is the one your contract already knows how to resolve.", fa: "ارزان‌ترین اختلاف، اختلافی است که قرارداد شما از قبل راه حلش را می‌داند.", ar: "أرخص نزاع هو الذي يعرف عقدك مسبقاً كيف يحلّه." } },
  ip: { bullets: { en: ["Trademark search and filing", "Trade names and brand rules", "Confidentiality arrangements"], fa: ["جست‌وجو و ثبت علامت تجاری", "نام تجاری و قواعد برند", "ترتیبات محرمانگی"], ar: ["البحث عن العلامة وتسجيلها", "الأسماء التجارية وقواعد العلامة", "ترتيبات السرية"] },
    example: { en: "A brand launched before it is registered can lose its name to someone who filed first.", fa: "برندی که پیش از ثبت عرضه شود، ممکن است نامش را به کسی که زودتر ثبت کرده از دست بدهد.", ar: "علامة تُطلق قبل تسجيلها قد تفقد اسمها لمن سجّل أولاً." } },
};

export const QUOTES: { text: L3; by: L3 }[] = [
  { text: { en: "Fiat justitia ruat caelum", fa: "Fiat justitia ruat caelum — عدالت اجرا شود، هرچند آسمان فرو ریزد", ar: "Fiat justitia ruat caelum — لتتحقق العدالة ولو سقطت السماء" }, by: { en: "Latin maxim: let justice be done, though the heavens fall", fa: "ضرب‌المثل حقوقی لاتین", ar: "حكمة قانونية لاتينية" } },
  { text: { en: "Pacta sunt servanda", fa: "Pacta sunt servanda — قراردادها باید رعایت شوند", ar: "Pacta sunt servanda — العقود يجب أن تُحترم" }, by: { en: "Latin maxim: agreements must be kept", fa: "قاعده‌ی بنیادین حقوق قراردادها", ar: "قاعدة أساسية في قانون العقود" } },
  { text: { en: "توانا بود هر که دانا بود", fa: "توانا بود هر که دانا بود", ar: "توانا بود هر که دانا بود" }, by: { en: "Ferdowsi — he who knows is strong", fa: "فردوسی", ar: "الفردوسي — من يعلم فهو قادر" } },
  { text: { en: "حق گرفتنی است، دادنی نیست", fa: "حق گرفتنی است، دادنی نیست", ar: "حق گرفتنی است، دادنی نیست" }, by: { en: "Persian proverb — a right is claimed, not handed out", fa: "ضرب‌المثل فارسی", ar: "مثل فارسي — الحق يُؤخذ ولا يُعطى" } },
  { text: { en: "العدل أساس الملك", fa: "العدل أساس الملك", ar: "العدل أساس الملك" }, by: { en: "Arabic saying — justice is the foundation of governance", fa: "سخن عربی: عدالت پایه‌ی حکمرانی است", ar: "قول مأثور" } },
  { text: { en: "Ignorantia juris non excusat", fa: "Ignorantia juris non excusat — ناآگاهی از قانون عذر نیست", ar: "Ignorantia juris non excusat — الجهل بالقانون ليس عذراً" }, by: { en: "Latin maxim: ignorance of the law is no excuse", fa: "ضرب‌المثل حقوقی لاتین", ar: "حكمة قانونية لاتينية" } },
];

export const DOCTOR = {
  name: { en: "Dr. Sobhan Nikseresht", fa: "دکتر سبحان نیک‌سرشت", ar: "الدكتور سبحان نيك سرشت" } as L3,
  role: { en: "Corporate & commercial lawyer", fa: "وکیل حقوق شرکت‌ها و تجارت", ar: "محامٍ في قانون الشركات والتجارة" } as L3,
  bio: { en: "A practice built on three habits: explain before advising, document before acting, and negotiate before litigating.", fa: "دفتری بر پایه‌ی سه عادت: پیش از مشاوره توضیح دادن، پیش از اقدام مستند کردن، و پیش از دعوا مذاکره کردن.", ar: "مكتب قائم على ثلاث عادات: الشرح قبل النصح، والتوثيق قبل التنفيذ، والتفاوض قبل التقاضي." } as L3,
  points: { en: ["Plain language, no jargon walls", "Written scope and clear next steps", "Confidential from the first message"], fa: ["زبان ساده، بدون پیچیده‌گویی", "دامنه‌ی کار مکتوب و گام‌های روشن", "محرمانه از اولین پیام"], ar: ["لغة بسيطة بلا تعقيد", "نطاق عمل مكتوب وخطوات واضحة", "سرية منذ أول رسالة"] } as L3A,
};

export const STEPS: { t: L3; d: L3 }[] = [
  { t: { en: "Tell us", fa: "بگویید", ar: "أخبرنا" }, d: { en: "A short description and the key documents.", fa: "شرح کوتاه و مدارک اصلی.", ar: "وصف موجز والمستندات الأساسية." } },
  { t: { en: "We map", fa: "ترسیم می‌کنیم", ar: "نرسم الخريطة" }, d: { en: "Objective, risks and the route, in plain words.", fa: "هدف، ریسک‌ها و مسیر، به زبان ساده.", ar: "الهدف والمخاطر والمسار بلغة بسيطة." } },
  { t: { en: "We act", fa: "اقدام می‌کنیم", ar: "نتصرف" }, d: { en: "Drafting, negotiation and filing, with clear updates.", fa: "تنظیم، مذاکره و ثبت، با گزارش روشن.", ar: "صياغة وتفاوض وتسجيل مع تحديثات واضحة." } },
];

export const HOME_UI = {
  pickTitle: { en: "Which service do you need?", fa: "کدام خدمت را نیاز دارید؟", ar: "أي خدمة تحتاج؟" } as L3,
  pickSub: { en: "Choose your situation — we show the first step.", fa: "وضعیت خود را انتخاب کنید؛ اولین گام نمایش داده می‌شود.", ar: "اختر وضعك؛ نعرض لك الخطوة الأولى." } as L3,
  firstStep: { en: "First step", fa: "اولین گام", ar: "الخطوة الأولى" } as L3,
  servicesTitle: { en: "What we handle", fa: "آنچه انجام می‌دهیم", ar: "ما نتولاه" } as L3,
  example: { en: "In practice", fa: "در عمل", ar: "في الواقع" } as L3,
  doctorKicker: { en: "Your lawyer", fa: "وکیل شما", ar: "محاميك" } as L3,
  photoHint: { en: "Photo coming soon", fa: "عکس به‌زودی", ar: "الصورة قريباً" } as L3,
  stepsTitle: { en: "How it works", fa: "چگونه کار می‌کنیم", ar: "كيف نعمل" } as L3,
  wisdomTitle: { en: "Words the law lives by", fa: "سخنانی که حقوق با آن‌ها زندگی می‌کند", ar: "كلمات يعيش بها القانون" } as L3,
  prev: { en: "Previous", fa: "قبلی", ar: "السابق" } as L3,
  next: { en: "Next", fa: "بعدی", ar: "التالي" } as L3,
};
