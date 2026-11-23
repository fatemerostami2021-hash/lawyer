// @ts-nocheck
// Browser-side demo engine: a tiny in-browser "server" so the Vercel demo works with no backend.
// Data lives in localStorage; Telegram is simulated (see tgSend / TgPanel).
export const KEY = "pt_demo_db_v1";
export const SESS = "pt_demo_session_v1";
const COLS = ["users", "clients", "cases", "sessions", "deadlines", "appointments", "documents", "payments", "messages", "logs", "otps", "notes", "tg"];
let state: any = null;
const fresh = () => { const s: any = { meta: { seq: 1000, settings: null } }; COLS.forEach(c => (s[c] = [])); return s; };
export function db() {
  if (!state) {
    try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch {}
    if (!state || !state.meta) { state = fresh(); seedAll(); persistNow(); }
  }
  return state;
}
let timer: any;
export const save = () => { clearTimeout(timer); timer = setTimeout(persistNow, 150); };
export function persistNow() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full: demo keeps working in memory */ } }
export function resetDemo() { state = fresh(); seedAll(); persistNow(); localStorage.removeItem(SESS + "_staff"); localStorage.removeItem(SESS + "_client"); }
export const nextId = (prefix = "id") => `${prefix}_${++db().meta.seq}`;
export function col(name: string) {
  return {
    all: () => db()[name],
    find: (fn = () => true) => db()[name].filter(fn),
    get: (id: string) => db()[name].find((x: any) => x.id === id),
    one: (fn: any) => db()[name].find(fn),
    insert(doc: any) { const d = { id: doc.id || nextId(name.slice(0, 3)), createdAt: new Date().toISOString(), ...doc }; db()[name].push(d); save(); return d; },
    update(id: string, patch: any) { const d = db()[name].find((x: any) => x.id === id); if (!d) return null; Object.assign(d, patch, { updatedAt: new Date().toISOString() }); save(); return d; },
    remove(id: string) { const i = db()[name].findIndex((x: any) => x.id === id); if (i < 0) return false; db()[name].splice(i, 1); save(); return true; },
    removeWhere(fn: any) { const b = db()[name].length; db()[name] = db()[name].filter((x: any) => !fn(x)); save(); return b - db()[name].length; },
  };
}

