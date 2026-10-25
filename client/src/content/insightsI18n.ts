import { insights } from "@/content/legalContent";
import type { Locale } from "@/lib/i18n";
import { photoUrl } from "@/content/ui2";

export type Insight = (typeof insights)[number];
type L3 = Record<Locale, string>;

// Keyed by the English category used in legalContent.ts
export const CAT: Record<string, L3> = {
  "Corporate law": { en: "Corporate law", fa: "حقوق شرکت‌ها", ar: "قانون الشركات" },
  "Commercial contracts": { en: "Commercial contracts", fa: "قراردادهای تجاری", ar: "العقود التجارية" },
  "Market entry": { en: "Market entry", fa: "ورود به بازار", ar: "دخول السوق" },
  "Dispute resolution": { en: "Dispute resolution", fa: "حل اختلاف", ar: "تسوية المنازعات" },
  "Intellectual property": { en: "Intellectual property", fa: "مالکیت فکری", ar: "الملكية الفكرية" },
};

const TITLE_AR: Record<string, string> = {
  "Corporate law": "هندسة الحوكمة المؤسسية في إيران",
  "Commercial contracts": "العقد التجاري: من الاتفاق إلى التزام قابل للتنفيذ",
  "Market entry": "قانون FIPPA ومسار منضبط لدخول إيران",
  "Dispute resolution": "التحكيم التجاري: صمّم مسار حل النزاع قبل نشوئه",
  "Intellectual property": "الملكية الفكرية: احمِ علامتك قبل الإطلاق",
};

const DECK: Record<string, { fa: string; ar: string }> = {
  "Corporate law": { fa: "اساسنامه، مجامع عمومی، هیئت‌مدیره و بازرسان قانونی برای شرکتی که ماندگار بماند چه معنایی دارند.", ar: "ماذا تعني الوثيقة التأسيسية والجمعيات العمومية ومجلس الإدارة والمفتشون القانونيون لشركة تُبنى لتدوم." },
  "Commercial contracts": { fa: "خوانشی عملی از آزادی قراردادی، قطعیت، اجرا و تقسیم ریسک در حقوق ایران.", ar: "قراءة عملية لحرية التعاقد واليقين والتنفيذ وتوزيع المخاطر في القانون الإيراني." },
  "Market entry": { fa: "چرا مجوز سرمایه‌گذاری خارجی چارچوبی برای حمایت است و جایگزین هر مجوز فعالیت نمی‌شود.", ar: "لماذا تُعد موافقة الاستثمار الأجنبي إطار حماية وليست بديلاً عن كل ترخيص تشغيل." },
  "Dispute resolution": { fa: "شرط، قلمرو، مرجع و مسیر اجرا، همه پیش از تشکیل هیئت داوری اهمیت دارند.", ar: "البند والنطاق ومقر التحكيم ومسار التنفيذ كلها مهمة قبل تشكيل هيئة التحكيم." },
  "Intellectual property": { fa: "جست‌وجوی تعارض، انتخاب طبقه‌ها و ثبت علامت پیش از عرضه به بازار.", ar: "فحص التعارض واختيار الفئات وتسجيل العلامة قبل الإطلاق في السوق." },
};

const ORDER = Object.keys(CAT);

export function loc(p: Insight, locale: Locale) {
  const c = String(p.category);
  const title = locale === "fa" ? p.titleFa : locale === "ar" ? (TITLE_AR[c] ?? p.title) : p.title;
  const deck = locale === "en" ? p.deck : (DECK[c]?.[locale] ?? p.deck);
  const category = CAT[c]?.[locale] ?? c;
  const num = /\d+/.exec(String(p.readTime))?.[0] ?? "";
  const read = locale === "fa" ? `${Number(num).toLocaleString("fa-IR")} دقیقه مطالعه` : locale === "ar" ? `${num} دقائق للقراءة` : `${num} min read`;
  return { title, deck, category, read };
}

export function photoFor(p: Insight, fallback = 0) {
  const i = ORDER.indexOf(String(p.category));
  return photoUrl(i >= 0 ? i : fallback);
}

export function matches(p: Insight, q: string, locale: Locale) {
  const k = q.trim().toLowerCase();
  if (!k) return true;
  const v = loc(p, locale);
  return `${v.title} ${v.deck} ${v.category} ${p.title} ${p.titleFa}`.toLowerCase().includes(k);
}
