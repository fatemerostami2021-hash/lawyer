import { insights } from "@/content/legalContent";
import type { Insight } from "@/content/legalContent";
import type { Locale } from "@/lib/i18n";
import { PHOTOS, photoUrl } from "@/content/ui2";
import { ARTICLES } from "@/content/insightsFull";

export type { Insight };
type L3 = Record<Locale, string>;

// Keyed by the English category used in legalContent.ts
export const CAT: Record<string, L3> = {
  "Corporate law": { en: "Corporate law", fa: "حقوق شرکت‌ها", ar: "قانون الشركات" },
  "Commercial contracts": { en: "Commercial contracts", fa: "قراردادهای تجاری", ar: "العقود التجارية" },
  "Market entry": { en: "Market entry", fa: "ورود به بازار", ar: "دخول السوق" },
  "Dispute resolution": { en: "Dispute resolution", fa: "حل اختلاف", ar: "تسوية المنازعات" },
  "Intellectual property": { en: "Intellectual property", fa: "مالکیت فکری", ar: "الملكية الفكرية" },
};
const ORDER = Object.keys(CAT);

export function loc(p: Insight, locale: Locale) {
  const c = String(p.category);
  const tx = locale === "en" ? undefined : ARTICLES[p.slug]?.[locale];
  const title = locale === "fa" ? (tx?.title ?? p.titleFa) : (tx?.title ?? p.title);
  const deck = tx?.deck ?? p.deck;
  const category = CAT[c]?.[locale] ?? c;
  const num = /\d+/.exec(String(p.readTime))?.[0] ?? "";
  const read = locale === "fa" ? `${Number(num).toLocaleString("fa-IR")} دقیقه مطالعه` : locale === "ar" ? `${num} دقائق للقراءة` : `${num} min read`;
  return { title, deck, category, read };
}

/** Full article text in the chosen language (falls back to English). */
export function body(p: Insight, locale: Locale) {
  const tx = locale === "en" ? undefined : ARTICLES[p.slug]?.[locale];
  return { paragraphs: tx?.paragraphs ?? p.paragraphs, points: tx?.points ?? p.points, caveat: tx?.caveat ?? p.caveat };
}

export function dateFor(p: Insight, locale: Locale) {
  const t = Date.parse(p.date);
  if (Number.isNaN(t)) return p.date;
  try { return new Date(t).toLocaleDateString(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch { return p.date; }
}

const idx = (p: Insight, fallback = 0) => { const i = ORDER.indexOf(String(p.category)); return i >= 0 ? i : fallback; };
export const photoFor = (p: Insight, fallback = 0) => photoUrl(idx(p, fallback));
export const photoNameFor = (p: Insight, fallback = 0) => PHOTOS[idx(p, fallback) % PHOTOS.length];

export function matches(p: Insight, q: string, locale: Locale) {
  const k = q.trim().toLowerCase();
  if (!k) return true;
  const v = loc(p, locale);
  return `${v.title} ${v.deck} ${v.category} ${p.title} ${p.titleFa}`.toLowerCase().includes(k);
}

/** Posts shaped for searchAll(): title/deck already in the visitor's language. */
export function searchPosts(locale: Locale) {
  return insights.map(p => { const v = loc(p, locale); return { slug: p.slug, title: v.title, titleFa: v.title, deck: v.deck }; });
}