// ---------------- settings & dates ----------------

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
  const m = db().meta;
  if (!m.settings) { m.settings = structuredClone(DEFAULT_SETTINGS); save(); }
  return m.settings;
}
export function setSettings(patch) {
  const s = getSettings();
  const merged = { ...s, ...patch, office: { ...s.office, ...(patch.office || {}) }, hours: { ...s.hours, ...(patch.hours || {}) }, types: { ...s.types } };
  for (const k of Object.keys(patch.types || {})) merged.types[k] = { ...s.types[k], ...patch.types[k] };
  db().meta.settings = merged; save(); return merged;
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

// ---------------- seed ----------------
// Sample data: 20 FICTIONAL clients (names, numbers and cases are invented for the demo).
// Case categories/courts/fees are modelled on the practice areas of a corporate & commercial law office.

export const CASE_TYPES = { company: 'ثبت و ساختار شرکت', contract: 'قراردادهای تجاری', fippa: 'سرمایه‌گذاری خارجی (FIPPA)', arbitration: 'داوری تجاری', ip: 'مالکیت فکری و علامت تجاری', property: 'دعاوی ملکی', family: 'خانواده', criminal: 'کیفری', labor: 'کار و تأمین اجتماعی', tax: 'مالیاتی' };
const T = todayStr(), d = n => addDays(T, n);
const M = 1e6;

const C = [
  // name, kind, mobile, idNo, city, email, contact, source, cases[]
  ['شرکت پارس‌نوین صنعت', 'legal', '09120000001', '14009876543', 'شیراز', 'info@parsnovin.example', 'آرش کیانی (مدیرعامل)', 'معرفی دوستان', [['تغییر ساختار سهامداران و افزایش سرمایه', 'company', 'اداره ثبت شرکت‌ها و مالکیت صنعتی شیراز', 'active', 90, 0.6, [12, '10:00']]]],
  ['سارا احمدی‌نژاد', 'real', '09120000002', '2370011223', 'شیراز', 'sara.a@example.com', '', 'اینستاگرام', [['مطالبه وجه چک — ۱٫۲ میلیارد ریال', 'contract', 'شعبه ۱۲ دادگاه عمومی حقوقی شیراز', 'active', 45, 0.5, [5, '09:30']]]],
  ['گروه تجاری آریاسان', 'legal', '09120000003', '10320981234', 'تهران', 'legal@aryasan.example', 'مهندس نیما فرهمند', 'وب‌سایت', [['تنظیم قرارداد توزیع انحصاری', 'contract', 'دفتر وکالت', 'preparation', 60, 0.3, null], ['ثبت علامت تجاری «آریاسان»', 'ip', 'اداره مالکیت صنعتی', 'active', 35, 1, null]]],
  ['محمدرضا شیرازی', 'real', '09120000004', '2280045671', 'شیراز', '', '', 'مراجعه حضوری', [['دعوی تخلیه و مطالبه اجاره‌بها', 'property', 'شعبه ۷ دادگاه عمومی حقوقی شیراز', 'active', 30, 0.4, [18, '11:00']]]],
  ['شرکت فناوران کوروش', 'legal', '09120000005', '14011223344', 'شیراز', 'ceo@koroush-tech.example', 'دکتر پریسا مهدوی', 'معرفی همکار', [['جذب سرمایه‌گذار خارجی (FIPPA)', 'fippa', 'سازمان سرمایه‌گذاری و کمک‌های اقتصادی و فنی', 'active', 150, 0.5, [25, '10:30']]]],
  ['علی‌اکبر محمدی', 'real', '09120000006', '2290077881', 'مرودشت', '', '', 'تلگرام', [['اعتراض به رأی — تجدیدنظرخواهی', 'property', 'شعبه ۳ دادگاه تجدیدنظر استان فارس', 'awaiting', 40, 0.75, null]]],
  ['شرکت سپهر کالا', 'legal', '09120000007', '14005566778', 'اصفهان', 'contracts@sepehrkala.example', 'مهدی نصیری', 'وب‌سایت', [['داوری — اختلاف قرارداد تأمین', 'arbitration', 'مرکز داوری اتاق بازرگانی شیراز', 'active', 120, 0.45, [9, '14:30']]]],
  ['نرگس حسینی', 'real', '09120000008', '2310099123', 'شیراز', 'narges.h@example.com', '', 'گوگل', [['دعوی مهریه و نفقه', 'family', 'شعبه ۵ دادگاه خانواده شیراز', 'active', 35, 0.5, [14, '09:00']]]],
  ['استارتاپ دیجی‌راهبر', 'legal', '09120000009', '14012345678', 'شیراز', 'hello@digirahbar.example', 'امیرحسین جعفری', 'لینکدین', [['تأسیس شرکت و تنظیم سهامداران', 'company', 'اداره ثبت شرکت‌ها', 'closed', 25, 1, null]]],
  ['بهرام قاسمی', 'real', '09120000010', '2250033445', 'کازرون', '', '', 'معرفی دوستان', [['دفاع در پرونده کیفری — خیانت در امانت', 'criminal', 'شعبه ۲ دادگاه کیفری دو شیراز', 'active', 80, 0.5, [7, '08:30']]]],
  ['شرکت بازرگانی خلیج‌گستر', 'legal', '09120000011', '10101998877', 'بوشهر', 'legal@khalijgostar.example', 'کاپیتان رضا بهرامی', 'همایش', [['قرارداد صادرات به امارات', 'contract', 'دفتر وکالت', 'active', 70, 0.7, null], ['ثبت شعبه در منطقه آزاد', 'company', 'سازمان منطقه آزاد', 'preparation', 40, 0.25, null]]],
  ['فاطمه زارعی', 'real', '09120000012', '2340066554', 'شیراز', 'f.zarei@example.com', '', 'اینستاگرام', [['مطالبه خسارت تأخیر تأدیه', 'contract', 'شعبه ۹ دادگاه عمومی حقوقی', 'awaiting', 28, 0.5, null]]],
  ['شرکت نگین پلاست', 'legal', '09120000013', '14003344556', 'شیراز', 'office@negin-plast.example', 'حاج‌آقا ابراهیمی', 'معرفی دوستان', [['اختلاف کارگری — شکایت ۴ نفر از کارگران', 'labor', 'هیئت تشخیص اداره کار شیراز', 'active', 50, 0.6, [11, '10:00']]]],
  ['حمید سلطانی', 'real', '09120000014', '2260088990', 'شیراز', '', '', 'گوگل', [['ابطال سند معارض ملکی', 'property', 'شعبه ۱۵ دادگاه عمومی حقوقی', 'active', 65, 0.4, [21, '10:00']]]],
  ['شرکت دانش‌بنیان آوین‌تک', 'legal', '09120000015', '14015556677', 'شیراز', 'ip@avintech.example', 'دکتر کامران صادقی', 'وب‌سایت', [['ثبت اختراع و علامت تجاری', 'ip', 'اداره مالکیت صنعتی', 'active', 55, 0.5, null]]],
  ['لیلا رحیمی', 'real', '09120000016', '2320044332', 'شیراز', 'leila.r@example.com', '', 'مراجعه حضوری', [['دعوی طلاق توافقی', 'family', 'شعبه ۲ دادگاه خانواده', 'closed', 15, 1, null]]],
  ['مجتمع تجاری ستاره', 'legal', '09120000017', '10203040506', 'شیراز', 'admin@setareh-mall.example', 'مهندس ایمانی', 'معرفی همکار', [['اختلاف مالکین و اجاره‌داران واحدها', 'property', 'شعبه ۴ دادگاه عمومی حقوقی', 'active', 180, 0.35, [16, '11:30']]]],
  ['پژمان کریمی', 'real', '09120000018', '2300077665', 'شیراز', '', '', 'تلگرام', [['اعتراض به برگ تشخیص مالیات', 'tax', 'هیئت حل اختلاف مالیاتی', 'active', 30, 0.5, [30, '09:00']]]],
  ['شرکت ایران‌خودرو‌یار (شعبه فارس)', 'legal', '09120000019', '14008899001', 'شیراز', 'fars@khodroyar.example', 'سعید توکلی', 'همایش', [['مشاوره حقوقی ماهانه (قرارداد وکالت سالانه)', 'contract', 'دفتر وکالت', 'active', 240, 0.8, null]]],
  ['مریم عباسی', 'real', '09120000020', '2330011009', 'شیراز', 'maryam.abbasi@example.com', '', 'اینستاگرام', [['تنظیم وصیت‌نامه و انحصار وراثت', 'family', 'شورای حل اختلاف', 'preparation', 20, 0.5, null]]],
];

const STAT_FA = { preparation: 'در حال بررسی', active: 'در جریان', awaiting: 'منتظر رأی', closed: 'مختومه' };
const DOCS = [['وکالت‌نامه', 'pdf'], ['کپی کارت ملی', 'jpg'], ['قرارداد', 'pdf'], ['دادخواست', 'pdf'], ['لایحه دفاعیه', 'docx'], ['رسید پرداخت', 'pdf'], ['اظهارنامه', 'pdf']];
const DOC_CAT = { 'وکالت‌نامه': 'هویتی و وکالت', 'کپی کارت ملی': 'هویتی و وکالت', 'قرارداد': 'قراردادها', 'دادخواست': 'دادگاهی', 'لایحه دفاعیه': 'دادگاهی', 'رسید پرداخت': 'مالی', 'اظهارنامه': 'دادگاهی' };

export function seedAll() {
  const s = getSettings(); void s;
  let n = 0;
  col('users').insert({ id: 'u_lawyer', username: 'lawyer', name: 'دکتر سبحان نیک‌سرشت', role: 'lawyer' });
  col('users').insert({ id: 'u_assistant', username: 'assistant', name: 'منشی دفتر', role: 'assistant' });
  C.forEach(([name, kind, mobile, idNo, city, email, contact, source, cases], ci) => {
    const client = col('clients').insert({ name, kind, mobile, idNo, city, email, contact, source, address: city === 'شیراز' ? 'شیراز، ' + ['بلوار چمران', 'خیابان معالی‌آباد', 'بلوار ارم', 'خیابان ملاصدرا', 'بلوار قصردشت'][ci % 5] : city, status: 'active', verified: true, joinedAt: d(-(400 - ci * 17)), createdAt: new Date(Date.now() - (400 - ci * 17) * 864e5).toISOString() });
    cases.forEach(([title, type, court, status, fee, paidFrac, sess], k) => {
      const caseNo = `1405${String(9000 + ci * 7 + k).padStart(4, '0')}${String(Math.floor(((ci + 3) * 7919) % 99999)).padStart(5, '0')}`;
      const opened = d(-(120 - ci * 4 - k * 9));
      const cs = col('cases').insert({ clientId: client.id, title, type, court, caseNo, status, fee: fee * M, opened, branchNote: '', timeline: [
        { date: opened, text: 'افتتاح پرونده و دریافت وکالت‌نامه' },
        { date: addDays(opened, 6), text: 'بررسی مدارک و تدوین استراتژی' },
        ...(status !== 'preparation' ? [{ date: addDays(opened, 21), text: type === 'company' || type === 'ip' ? 'تنظیم و ارائه مدارک به مرجع ثبت' : 'تقدیم دادخواست/درخواست به مرجع صالح' }] : []),
        ...(status === 'awaiting' ? [{ date: d(-9), text: 'برگزاری جلسه نهایی و ختم رسیدگی؛ منتظر صدور رأی' }] : []),
        ...(status === 'closed' ? [{ date: d(-20), text: 'پرونده با موفقیت مختومه شد' }] : []),
      ] });
      // finance: 2 invoices
      const total = fee * M, first = Math.round(total * 0.5), second = total - first, paid = Math.round(total * paidFrac);
      const hist = (amt, salt) => amt > 0 ? [{ date: d(-(4 + ((ci * 13 + k * 29 + salt * 41) % 175))), amount: amt, method: ['کارت به کارت', 'واریز بانکی', 'نقدی', 'پوز'][(ci + salt) % 4] }] : [];
      col('payments').insert({ clientId: client.id, caseId: cs.id, title: 'پیش‌پرداخت حق‌الوکاله', amount: first, paid: Math.min(paid, first), history: hist(Math.min(paid, first), 1), dueDate: opened, invoiceNo: `INV-${1405000 + ++n}` });
      col('payments').insert({ clientId: client.id, caseId: cs.id, title: 'مرحله دوم حق‌الوکاله', amount: second, paid: Math.max(0, paid - first), history: hist(Math.max(0, paid - first), 2), dueDate: d(15 + ci), invoiceNo: `INV-${1405000 + ++n}` });
      if (sess) col('sessions').insert({ caseId: cs.id, clientId: client.id, date: d(sess[0]), time: sess[1], court, kind: 'جلسه رسیدگی', note: '' });
      if (status === 'active' || status === 'awaiting') {
        col('sessions').insert({ caseId: cs.id, clientId: client.id, date: d(-(30 + ci)), time: '09:00', court, kind: 'جلسه رسیدگی', note: 'برگزار شد — جلسه بعدی تعیین گردید', done: true });
        col('deadlines').insert({ caseId: cs.id, clientId: client.id, title: ['مهلت تقدیم لایحه', 'مهلت پرداخت هزینه کارشناسی', 'مهلت اعتراض', 'مهلت ارائه مستندات'][(ci + k) % 4], date: d(3 + ((ci * 5 + k * 3) % 25)), done: false });
      }
      // documents
      [0, 1, 2].forEach(i => { const [dn, ext] = DOCS[(ci + i + k) % DOCS.length]; col('documents').insert({ clientId: client.id, caseId: cs.id, name: `${dn} — ${title.slice(0, 22)}`, category: DOC_CAT[dn], ext, size: 80000 + ((ci * 37 + i * 91) % 400) * 1000, sample: true, by: i === 1 ? 'client' : 'office', visibleToClient: true }); });
    });
    col('notes').insert({ clientId: client.id, text: ci % 3 === 0 ? 'موکل ترجیح می‌دهد تماس‌ها بعد از ساعت ۱۶ باشد.' : 'مدارک اصلی تحویل دفتر شده است.', by: 'دکتر نیک‌سرشت' });
  });

  // appointments: history + upcoming + 3 pending
  const cl = col('clients').all(); const A = (i, off, time, type, status, topic) => col('appointments').insert({ clientId: cl[i].id, name: cl[i].name, mobile: cl[i].mobile, date: d(off), time, type, duration: getSettings().types[type].duration, status, topic, source: 'portal', ...(status === 'confirmed' ? { meetLink: type === 'online' ? getSettings().types.online.link : '' } : {}) });
  A(0, -12, '10:00', 'inperson', 'done', 'بررسی مدارک افزایش سرمایه'); A(3, -8, '11:00', 'phone', 'done', 'پیگیری وضعیت پرونده'); A(6, -5, '15:00', 'online', 'done', 'مرور پیش‌نویس لایحه');
  A(1, 1, '10:00', 'inperson', 'confirmed', 'آماده‌سازی جلسه دادگاه'); A(4, 2, '15:00', 'online', 'confirmed', 'مذاکره با سرمایه‌گذار'); A(8, 3, '09:00', 'phone', 'confirmed', 'مشاوره قرارداد سهامداری');
  A(10, 4, '11:00', 'online', 'confirmed', 'بازبینی قرارداد صادرات'); A(18, 5, '10:00', 'inperson', 'confirmed', 'جلسه قرارداد سالانه');
  A(2, 2, '11:00', 'inperson', 'pending', 'مشاوره درباره قرارداد توزیع'); A(11, 3, '14:30', 'phone', 'pending', 'پرسش درباره روند اجرای حکم'); A(19, 4, '09:00', 'online', 'pending', 'مشاوره وصیت‌نامه');

  // messages
  const msg = (i, from, text, off = 0, read = true) => col('messages').insert({ clientId: cl[i].id, from, text, read, createdAt: new Date(Date.now() - off * 36e5).toISOString() });
  msg(1, 'client', 'سلام آقای دکتر، لایحه جدید رو آپلود کردم، لطفاً بررسی بفرمایید.', 30, false); msg(1, 'office', 'سلام، دریافت شد. تا فردا بررسی می‌کنم.', 28);
  msg(4, 'client', 'پیش‌نویس قرارداد سرمایه‌گذار آماده است؟', 6, false); msg(7, 'client', 'تاریخ جلسه بعدی دادگاه مشخص شده؟', 50); msg(7, 'office', 'بله، ۱۴ روز دیگر ساعت ۹ صبح. یادآوری می‌کنم.', 49);
  [0, 6, 12].forEach((i, j) => msg(i, 'office', 'یادآوری: لطفاً مدارک تکمیلی را در پورتال بارگذاری کنید.', 70 + j * 5));

  // activity log
  const acts = ['ورود به سیستم', 'ایجاد پرونده', 'آپلود مدرک', 'ثبت پرداخت', 'تأیید نوبت', 'ویرایش اطلاعات موکل'];
  for (let i = 0; i < 25; i++) col('logs').insert({ actorId: 'u_lawyer', actorName: i % 4 === 0 ? 'منشی دفتر' : 'دکتر سبحان نیک‌سرشت', role: i % 4 === 0 ? 'assistant' : 'lawyer', action: acts[i % acts.length], detail: cl[i % cl.length].name, ip: '127.0.0.1', createdAt: new Date(Date.now() - i * 5.3 * 36e5).toISOString() });
  return { clients: col('clients').all().length, cases: col('cases').all().length };
}
export { STAT_FA };



// ---------------- simulated Telegram (what the real bot does, shown inside the admin panel) ----------------
export const apptText = (a: any, c: any) => [
  `📅 <b>درخواست نوبت جدید</b>`,
  `👤 ${esc(c?.name || a.name)}  |  📱 ${faDigits(a.mobile || c?.mobile || "")}`,
  `🏷 نوع: ${esc(getSettings().types[a.type]?.label || a.type)}  |  ⏱ ${faDigits(a.duration)} دقیقه`,
  `🗓 ${fa(a.date)} — ساعت ${faDigits(a.time)}`,
  a.topic ? `📝 موضوع: ${esc(a.topic)}` : "",
  a.status === "confirmed" ? "✅ تأیید شده" : a.status === "rejected" ? "❌ رد شده" : a.status === "rescheduled" ? "🕐 زمان دیگری پیشنهاد شد" : a.status === "cancelled" ? "⚠️ لغو شد" : "⏳ در انتظار تصمیم شما",
].filter(Boolean).join("\n");
export const apptButtons = (a: any) => [[{ text: "✅ تأیید", data: `ap:ok:${a.id}` }, { text: "❌ رد", data: `ap:no:${a.id}` }], [{ text: "🕐 پیشنهاد زمان دیگر", data: `ap:re:${a.id}` }]];
export const tgSend = (text: string, buttons: any = null, extra: any = {}) => col("tg").insert({ from: "bot", text, buttons, seen: false, ...extra });
export function notifyNewAppointment(a: any) { tgSend(apptText(a, col("clients").get(a.clientId)), a.status === "pending" ? apptButtons(a) : null, { apptId: a.id }); }
export function applyDecision(id: string, decision: string, by = "پنل", extra: any = {}) {
  const a = col("appointments").get(id);
  if (!a) return { error: "نوبت پیدا نشد" };
  const s = getSettings(); let patch: any, msg: string;
  if (decision === "ok") { patch = { status: "confirmed", decidedBy: by, decidedAt: new Date().toISOString(), meetLink: a.type === "online" ? (s.types.online.link || "") : "" }; msg = `✅ نوبت شما برای ${fa(a.date)} ساعت ${faDigits(a.time)} (${s.types[a.type]?.label}) تأیید شد.${a.type === "online" ? " لینک جلسه در بخش نوبت‌ها قابل مشاهده است." : ""}`; }
  else if (decision === "no") { patch = { status: "rejected", decidedBy: by, decidedAt: new Date().toISOString(), reason: extra.reason || "" }; msg = `متأسفانه درخواست نوبت شما برای ${fa(a.date)} ساعت ${faDigits(a.time)} در این زمان امکان‌پذیر نیست.${extra.reason ? " توضیح: " + extra.reason : ""} لطفاً زمان دیگری را انتخاب کنید.`; }
  else if (decision === "resched") { patch = { status: "rescheduled", decidedBy: by, proposed: { date: extra.date, time: extra.time } }; msg = `زمان پیشنهادی وکیل: ${fa(extra.date)} ساعت ${faDigits(extra.time)}. لطفاً در بخش نوبت‌ها تأیید یا رد کنید.`; }
  else return { error: "نامعتبر" };
  const upd = col("appointments").update(id, patch);
  col("messages").insert({ clientId: a.clientId, from: "office", text: msg, read: false, kind: "appointment", apptId: id });
  syncTg(upd);
  return { appt: upd, msg };
}
export function syncTg(a: any) { col("tg").find((m: any) => m.apptId === a.id).forEach((m: any) => col("tg").update(m.id, { text: apptText(a, col("clients").get(a.clientId)), buttons: a.status === "pending" ? apptButtons(a) : null })); }
export function tgCallback(msgId: string, data: string) {
  const [ns, act, id, ...rest] = data.split(":"); const extra = rest.join(":");
  const a = col("appointments").get(id); if (ns !== "ap" || !a) return;
  const c = col("clients").get(a.clientId);
  if (act === "re") {
    const slots = nextFreeSlots(a.type, 4, todayStr(), a.id); if (!slots.length) return;
    const kb = slots.map((s: any) => [{ text: `${fa(s.date, { weekday: "short", day: "numeric", month: "long" })} — ${faDigits(s.time)}`, data: `ap:sl:${id}:${s.date}T${s.time}` }]);
    kb.push([{ text: "↩️ بازگشت", data: `ap:bk:${id}` }]);
    col("tg").update(msgId, { text: apptText(a, c) + "\n\n<b>یکی از زمان‌های خالی را پیشنهاد دهید:</b>", buttons: kb });
  } else if (act === "bk") syncTg(a);
  else if (act === "sl") { const [date, time] = extra.split("T"); applyDecision(id, "resched", "تلگرام", { date, time }); }
  else if (act === "ok" || act === "no") applyDecision(id, act, "تلگرام");
}
export function agendaToday() {
  const d = todayStr();
  const apps = col("appointments").find((a: any) => a.date === d && a.status === "confirmed").sort((x: any, y: any) => x.time.localeCompare(y.time));
  const ses = col("sessions").find((s: any) => s.date === d);
  const lines = [`📆 <b>برنامه امروز — ${fa(d)}</b>`];
  if (!apps.length && !ses.length) lines.push("برنامه‌ای برای امروز ثبت نشده.");
  apps.forEach((a: any) => lines.push(`🤝 ${faDigits(a.time)} — ${esc(col("clients").get(a.clientId)?.name)} (${esc(getSettings().types[a.type]?.label)})`));
  ses.forEach((s: any) => lines.push(`⚖️ ${faDigits(s.time || "--")} — ${esc(s.court)} | ${esc(col("cases").get(s.caseId)?.title || "")}`));
  return lines.join("\n");
}
export function tgCommand(cmd: string) {
  col("tg").insert({ from: "me", text: esc(cmd), buttons: null, seen: true });
  if (cmd === "/today") tgSend(agendaToday());
  else if (cmd === "/pending") { const p = col("appointments").find((a: any) => a.status === "pending"); if (!p.length) tgSend("نوبت در انتظاری وجود ندارد 👌"); p.forEach((a: any) => tgSend(apptText(a, col("clients").get(a.clientId)), apptButtons(a), { apptId: a.id })); }
  else if (cmd === "/stats") { const due = col("payments").all().reduce((s: number, p: any) => s + (p.amount - (p.paid || 0)), 0); tgSend(`📊 <b>آمار</b>\nموکلان: ${faDigits(col("clients").all().length)}\nپرونده‌های فعال: ${faDigits(col("cases").find((c: any) => c.status !== "closed").length)}\nنوبت‌های در انتظار: ${faDigits(col("appointments").find((a: any) => a.status === "pending").length)}\nمطالبات معوق: ${money(due)}`); }
}
