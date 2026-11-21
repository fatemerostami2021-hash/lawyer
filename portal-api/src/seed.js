// Sample data: 20 FICTIONAL clients (names, numbers and cases are invented for the demo).
// Case categories/courts/fees are modelled on the practice areas of a corporate & commercial law office.
import { col, reset, flush, nextId } from './db.js';
import { addDays, todayStr, getSettings } from './util.js';

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

export function seed() {
  reset();
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
  flush();
  return { clients: col('clients').all().length, cases: col('cases').all().length };
}
export { STAT_FA };

if (process.argv[1] && process.argv[1].endsWith('seed.js')) { console.log('Seeded:', seed()); process.exit(0); }
