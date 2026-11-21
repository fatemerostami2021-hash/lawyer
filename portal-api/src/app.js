import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import ExcelJS from 'exceljs';
import { CFG } from './config.js';
import { col, DATA_DIR } from './db.js';
import { issue, clear, staff, lawyerOnly, clientOnly, safeEq, log } from './auth.js';
import { getSettings, setSettings, slotsFor, normMobile, todayStr, addDays, fa, faDigits, money, nowTehran, esc } from './util.js';
import { sendOwner, notifyNewAppointment, applyDecision, tgInfo } from './telegram.js';
import { CASE_TYPES, seed } from './seed.js';

export const router = express.Router();
const UP = path.join(DATA_DIR, '..', 'uploads'); fs.mkdirSync(UP, { recursive: true });
const OK_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc', '.xlsx', '.txt'];
const fixName = n => { try { return Buffer.from(n, 'latin1').toString('utf8'); } catch { return n; } };
const upload = multer({ storage: multer.diskStorage({ destination: UP, filename: (_r, f, cb) => cb(null, crypto.randomBytes(12).toString('hex') + path.extname(f.originalname).toLowerCase()) }), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_r, f, cb) => cb(OK_EXT.includes(path.extname(f.originalname).toLowerCase()) ? null : new Error('فرمت فایل مجاز نیست'), OK_EXT.includes(path.extname(f.originalname).toLowerCase())) });
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bal = p => p.amount - (p.paid || 0);

// tiny in-memory rate limiter
const hits = new Map();
const limit = (key, max, ms) => { const now = Date.now(); const a = (hits.get(key) || []).filter(t => now - t < ms); a.push(now); hits.set(key, a); return a.length > max; };

// ------------------------------------------------------------------ auth
router.post('/auth/staff-login', wrap(async (req, res) => {
  const { username, password } = req.body || {};
  if (limit('sl:' + req.ip, 10, 600000)) return res.status(429).json({ error: 'تلاش‌های زیاد؛ چند دقیقه بعد دوباره امتحان کنید' });
  const isL = safeEq(username || '', CFG.lawyerUser) & safeEq(password || '', CFG.lawyerPass);
  const isA = safeEq(username || '', CFG.assistantUser) & safeEq(password || '', CFG.assistantPass);
  if (!isL && !isA) { log(req, 'ورود ناموفق', String(username).slice(0, 30), { id: null, name: 'ناشناس', role: 'guest' }); return res.status(401).json({ error: 'نام کاربری یا رمز عبور نادرست است' }); }
  const u = col('users').get(isL ? 'u_lawyer' : 'u_assistant');
  await issue(res, { sub: u.id, name: u.name, role: u.role }, 2);
  log(req, 'ورود به پنل', '', { id: u.id, name: u.name, role: u.role });
  res.json({ user: { id: u.id, name: u.name, role: u.role } });
}));

