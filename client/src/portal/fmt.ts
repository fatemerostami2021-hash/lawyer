const FA = "۰۱۲۳۴۵۶۷۸۹";
export const fd = (v: any) => String(v ?? "").replace(/\d/g, d => FA[+d]);
export const money = (n: number) => fd(Math.round(n || 0).toLocaleString("en-US")) + " تومان";
export const short = (n: number) => { const a = Math.abs(n); if (a >= 1e9) return fd((n / 1e9).toFixed(1).replace(/\.0$/, "")) + " میلیارد"; if (a >= 1e6) return fd(Math.round(n / 1e6)) + " میلیون"; return fd(n); };
const J = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: "UTC", ...opts });
export const jd = (s?: string, style: "long" | "mid" | "short" | "day" = "mid") => {
  if (!s) return "—"; const d = new Date(s.slice(0, 10) + "T12:00:00Z");
  if (style === "long") return J({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
  if (style === "short") return J({ year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  if (style === "day") return J({ weekday: "short", day: "numeric", month: "long" }).format(d);
  return J({ day: "numeric", month: "long", year: "numeric" }).format(d);
};
export const dt = (iso?: string) => { if (!iso) return ""; const d = new Date(iso); return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: "Asia/Tehran", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d); };
export const today = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" })).toLocaleDateString("en-CA");
export const addDays = (s: string, n: number) => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const daysTo = (s: string) => Math.round((new Date(s + "T12:00:00Z").getTime() - new Date(today() + "T12:00:00Z").getTime()) / 864e5);
export const rel = (s: string) => { const n = daysTo(s); return n === 0 ? "امروز" : n === 1 ? "فردا" : n === -1 ? "دیروز" : n > 0 ? `${fd(n)} روز دیگر` : `${fd(-n)} روز پیش`; };
export const size = (b: number) => (b > 1e6 ? fd((b / 1e6).toFixed(1)) + " MB" : fd(Math.round(b / 1e3)) + " KB");
export const waLink = (mobile: string, text = "") => `https://wa.me/98${mobile.replace(/^0/, "")}${text ? "?text=" + encodeURIComponent(text) : ""}`;

// Jalali month grid built from Intl (no library)
const parts = (s: string) => { const p: any = Object.fromEntries(new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", { timeZone: "UTC", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date(s + "T12:00:00Z")).map(x => [x.type, x.value])); return { y: +p.year, m: +p.month, d: +p.day }; };
export function jalaliMonth(refGregorian: string) {
  const { d, y, m } = parts(refGregorian); const first = addDays(refGregorian, -(d - 1));
  let len = 0; while (parts(addDays(first, len)).m === m && len < 32) len++;
  const dow = (new Date(first + "T12:00:00Z").getUTCDay() + 1) % 7; // Saturday = 0
  const cells: ({ date: string; day: number } | null)[] = Array(dow).fill(null);
  for (let i = 0; i < len; i++) cells.push({ date: addDays(first, i), day: i + 1 });
  while (cells.length % 7) cells.push(null);
  return { year: y, month: m, first, len, cells, title: J({ month: "long", year: "numeric" }).format(new Date(first + "T12:00:00Z")), prev: addDays(first, -1), next: addDays(first, len) };
}

export const APPT: Record<string, [string, string]> = { pending: ["در انتظار تأیید", "amber"], confirmed: ["تأیید شده", "green"], rejected: ["رد شده", "red"], rescheduled: ["زمان جدید پیشنهاد شد", "blue"], done: ["انجام شد", "gray"], cancelled: ["لغو شد", "gray"], noshow: ["عدم حضور", "red"] };
export const CASE_ST: Record<string, [string, string]> = { preparation: ["در حال بررسی", "blue"], active: ["در جریان", "green"], awaiting: ["منتظر رأی", "amber"], closed: ["مختومه", "gray"] };
export const TYPES: Record<string, string> = { inperson: "حضوری", online: "آنلاین", phone: "تلفنی" };
export const CASE_TYPES: Record<string, string> = { company: "ثبت و ساختار شرکت", contract: "قراردادهای تجاری", fippa: "سرمایه‌گذاری خارجی (FIPPA)", arbitration: "داوری تجاری", ip: "مالکیت فکری و علامت تجاری", property: "دعاوی ملکی", family: "خانواده", criminal: "کیفری", labor: "کار و تأمین اجتماعی", tax: "مالیاتی" };
