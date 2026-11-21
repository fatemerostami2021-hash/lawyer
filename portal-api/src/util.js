import { col, meta, save } from './db.js';

const TZ = 'Asia/Tehran';
export const DEFAULT_SETTINGS = {
  office: { name: 'دفتر وکالت دکتر سبحان نیک‌سرشت', phone: '09177892994', address: 'شیراز، خیابان زرگری', whatsapp: '989177892994' },
  bookingOpen: true,
  autoConfirm: false,
  maxAdvanceDays: 30,
  workingDays: [6, 0, 1, 2, 3], // JS getDay(): Sat=6 Sun=0 Mon=1 Tue=2 Wed=3
  hours: { start: '09:00', end: '17:00', breakStart: '12:30', breakEnd: '14:00' },
  daysOff: [],
  types: {
    inperson: { enabled: true, label: 'حضوری', price: 3000000, duration: 60, note: 'دفتر وکالت، شیراز، خیابان زرگری' },
    online: { enabled: true, label: 'آنلاین (ویدیو)', price: 2000000, duration: 45, link: 'https://meet.google.com/' , note: 'لینک جلسه پس از تأیید برای شما ارسال می‌شود' },
    phone: { enabled: true, label: 'تلفنی', price: 1200000, duration: 30, note: 'وکیل در زمان نوبت با شما تماس می‌گیرد' },
  },
};
export function getSettings() {
  const m = meta();
  if (!m.settings) { m.settings = structuredClone(DEFAULT_SETTINGS); save(); }
  return m.settings;
}
export function setSettings(patch) {
  const s = getSettings();
  const merged = { ...s, ...patch, office: { ...s.office, ...(patch.office || {}) }, hours: { ...s.hours, ...(patch.hours || {}) }, types: { ...s.types } };
  for (const k of Object.keys(patch.types || {})) merged.types[k] = { ...s.types[k], ...patch.types[k] };
  meta().settings = merged; save(); return merged;
}

// ---- dates (Tehran time, Jalali display via Intl, no extra libs) ----
export const nowTehran = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  const h = p.hour === '24' ? '00' : p.hour;
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${h}:${p.minute}` };
};
export const todayStr = () => nowTehran().date;
export const addDays = (dateStr, n) => { const d = new Date(dateStr + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const dow = dateStr => new Date(dateStr + 'T12:00:00Z').getUTCDay();
export const fa = (dateStr, opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) => new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'UTC', ...opts }).format(new Date(dateStr + 'T12:00:00Z'));
export const faDigits = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
export const money = n => faDigits(Number(n || 0).toLocaleString('en-US')) + ' تومان';
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fromMin = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export { toMin, fromMin };

export function slotsFor(dateStr, type, ignoreApptId) {
  const s = getSettings();
  const t = s.types[type];
  if (!s.bookingOpen || !t || !t.enabled) return [];
  const now = nowTehran();
  if (dateStr < now.date || dateStr > addDays(now.date, s.maxAdvanceDays)) return [];
  if (!s.workingDays.includes(dow(dateStr)) || s.daysOff.includes(dateStr)) return [];
  const dur = t.duration, start = toMin(s.hours.start), end = toMin(s.hours.end);
  const bs = toMin(s.hours.breakStart), be = toMin(s.hours.breakEnd);
  const busy = [];
  col('appointments').find(a => a.date === dateStr && ['pending', 'confirmed', 'rescheduled'].includes(a.status) && a.id !== ignoreApptId)
    .forEach(a => busy.push([toMin(a.time), toMin(a.time) + a.duration]));
  col('sessions').find(x => x.date === dateStr && x.time).forEach(x => busy.push([toMin(x.time), toMin(x.time) + 90]));
  const out = [];
  for (let m = start; m + dur <= end; m += dur) {
    if (m < be && m + dur > bs) continue; // overlaps lunch break
    if (dateStr === now.date && m <= toMin(now.time) + 30) continue;
    if (busy.some(([a, b]) => m < b && m + dur > a)) continue;
    out.push(fromMin(m));
  }
  return out;
}
export function nextFreeSlots(type, count = 3, fromDate = todayStr(), ignoreApptId) {
  const res = [];
  for (let i = 0; i <= 30 && res.length < count; i++) {
    const d = addDays(fromDate, i);
    for (const t of slotsFor(d, type, ignoreApptId)) { res.push({ date: d, time: t }); if (res.length >= count) break; }
  }
  return res;
}
export const normMobile = raw => {
  const d = String(raw || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g, '');
  let m = d; if (m.startsWith('0098')) m = '0' + m.slice(4); else if (m.startsWith('98')) m = '0' + m.slice(2); else if (m.startsWith('9') && m.length === 10) m = '0' + m;
  return /^09\d{9}$/.test(m) ? m : null;
};
export const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