const sha = s => crypto.createHash('sha256').update(s + CFG.jwtSecret).digest('hex');
async function sendSms(mobile, code) {
  const key = process.env.SMSIR_API_KEY, tpl = process.env.SMSIR_TEMPLATE_ID;
  if (!key || !tpl) return false;
  try { const r = await fetch('https://api.sms.ir/v1/send/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-KEY': key }, body: JSON.stringify({ mobile, templateId: Number(tpl), parameters: [{ name: 'Code', value: code }] }) }); return r.ok; } catch { return false; }
}
router.post('/auth/otp/request', wrap(async (req, res) => {
  const mobile = normMobile(req.body?.mobile);
  if (!mobile) return res.status(400).json({ error: 'شماره موبایل معتبر نیست (مثال: 09123456789)' });
  if (limit('otp:' + mobile, 5, 3600000) || limit('otpip:' + req.ip, 20, 3600000)) return res.status(429).json({ error: 'تعداد درخواست کد زیاد است؛ بعداً دوباره امتحان کنید' });
  const last = col('otps').find(o => o.mobile === mobile).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (last && Date.now() - new Date(last.createdAt).getTime() < 45000) return res.status(429).json({ error: 'برای دریافت کد جدید کمی صبر کنید' });
  col('otps').removeWhere(o => o.mobile === mobile);
  const code = String(crypto.randomInt(10000, 99999));
  col('otps').insert({ mobile, hash: sha(code), expires: Date.now() + 120000, tries: 0 });
  const exists = !!col('clients').one(c => c.mobile === mobile);
  const sent = await sendSms(mobile, code);
  if (!sent) sendOwner(`🔐 <b>کد ورود موکل (دمو)</b>\n📱 ${faDigits(mobile)}\nکد: <code>${code}</code>`);
  res.json({ ok: true, exists, ttl: 120, ...(CFG.demoShowOtp && !sent ? { demoCode: code } : {}) });
}));
router.post('/auth/otp/verify', wrap(async (req, res) => {
  const mobile = normMobile(req.body?.mobile); const code = String(req.body?.code || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
  const o = col('otps').one(x => x.mobile === mobile);
  if (!o || o.expires < Date.now()) return res.status(400).json({ error: 'کد منقضی شده؛ کد جدید بگیرید' });
  if (o.tries >= 5) { col('otps').remove(o.id); return res.status(429).json({ error: 'تلاش زیاد؛ کد جدید بگیرید' }); }
  if (sha(code) !== o.hash) { col('otps').update(o.id, { tries: o.tries + 1 }); return res.status(400).json({ error: 'کد اشتباه است' }); }
  col('otps').remove(o.id);
  let c = col('clients').one(x => x.mobile === mobile);
  if (!c) {
    const name = String(req.body?.name || '').trim().slice(0, 80);
    if (name.length < 3) return res.status(400).json({ error: 'برای ثبت‌نام، نام و نام خانوادگی را وارد کنید', needName: true });
    c = col('clients').insert({ name, kind: 'real', mobile, idNo: '', city: '', email: '', address: '', source: 'ثبت‌نام آنلاین', status: 'new', verified: true, joinedAt: todayStr() });
    log(req, 'ثبت‌نام موکل جدید', name, { id: c.id, name, role: 'client' });
    sendOwner(`🆕 <b>موکل جدید ثبت‌نام کرد</b>\n👤 ${esc(name)}\n📱 ${faDigits(mobile)}`);
    col('messages').insert({ clientId: c.id, from: 'office', text: 'به پورتال موکلان خوش آمدید. از اینجا می‌توانید نوبت بگیرید، مدارک بارگذاری کنید و روند پرونده را ببینید.', read: false });
  }
  await issue(res, { sub: c.id, name: c.name, role: 'client' }, 14);
  res.json({ user: { id: c.id, name: c.name, role: 'client' }, isNew: c.status === 'new' });
}));
router.get('/auth/me', (req, res) => res.json({ user: req.auth ? { id: req.auth.sub, name: req.auth.name, role: req.auth.role } : null }));
router.post('/auth/logout', (req, res) => { clear(res); res.json({ ok: true }); });

// ------------------------------------------------------------------ public booking info
router.get('/public/booking', (_q, res) => { const s = getSettings(); res.json({ open: s.bookingOpen, maxAdvanceDays: s.maxAdvanceDays, types: Object.fromEntries(Object.entries(s.types).filter(([, t]) => t.enabled).map(([k, t]) => [k, { label: t.label, price: t.price, duration: t.duration, note: t.note }])), office: s.office, today: todayStr(), tehranNow: nowTehran() }); });
router.get('/public/slots', (req, res) => res.json({ slots: slotsFor(String(req.query.date || ''), String(req.query.type || '')) }));
router.get('/public/meta', (_q, res) => res.json({ caseTypes: CASE_TYPES }));

// ------------------------------------------------------------------ helpers
const clientFull = id => {
  const c = col('clients').get(id); if (!c) return null;
  const cases = col('cases').find(x => x.clientId === id);
  return { ...c, cases, sessions: col('sessions').find(x => x.clientId === id).sort((a, b) => a.date.localeCompare(b.date)), deadlines: col('deadlines').find(x => x.clientId === id), appointments: col('appointments').find(x => x.clientId === id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), documents: col('documents').find(x => x.clientId === id), payments: col('payments').find(x => x.clientId === id), notes: col('notes').find(x => x.clientId === id), balance: col('payments').find(x => x.clientId === id).reduce((s, p) => s + bal(p), 0) };
};
const nameOf = id => col('clients').get(id)?.name || '—';
const withNames = arr => arr.map(x => ({ ...x, clientName: x.clientId ? nameOf(x.clientId) : undefined, caseTitle: x.caseId ? col('cases').get(x.caseId)?.title : undefined }));
const pickClient = b => Object.fromEntries(['name', 'kind', 'mobile', 'idNo', 'city', 'email', 'address', 'contact', 'source', 'status'].filter(k => b[k] !== undefined).map(k => [k, typeof b[k] === 'string' ? b[k].trim().slice(0, 200) : b[k]]));

function createAppointment(clientId, b, source) {
  const s = getSettings(); const t = s.types[b.type];
  const c = col('clients').get(clientId);
  if (!t || !t.enabled) return { error: 'این نوع مشاوره فعال نیست' };
  if (!slotsFor(b.date, b.type).includes(b.time)) return { error: 'این زمان دیگر در دسترس نیست؛ زمان دیگری انتخاب کنید' };
  const dup = col('appointments').find(a => a.clientId === clientId && ['pending', 'confirmed', 'rescheduled'].includes(a.status) && a.date >= todayStr()).length;
  if (dup >= 3 && source === 'portal') return { error: 'حداکثر ۳ نوبت فعال می‌توانید داشته باشید' };
  const a = col('appointments').insert({ clientId, name: c.name, mobile: c.mobile, date: b.date, time: b.time, type: b.type, duration: t.duration, topic: String(b.topic || '').slice(0, 300), caseId: b.caseId || null, status: s.autoConfirm ? 'confirmed' : 'pending', source, meetLink: s.autoConfirm && b.type === 'online' ? t.link : '' });
  notifyNewAppointment(a);
  return { appt: a };
}

// ------------------------------------------------------------------ client portal
const me = express.Router(); router.use('/me', clientOnly, me);
me.get('/overview', (req, res) => {
  const id = req.auth.sub, c = clientFull(id), T = todayStr();
  res.json({ client: c, nextSessions: c.sessions.filter(s => s.date >= T && !s.done).slice(0, 3), deadlines: c.deadlines.filter(d => !d.done && d.date >= T).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4), upcomingAppts: c.appointments.filter(a => ['pending', 'confirmed', 'rescheduled'].includes(a.status) && a.date >= T), unread: col('messages').find(m => m.clientId === id && m.from === 'office' && !m.read).length, balance: c.balance });
});
me.put('/profile', (req, res) => { const b = pickClient(req.body); delete b.status; delete b.mobile; const c = col('clients').update(req.auth.sub, { ...b, ...(col('clients').get(req.auth.sub).status === 'new' ? { status: 'active' } : {}) }); log(req, 'ویرایش پروفایل'); res.json({ client: c }); });
me.get('/cases/:id', (req, res) => { const cs = col('cases').get(req.params.id); if (!cs || cs.clientId !== req.auth.sub) return res.status(404).json({ error: 'پیدا نشد' }); res.json({ case: cs, sessions: col('sessions').find(s => s.caseId === cs.id), deadlines: col('deadlines').find(d => d.caseId === cs.id), documents: col('documents').find(d => d.caseId === cs.id && d.visibleToClient), payments: col('payments').find(p => p.caseId === cs.id) }); });
me.post('/appointments', (req, res) => { const r = createAppointment(req.auth.sub, req.body || {}, 'portal'); if (r.error) return res.status(400).json(r); log(req, 'درخواست نوبت', `${r.appt.date} ${r.appt.time}`); res.json(r); });
me.post('/appointments/:id/cancel', (req, res) => { const a = col('appointments').get(req.params.id); if (!a || a.clientId !== req.auth.sub) return res.status(404).json({ error: 'پیدا نشد' }); col('appointments').update(a.id, { status: 'cancelled' }); sendOwner(`⚠️ <b>لغو نوبت توسط موکل</b>\n👤 ${esc(a.name)}\n🗓 ${fa(a.date)} ${faDigits(a.time)}`); res.json({ ok: true }); });
me.post('/appointments/:id/respond', (req, res) => {
  const a = col('appointments').get(req.params.id); if (!a || a.clientId !== req.auth.sub || a.status !== 'rescheduled' || !a.proposed) return res.status(400).json({ error: 'پیشنهادی وجود ندارد' });
  const prop = { ...a.proposed };
  if (req.body?.accept) { if (!slotsFor(prop.date, a.type, a.id).includes(prop.time)) return res.status(400).json({ error: 'این زمان دیگر خالی نیست' }); col('appointments').update(a.id, { date: prop.date, time: prop.time, proposed: null, status: 'confirmed', meetLink: a.type === 'online' ? getSettings().types.online.link : '' }); sendOwner(`✅ موکل «${esc(a.name)}» زمان پیشنهادی را پذیرفت: ${fa(prop.date)} ${faDigits(prop.time)}`); }
  else { col('appointments').update(a.id, { status: 'rejected', proposed: null }); sendOwner(`❌ موکل «${esc(a.name)}» زمان پیشنهادی را نپذیرفت.`); }
  res.json({ ok: true });
});
me.post('/documents', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'فایلی انتخاب نشده' });
  const cs = req.body.caseId ? col('cases').get(req.body.caseId) : null; if (cs && cs.clientId !== req.auth.sub) return res.status(403).json({ error: 'دسترسی ندارید' });
  const name = fixName(req.file.originalname);
  const d = col('documents').insert({ clientId: req.auth.sub, caseId: cs?.id || null, name: (req.body.title || name).slice(0, 120), category: req.body.category || 'سایر', ext: path.extname(name).slice(1).toLowerCase(), size: req.file.size, file: req.file.filename, by: 'client', visibleToClient: true });
  log(req, 'آپلود مدرک', d.name); sendOwner(`📎 <b>مدرک جدید از موکل</b>\n👤 ${esc(nameOf(req.auth.sub))}\n📄 ${esc(d.name)}`); res.json({ document: d });
});
me.get('/documents/:id/download', (req, res) => sendDoc(req, res, d => d.clientId === req.auth.sub && d.visibleToClient));
me.get('/messages', (req, res) => { const list = col('messages').find(m => m.clientId === req.auth.sub).sort((a, b) => a.createdAt.localeCompare(b.createdAt)); list.filter(m => m.from === 'office' && !m.read).forEach(m => col('messages').update(m.id, { read: true })); res.json({ messages: list }); });
me.post('/messages', (req, res) => { const text = String(req.body?.text || '').trim().slice(0, 1500); if (!text) return res.status(400).json({ error: 'پیام خالی است' }); const m = col('messages').insert({ clientId: req.auth.sub, from: 'client', text, read: false }); sendOwner(`💬 <b>پیام جدید</b> از ${esc(nameOf(req.auth.sub))}:\n${esc(text.slice(0, 300))}`); res.json({ message: m }); });
function sendDoc(req, res, allow) {
  const d = col('documents').get(req.params.id); if (!d || !allow(d)) return res.status(404).json({ error: 'پیدا نشد' });
  log(req, 'دانلود مدرک', d.name);
  if (d.file && fs.existsSync(path.join(UP, d.file))) return res.download(path.join(UP, d.file), `${d.name}.${d.ext}`.replace(/[\\/:*?"<>|]/g, '_'));
  // seeded sample docs: tiny generated PDF
  const txt = `SAMPLE DOCUMENT (demo) - ${d.id}`; const body = `BT /F1 18 Tf 72 720 Td (${txt}) Tj ET`;
  const pdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length ${body.length}>>stream\n${body}\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R/Size 6>>\n%%EOF`;
  res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'attachment; filename="sample.pdf"'); res.send(pdf);
}

// ------------------------------------------------------------------ staff panel
const ad = express.Router(); router.use('/admin', staff, ad);
const jalaliMonth = dateStr => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: 'numeric' }).formatToParts(new Date(dateStr + 'T12:00:00Z')).map(x => [x.type, x.value])); return { key: `${p.year}-${String(p.month).padStart(2, '0')}`, label: new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'UTC', month: 'long' }).format(new Date(dateStr + 'T12:00:00Z')) }; };
ad.get('/dashboard', (_q, res) => {
  const T = todayStr(), W = addDays(T, 7);
  const clients = col('clients').all(), cases = col('cases').all(), pays = col('payments').all(), appts = col('appointments').all();
  const months = []; for (let i = 5; i >= 0; i--) { const m = jalaliMonth(addDays(T, -i * 30)); if (!months.find(x => x.key === m.key)) months.push({ ...m, revenue: 0, newClients: 0 }); }
  pays.forEach(p => (p.history || []).forEach(h => { const k = jalaliMonth(h.date).key; const m = months.find(x => x.key === k); if (m) m.revenue += h.amount; }));
  clients.forEach(c => { const k = jalaliMonth(c.joinedAt || T).key; const m = months.find(x => x.key === k); if (m) m.newClients++; });
  const count = (arr, f) => { const o = {}; arr.forEach(x => { const k = f(x); o[k] = (o[k] || 0) + 1; }); return o; };
  res.json({
    kpi: { clients: clients.length, newClients: clients.filter(c => c.status === 'new').length, activeCases: cases.filter(c => c.status !== 'closed').length, pendingAppts: appts.filter(a => a.status === 'pending').length, sessionsWeek: col('sessions').find(s => s.date >= T && s.date <= W && !s.done).length, deadlinesWeek: col('deadlines').find(d => !d.done && d.date >= T && d.date <= W).length, collected: pays.reduce((s, p) => s + (p.paid || 0), 0), outstanding: pays.reduce((s, p) => s + bal(p), 0), unread: col('messages').find(m => m.from === 'client' && !m.read).length },
    months, casesByType: Object.entries(count(cases, c => CASE_TYPES[c.type] || c.type)).map(([name, value]) => ({ name, value })), casesByStatus: count(cases, c => c.status), apptsByStatus: count(appts, a => a.status),
    today: { date: T, appointments: withNames(appts.filter(a => a.date === T && a.status === 'confirmed')), sessions: withNames(col('sessions').find(s => s.date === T)) },
    upcomingSessions: withNames(col('sessions').find(s => s.date >= T && !s.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6)),
    deadlines: withNames(col('deadlines').find(d => !d.done && d.date >= T).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6)),
    pending: withNames(appts.filter(a => a.status === 'pending')), recentLogs: col('logs').all().slice(-8).reverse(), telegram: tgInfo(),
  });
});
// clients
ad.get('/clients', (req, res) => {
  const q = String(req.query.q || '').trim(), st = req.query.status;
  let list = col('clients').all().filter(c => (!st || c.status === st) && (!q || [c.name, c.mobile, c.idNo, c.city, c.email].some(v => String(v || '').includes(q))));
  res.json({ clients: list.map(c => ({ ...c, casesCount: col('cases').find(x => x.clientId === c.id).length, balance: col('payments').find(p => p.clientId === c.id).reduce((s, p) => s + bal(p), 0) })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});
ad.get('/clients/:id', (req, res) => { const c = clientFull(req.params.id); if (!c) return res.status(404).json({ error: 'پیدا نشد' }); log(req, 'مشاهده پرونده موکل', c.name); res.json({ client: c }); });
ad.post('/clients', (req, res) => { const b = pickClient(req.body); b.mobile = normMobile(b.mobile); if (!b.name || !b.mobile) return res.status(400).json({ error: 'نام و موبایل معتبر لازم است' }); if (col('clients').one(c => c.mobile === b.mobile)) return res.status(400).json({ error: 'این شماره قبلاً ثبت شده' }); const c = col('clients').insert({ kind: 'real', status: 'active', verified: false, joinedAt: todayStr(), ...b }); log(req, 'ایجاد موکل', c.name); res.json({ client: c }); });
ad.put('/clients/:id', (req, res) => { const b = pickClient(req.body); if (b.mobile) b.mobile = normMobile(b.mobile); const c = col('clients').update(req.params.id, b); log(req, 'ویرایش موکل', c?.name); res.json({ client: c }); });
ad.delete('/clients/:id', lawyerOnly, (req, res) => { const id = req.params.id, c = col('clients').get(id); ['cases', 'sessions', 'deadlines', 'appointments', 'documents', 'payments', 'messages', 'notes'].forEach(n => col(n).removeWhere(x => x.clientId === id)); col('clients').remove(id); log(req, 'حذف موکل', c?.name); res.json({ ok: true }); });
ad.post('/clients/:id/notes', (req, res) => { const n = col('notes').insert({ clientId: req.params.id, text: String(req.body?.text || '').slice(0, 1000), by: req.auth.name }); res.json({ note: n }); });
// cases
ad.get('/cases', (_q, res) => res.json({ cases: withNames(col('cases').all()), types: CASE_TYPES }));
ad.get('/cases/:id', (req, res) => { const cs = col('cases').get(req.params.id); if (!cs) return res.status(404).json({ error: 'پیدا نشد' }); res.json({ case: { ...cs, clientName: nameOf(cs.clientId) }, sessions: col('sessions').find(s => s.caseId === cs.id), deadlines: col('deadlines').find(d => d.caseId === cs.id), documents: col('documents').find(d => d.caseId === cs.id), payments: col('payments').find(p => p.caseId === cs.id) }); });
ad.post('/cases', (req, res) => { const b = req.body || {}; if (!b.clientId || !b.title) return res.status(400).json({ error: 'موکل و عنوان لازم است' }); const cs = col('cases').insert({ clientId: b.clientId, title: String(b.title).slice(0, 200), type: b.type || 'contract', court: b.court || '', caseNo: b.caseNo || '', status: b.status || 'preparation', fee: Number(b.fee) || 0, opened: todayStr(), timeline: [{ date: todayStr(), text: 'افتتاح پرونده' }] }); log(req, 'ایجاد پرونده', cs.title); res.json({ case: cs }); });
ad.put('/cases/:id', (req, res) => { const b = req.body || {}; const patch = Object.fromEntries(['title', 'type', 'court', 'caseNo', 'status', 'fee'].filter(k => b[k] !== undefined).map(k => [k, k === 'fee' ? Number(b[k]) : b[k]])); const cs = col('cases').update(req.params.id, patch); log(req, 'ویرایش پرونده', cs?.title); res.json({ case: cs }); });
ad.post('/cases/:id/timeline', (req, res) => { const cs = col('cases').get(req.params.id); if (!cs) return res.status(404).json({ error: 'پیدا نشد' }); const ev = { date: req.body?.date || todayStr(), text: String(req.body?.text || '').slice(0, 300) }; col('cases').update(cs.id, { timeline: [...cs.timeline, ev] }); res.json({ ok: true }); });
ad.delete('/cases/:id', lawyerOnly, (req, res) => { const id = req.params.id; ['sessions', 'deadlines', 'documents', 'payments'].forEach(n => col(n).removeWhere(x => x.caseId === id)); col('cases').remove(id); log(req, 'حذف پرونده'); res.json({ ok: true }); });
// sessions & deadlines
for (const [name, path_] of [['sessions', 'sessions'], ['deadlines', 'deadlines']]) {
  ad.get('/' + path_, (_q, res) => res.json({ items: withNames(col(name).all()) }));
  ad.post('/' + path_, (req, res) => { const b = req.body || {}; const cs = col('cases').get(b.caseId); if (!cs || !b.date) return res.status(400).json({ error: 'پرونده و تاریخ لازم است' }); const it = col(name).insert({ caseId: cs.id, clientId: cs.clientId, date: b.date, time: b.time || '', title: b.title || '', court: b.court || cs.court, kind: b.kind || 'جلسه رسیدگی', note: b.note || '', done: false }); log(req, name === 'sessions' ? 'ثبت جلسه دادگاه' : 'ثبت مهلت', cs.title); res.json({ item: it }); });
  ad.put('/' + path_ + '/:id', (req, res) => res.json({ item: col(name).update(req.params.id, req.body || {}) }));
  ad.delete('/' + path_ + '/:id', (req, res) => { col(name).remove(req.params.id); res.json({ ok: true }); });
}
// appointments
ad.get('/appointments', (_q, res) => res.json({ appointments: withNames(col('appointments').all()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), types: getSettings().types }));
ad.post('/appointments', (req, res) => { const b = req.body || {}; if (!col('clients').get(b.clientId)) return res.status(400).json({ error: 'موکل نامعتبر' }); const r = createAppointment(b.clientId, b, 'office'); if (r.error) return res.status(400).json(r); if (b.confirm !== false) applyDecision(r.appt.id, 'ok', req.auth.name); res.json(r); });
ad.put('/appointments/:id/decision', (req, res) => { const { decision, reason, date, time } = req.body || {}; if (decision === 'done') return res.json({ appt: col('appointments').update(req.params.id, { status: 'done' }) }); if (decision === 'noshow') return res.json({ appt: col('appointments').update(req.params.id, { status: 'noshow' }) }); const r = applyDecision(req.params.id, decision, req.auth.name, { reason, date, time }); if (r.error) return res.status(400).json(r); log(req, 'تصمیم نوبت: ' + decision, r.appt.name); res.json(r); });
ad.delete('/appointments/:id', (req, res) => { col('appointments').remove(req.params.id); res.json({ ok: true }); });
// settings
ad.get('/settings', (_q, res) => res.json({ settings: getSettings(), telegram: tgInfo() }));
ad.put('/settings', lawyerOnly, (req, res) => { const s = setSettings(req.body || {}); log(req, 'تغییر تنظیمات نوبت‌دهی'); res.json({ settings: s }); });
ad.post('/telegram/test', lawyerOnly, wrap(async (_q, res) => { const r = await sendOwner('✅ تست اتصال: ربات دفتر وکالت به پنل متصل است.'); res.json({ ok: !!r?.ok, info: tgInfo() }); }));
ad.post('/demo/reset', lawyerOnly, (req, res) => { const r = seed(); log(req, 'بازنشانی داده‌های نمونه'); res.json(r); });
// documents
ad.get('/documents', (_q, res) => res.json({ documents: withNames(col('documents').all()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));
ad.post('/documents', upload.single('file'), (req, res) => { if (!req.file || !col('clients').get(req.body.clientId)) return res.status(400).json({ error: 'فایل و موکل لازم است' }); const name = fixName(req.file.originalname); const d = col('documents').insert({ clientId: req.body.clientId, caseId: req.body.caseId || null, name: (req.body.title || name).slice(0, 120), category: req.body.category || 'سایر', ext: path.extname(name).slice(1).toLowerCase(), size: req.file.size, file: req.file.filename, by: 'office', visibleToClient: req.body.visibleToClient !== 'false' }); log(req, 'آپلود مدرک', d.name); res.json({ document: d }); });
ad.get('/documents/:id/download', (req, res) => sendDoc(req, res, () => true));
ad.delete('/documents/:id', (req, res) => { const d = col('documents').get(req.params.id); if (d?.file) fs.rm(path.join(UP, d.file), () => {}); col('documents').remove(req.params.id); log(req, 'حذف مدرک', d?.name); res.json({ ok: true }); });
// finance
ad.get('/payments', (_q, res) => res.json({ payments: withNames(col('payments').all()) }));
ad.post('/payments', (req, res) => { const b = req.body || {}; const cs = col('cases').get(b.caseId); if (!cs || !(Number(b.amount) > 0)) return res.status(400).json({ error: 'پرونده و مبلغ لازم است' }); const p = col('payments').insert({ clientId: cs.clientId, caseId: cs.id, title: b.title || 'صورتحساب', amount: Number(b.amount), paid: 0, history: [], dueDate: b.dueDate || todayStr(), invoiceNo: `INV-${Date.now().toString().slice(-7)}` }); log(req, 'صدور صورتحساب', p.invoiceNo); res.json({ payment: p }); });
ad.post('/payments/:id/pay', (req, res) => { const p = col('payments').get(req.params.id); const amt = Number(req.body?.amount); if (!p || !(amt > 0)) return res.status(400).json({ error: 'مبلغ نامعتبر' }); const add = Math.min(amt, bal(p)); col('payments').update(p.id, { paid: p.paid + add, history: [...(p.history || []), { date: todayStr(), amount: add, method: req.body?.method || 'نقدی' }] }); log(req, 'ثبت پرداخت', `${p.invoiceNo} — ${money(add)}`); res.json({ ok: true }); });
ad.delete('/payments/:id', lawyerOnly, (req, res) => { col('payments').remove(req.params.id); res.json({ ok: true }); });
// messages
ad.get('/messages', (_q, res) => { const by = {}; col('messages').all().forEach(m => { (by[m.clientId] ||= []).push(m); }); res.json({ threads: Object.entries(by).map(([clientId, ms]) => { ms.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); const c = col('clients').get(clientId); return { clientId, clientName: c?.name, mobile: c?.mobile, last: ms[ms.length - 1], unread: ms.filter(m => m.from === 'client' && !m.read).length }; }).sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt)) }); });
ad.get('/messages/:clientId', (req, res) => { const ms = col('messages').find(m => m.clientId === req.params.clientId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)); ms.filter(m => m.from === 'client' && !m.read).forEach(m => col('messages').update(m.id, { read: true })); res.json({ messages: ms, client: col('clients').get(req.params.clientId) }); });
ad.post('/messages/:clientId', (req, res) => { const text = String(req.body?.text || '').trim().slice(0, 1500); if (!text) return res.status(400).json({ error: 'پیام خالی است' }); res.json({ message: col('messages').insert({ clientId: req.params.clientId, from: 'office', text, read: false }) }); });
// team + logs
ad.get('/team', lawyerOnly, (_q, res) => res.json({ users: col('users').all(), roles: { lawyer: 'دسترسی کامل، تنظیمات، حذف و گزارش امنیتی', assistant: 'مدیریت نوبت، پیام، مدارک و ثبت اطلاعات؛ بدون حذف، تنظیمات و لاگ', client: 'فقط اطلاعات و پرونده‌های خودش' } }));
ad.get('/logs', lawyerOnly, (_q, res) => res.json({ logs: col('logs').all().slice(-300).reverse() }));

// ------------------------------------------------------------------ Excel exports
const STAT = { preparation: 'در حال بررسی', active: 'در جریان', awaiting: 'منتظر رأی', closed: 'مختومه', new: 'جدید', pending: 'در انتظار', confirmed: 'تأیید شده', rejected: 'رد شده', done: 'انجام شده', cancelled: 'لغو شده', rescheduled: 'زمان جدید پیشنهاد شد', noshow: 'عدم حضور' };
function sheet(wb, name, cols, rows) {
  const ws = wb.addWorksheet(name, { views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }] });
  ws.columns = cols.map(([header, key, width]) => ({ header, key, width: width || 18 }));
  ws.getRow(1).eachCell(c => { c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1B33' } }; c.alignment = { horizontal: 'center' }; });
  rows.forEach(r => ws.addRow(r)); ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  return ws;
}
const faD = d => (d ? fa(d, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '');
ad.get('/export/:what.xlsx', wrap(async (req, res) => {
  const wb = new ExcelJS.Workbook(); wb.creator = 'Sobhan Nikseresht Law';
  const w = req.params.what;
  const clients = () => sheet(wb, 'موکلان', [['نام', 'name', 26], ['نوع', 'kind', 10], ['موبایل', 'mobile', 16], ['کد/شناسه ملی', 'idNo', 16], ['شهر', 'city', 12], ['ایمیل', 'email', 24], ['وضعیت', 'status', 12], ['تعداد پرونده', 'cases', 12], ['مانده بدهی (تومان)', 'bal', 18], ['تاریخ عضویت', 'joined', 14]], col('clients').all().map(c => ({ ...c, kind: c.kind === 'legal' ? 'حقوقی' : 'حقیقی', status: STAT[c.status] || c.status, cases: col('cases').find(x => x.clientId === c.id).length, bal: col('payments').find(p => p.clientId === c.id).reduce((s, p) => s + bal(p), 0), joined: faD(c.joinedAt) })));
  const cases = () => sheet(wb, 'پرونده‌ها', [['موکل', 'client', 24], ['عنوان', 'title', 40], ['نوع', 'type', 22], ['مرجع', 'court', 34], ['شماره پرونده', 'caseNo', 20], ['وضعیت', 'status', 12], ['حق‌الوکاله (تومان)', 'fee', 18], ['تاریخ افتتاح', 'opened', 14]], col('cases').all().map(c => ({ ...c, client: nameOf(c.clientId), type: CASE_TYPES[c.type], status: STAT[c.status], opened: faD(c.opened) })));
  const fin = () => sheet(wb, 'مالی', [['شماره', 'invoiceNo', 14], ['موکل', 'client', 24], ['شرح', 'title', 26], ['مبلغ', 'amount', 16], ['پرداخت‌شده', 'paid', 16], ['مانده', 'rest', 16], ['سررسید', 'due', 14]], col('payments').all().map(p => ({ ...p, client: nameOf(p.clientId), rest: bal(p), due: faD(p.dueDate) })));
  const ap = () => sheet(wb, 'نوبت‌ها', [['موکل', 'name', 24], ['موبایل', 'mobile', 16], ['تاریخ', 'd', 14], ['ساعت', 'time', 8], ['نوع', 't', 14], ['وضعیت', 's', 16], ['موضوع', 'topic', 34]], col('appointments').all().map(a => ({ ...a, d: faD(a.date), t: getSettings().types[a.type]?.label, s: STAT[a.status] })));
  if (w === 'clients') clients(); else if (w === 'cases') cases(); else if (w === 'finance') fin(); else if (w === 'appointments') ap(); else if (w === 'all') { clients(); cases(); fin(); ap(); } else return res.status(404).json({ error: 'نامعتبر' });
  log(req, 'خروجی Excel', w);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); res.setHeader('Content-Disposition', `attachment; filename="${w}.xlsx"`);
  await wb.xlsx.write(res); res.end();
}));
