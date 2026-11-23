// @ts-nocheck
// The in-browser "server": same endpoints and response shapes as portal-api/src/app.js.
import { col, db, SESS, resetDemo, persistNow, getSettings, setSettings, slotsFor, normMobile, todayStr, addDays, fa, faDigits, money, esc, CASE_TYPES, notifyNewAppointment, applyDecision, tgCallback, tgCommand, tgSend } from "./core";

class HttpError extends Error { status: number; data: any; constructor(status: number, message: string, data?: any) { super(message); this.status = status; this.data = { error: message, ...(data || {}) }; } }
const H = (s: number, m: string, d?: any) => new HttpError(s, m, d);
const bal = (p: any) => p.amount - (p.paid || 0);

// ---- session (replaces the JWT cookie) ----
// Lawyer panel and client portal keep SEPARATE sessions, so both can be open in two tabs of the same browser during the demo.
const areaOf = (path: string) => (path.startsWith("/admin") || path === "/auth/staff-login" ? "staff" : path.startsWith("/me") || path.startsWith("/auth/otp") ? "client" : location.pathname.startsWith("/admin") ? "staff" : "client");
const getAuth = (area: string) => { try { const s = JSON.parse(localStorage.getItem(SESS + "_" + area) || "null"); return s && s.exp > Date.now() ? s : null; } catch { return null; } };
const setAuth = (u: any, days = 7) => localStorage.setItem(SESS + "_" + (u.role === "client" ? "client" : "staff"), JSON.stringify({ sub: u.id, name: u.name, role: u.role, exp: Date.now() + days * 864e5 }));
function log(auth: any, action: string, detail = "", actor?: any) { const a = actor || (auth ? { id: auth.sub, name: auth.name, role: auth.role } : { id: null, name: "سیستم", role: "system" }); col("logs").insert({ actorId: a.id, actorName: a.name, role: a.role, action, detail, ip: "demo" }); }

// ---- routing ----
type Ctx = { auth: any; params: any; query: URLSearchParams; body: any; file: File | null };
const routes: { m: string; re: RegExp; keys: string[]; guard: string; fn: (c: Ctx) => any }[] = [];
function add(m: string, pattern: string, guard: string, fn: (c: Ctx) => any) {
  const keys: string[] = []; const re = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/:([a-zA-Z]+)/g, (_x, k) => { keys.push(k); return "([^/]+?)"; }) + "$");
  routes.push({ m, re, keys, guard, fn });
}
const guardOk = (g: string, a: any) => g === "none" || (g === "staff" && a && (a.role === "lawyer" || a.role === "assistant")) || (g === "lawyer" && a && a.role === "lawyer") || (g === "client" && a && a.role === "client");
function dispatch(method: string, path: string, body: any, file: File | null) {
  const [p, qs] = path.split("?"); const auth = getAuth(areaOf(p));
  for (const r of routes) {
    if (r.m !== method) continue; const m = p.match(r.re); if (!m) continue;
    if (!guardOk(r.guard, auth)) throw H(auth ? 403 : 401, auth ? "دسترسی ندارید" : "نیاز به ورود دارید");
    const params: any = {}; r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
    return r.fn({ auth, params, query: new URLSearchParams(qs || ""), body: body || {}, file });
  }
  throw H(404, "پیدا نشد");
}
export async function demoRequest(method: string, path: string, body?: any, form?: FormData) {
  await new Promise(r => setTimeout(r, 90));
  let file: File | null = null; let b = body;
  if (form) { b = {}; form.forEach((v, k) => { if (v instanceof File) file = v; else b[k] = v; }); }
  const out = await Promise.resolve(dispatch(method, path, b, file));
  return out === undefined ? { ok: true } : JSON.parse(JSON.stringify(out));
}

// ---- helpers ----
const nameOf = (id: string) => col("clients").get(id)?.name || "—";
const withNames = (arr: any[]) => arr.map(x => ({ ...x, clientName: x.clientId ? nameOf(x.clientId) : undefined, caseTitle: x.caseId ? col("cases").get(x.caseId)?.title : undefined }));
const clientFull = (id: string) => {
  const c = col("clients").get(id); if (!c) return null; const pays = col("payments").find((x: any) => x.clientId === id);
  return { ...c, cases: col("cases").find((x: any) => x.clientId === id), sessions: col("sessions").find((x: any) => x.clientId === id).sort((a: any, b: any) => a.date.localeCompare(b.date)), deadlines: col("deadlines").find((x: any) => x.clientId === id), appointments: col("appointments").find((x: any) => x.clientId === id).sort((a: any, b: any) => (b.date + b.time).localeCompare(a.date + a.time)), documents: col("documents").find((x: any) => x.clientId === id), payments: pays, notes: col("notes").find((x: any) => x.clientId === id), balance: pays.reduce((s: number, p: any) => s + bal(p), 0) };
};
const pickClient = (b: any) => Object.fromEntries(["name", "kind", "mobile", "idNo", "city", "email", "address", "contact", "source", "status"].filter(k => b[k] !== undefined).map(k => [k, typeof b[k] === "string" ? b[k].trim().slice(0, 200) : b[k]]));
function createAppointment(clientId: string, b: any, source: string) {
  const s = getSettings(); const t = s.types[b.type]; const c = col("clients").get(clientId);
  if (!t || !t.enabled) return { error: "این نوع مشاوره فعال نیست" };
  if (!slotsFor(b.date, b.type).includes(b.time)) return { error: "این زمان دیگر در دسترس نیست؛ زمان دیگری انتخاب کنید" };
  const dup = col("appointments").find((a: any) => a.clientId === clientId && ["pending", "confirmed", "rescheduled"].includes(a.status) && a.date >= todayStr()).length;
  if (dup >= 3 && source === "portal") return { error: "حداکثر ۳ نوبت فعال می‌توانید داشته باشید" };
  const a = col("appointments").insert({ clientId, name: c.name, mobile: c.mobile, date: b.date, time: b.time, type: b.type, duration: t.duration, topic: String(b.topic || "").slice(0, 300), caseId: b.caseId || null, status: s.autoConfirm ? "confirmed" : "pending", source, meetLink: s.autoConfirm && b.type === "online" ? t.link : "" });
  notifyNewAppointment(a); return { appt: a };
}
const fileRecord = (file: File, extra: any) => {
  const name = file.name; const ext = (name.split(".").pop() || "").toLowerCase();
  if (!["pdf", "jpg", "jpeg", "png", "docx", "doc", "xlsx", "txt"].includes(ext)) throw H(400, "فرمت فایل مجاز نیست");
  if (file.size > 10 * 1024 * 1024) throw H(400, "حجم فایل بیش از ۱۰ مگابایت است");
  return { name: (extra.title || name).slice(0, 120), ext, size: file.size, ...extra };
};
const readDataUrl = (file: File) => new Promise<string | null>(res => { if (file.size > 600 * 1024) return res(null); const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(null); r.readAsDataURL(file); });
const ok = { ok: true };

// ================= auth =================
add("POST", "/auth/staff-login", "none", c => {
  const { username, password } = c.body; const isL = username === "lawyer" && password === "Demo@1234"; const isA = username === "assistant" && password === "Demo@1234";
  if (!isL && !isA) { log(null, "ورود ناموفق", String(username).slice(0, 30), { id: null, name: "ناشناس", role: "guest" }); throw H(401, "نام کاربری یا رمز عبور نادرست است"); }
  const u = col("users").get(isL ? "u_lawyer" : "u_assistant"); setAuth(u, 2); log(null, "ورود به پنل", "", { id: u.id, name: u.name, role: u.role }); return { user: { id: u.id, name: u.name, role: u.role } };
});
add("POST", "/auth/otp/request", "none", c => {
  const mobile = normMobile(c.body.mobile); if (!mobile) throw H(400, "شماره موبایل معتبر نیست (مثال: 09123456789)");
  col("otps").removeWhere((o: any) => o.mobile === mobile); const code = String(10000 + Math.floor(Math.random() * 90000));
  col("otps").insert({ mobile, code, expires: Date.now() + 120000, tries: 0 });
  tgSend(`🔐 <b>کد ورود موکل (دمو)</b>\n📱 ${faDigits(mobile)}\nکد: <code>${code}</code>`);
  return { ok: true, exists: !!col("clients").one((x: any) => x.mobile === mobile), ttl: 120, demoCode: code };
});
add("POST", "/auth/otp/verify", "none", c => {
  const mobile = normMobile(c.body.mobile); const code = String(c.body.code || "").replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  const o = col("otps").one((x: any) => x.mobile === mobile); if (!o || o.expires < Date.now()) throw H(400, "کد منقضی شده؛ کد جدید بگیرید");
  if (o.tries >= 5) { col("otps").remove(o.id); throw H(429, "تلاش زیاد؛ کد جدید بگیرید"); }
  if (o.code !== code) { col("otps").update(o.id, { tries: o.tries + 1 }); throw H(400, "کد اشتباه است"); }
  let cl = col("clients").one((x: any) => x.mobile === mobile);
  if (!cl) {
    const name = String(c.body.name || "").trim().slice(0, 80); if (name.length < 3) throw H(400, "برای ثبت‌نام، نام و نام خانوادگی را وارد کنید", { needName: true });
    cl = col("clients").insert({ name, kind: "real", mobile, idNo: "", city: "", email: "", address: "", source: "ثبت‌نام آنلاین", status: "new", verified: true, joinedAt: todayStr() });
    log(null, "ثبت‌نام موکل جدید", name, { id: cl.id, name, role: "client" }); tgSend(`🆕 <b>موکل جدید ثبت‌نام کرد</b>\n👤 ${esc(name)}\n📱 ${faDigits(mobile)}`);
    col("messages").insert({ clientId: cl.id, from: "office", text: "به پورتال موکلان خوش آمدید. از اینجا می‌توانید نوبت بگیرید، مدارک بارگذاری کنید و روند پرونده را ببینید.", read: false });
  }
  col("otps").remove(o.id); setAuth({ id: cl.id, name: cl.name, role: "client" }, 14);
  return { user: { id: cl.id, name: cl.name, role: "client" }, isNew: cl.status === "new" };
});
add("GET", "/auth/me", "none", c => ({ user: c.auth ? { id: c.auth.sub, name: c.auth.name, role: c.auth.role } : null }));
add("POST", "/auth/logout", "none", () => { localStorage.removeItem(SESS + "_" + areaOf("/auth/logout")); return ok; });

// ================= public =================
add("GET", "/public/booking", "none", () => { const s = getSettings(); return { open: s.bookingOpen, maxAdvanceDays: s.maxAdvanceDays, types: Object.fromEntries(Object.entries(s.types).filter(([, t]: any) => t.enabled).map(([k, t]: any) => [k, { label: t.label, price: t.price, duration: t.duration, note: t.note }])), office: s.office, today: todayStr() }; });
add("GET", "/public/slots", "none", c => ({ slots: slotsFor(c.query.get("date") || "", c.query.get("type") || "") }));
add("GET", "/public/availability", "none", c => { const type = c.query.get("type") || ""; const from = c.query.get("from") || todayStr(); const to = c.query.get("to") || addDays(from, 31); const days: any = {}; for (let d = from, i = 0; d <= to && i < 70; d = addDays(d, 1), i++) { const n = slotsFor(d, type).length; if (n) days[d] = n; } return { days }; });
add("GET", "/public/meta", "none", () => ({ caseTypes: CASE_TYPES }));

// ================= client portal =================
add("GET", "/me/overview", "client", c => { const id = c.auth.sub, cl = clientFull(id), T = todayStr(); return { client: cl, nextSessions: cl.sessions.filter((s: any) => s.date >= T && !s.done).slice(0, 3), deadlines: cl.deadlines.filter((d: any) => !d.done && d.date >= T).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(0, 4), upcomingAppts: cl.appointments.filter((a: any) => ["pending", "confirmed", "rescheduled"].includes(a.status) && a.date >= T), unread: col("messages").find((m: any) => m.clientId === id && m.from === "office" && !m.read).length, balance: cl.balance }; });
add("PUT", "/me/profile", "client", c => { const b: any = pickClient(c.body); delete b.status; delete b.mobile; const cur = col("clients").get(c.auth.sub); const cl = col("clients").update(c.auth.sub, { ...b, ...(cur.status === "new" ? { status: "active" } : {}) }); log(c.auth, "ویرایش پروفایل"); return { client: cl }; });
add("GET", "/me/cases/:id", "client", c => { const cs = col("cases").get(c.params.id); if (!cs || cs.clientId !== c.auth.sub) throw H(404, "پیدا نشد"); return { case: cs, sessions: col("sessions").find((s: any) => s.caseId === cs.id), deadlines: col("deadlines").find((d: any) => d.caseId === cs.id), documents: col("documents").find((d: any) => d.caseId === cs.id && d.visibleToClient), payments: col("payments").find((p: any) => p.caseId === cs.id) }; });
add("POST", "/me/appointments", "client", c => { const r: any = createAppointment(c.auth.sub, c.body, "portal"); if (r.error) throw H(400, r.error); log(c.auth, "درخواست نوبت", `${r.appt.date} ${r.appt.time}`); return r; });
add("POST", "/me/appointments/:id/cancel", "client", c => { const a = col("appointments").get(c.params.id); if (!a || a.clientId !== c.auth.sub) throw H(404, "پیدا نشد"); const u = col("appointments").update(a.id, { status: "cancelled" }); tgSend(`⚠️ <b>لغو نوبت توسط موکل</b>\n👤 ${esc(a.name)}\n🗓 ${fa(a.date)} ${faDigits(a.time)}`); col("tg").find((m: any) => m.apptId === a.id).forEach((m: any) => col("tg").update(m.id, { buttons: null })); return ok; });
add("POST", "/me/appointments/:id/respond", "client", c => {
  const a = col("appointments").get(c.params.id); if (!a || a.clientId !== c.auth.sub || a.status !== "rescheduled" || !a.proposed) throw H(400, "پیشنهادی وجود ندارد");
  const prop = { ...a.proposed };
  if (c.body.accept) { if (!slotsFor(prop.date, a.type, a.id).includes(prop.time)) throw H(400, "این زمان دیگر خالی نیست"); const u = col("appointments").update(a.id, { date: prop.date, time: prop.time, proposed: null, status: "confirmed", meetLink: a.type === "online" ? getSettings().types.online.link : "" }); tgSend(`✅ موکل «${esc(a.name)}» زمان پیشنهادی را پذیرفت: ${fa(prop.date)} ${faDigits(prop.time)}`); }
  else { col("appointments").update(a.id, { status: "rejected", proposed: null }); tgSend(`❌ موکل «${esc(a.name)}» زمان پیشنهادی را نپذیرفت.`); }
  return ok;
});
add("POST", "/me/documents", "client", async (c: any) => {
  if (!c.file) throw H(400, "فایلی انتخاب نشده"); const cs = c.body.caseId ? col("cases").get(c.body.caseId) : null; if (cs && cs.clientId !== c.auth.sub) throw H(403, "دسترسی ندارید");
  const rec = fileRecord(c.file, { title: c.body.title }); const d = col("documents").insert({ ...rec, clientId: c.auth.sub, caseId: cs?.id || null, category: c.body.category || "سایر", dataUrl: await readDataUrl(c.file), by: "client", visibleToClient: true });
  log(c.auth, "آپلود مدرک", d.name); tgSend(`📎 <b>مدرک جدید از موکل</b>\n👤 ${esc(nameOf(c.auth.sub))}\n📄 ${esc(d.name)}`); return { document: { ...d, dataUrl: undefined } };
});
add("GET", "/me/messages", "client", c => { const list = col("messages").find((m: any) => m.clientId === c.auth.sub).sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt)); list.filter((m: any) => m.from === "office" && !m.read).forEach((m: any) => col("messages").update(m.id, { read: true })); return { messages: list }; });
add("POST", "/me/messages", "client", c => { const text = String(c.body.text || "").trim().slice(0, 1500); if (!text) throw H(400, "پیام خالی است"); const m = col("messages").insert({ clientId: c.auth.sub, from: "client", text, read: false }); tgSend(`💬 <b>پیام جدید</b> از ${esc(nameOf(c.auth.sub))}:\n${esc(text.slice(0, 300))}`); return { message: m }; });

// ================= admin =================
const jalaliMonth = (dateStr: string) => { const p: any = Object.fromEntries(new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", { timeZone: "UTC", year: "numeric", month: "numeric" }).formatToParts(new Date(dateStr + "T12:00:00Z")).map(x => [x.type, x.value])); return { key: `${p.year}-${String(p.month).padStart(2, "0")}`, label: new Intl.DateTimeFormat("fa-IR-u-ca-persian", { timeZone: "UTC", month: "long" }).format(new Date(dateStr + "T12:00:00Z")) }; };
add("GET", "/admin/dashboard", "staff", () => {
  const T = todayStr(), W = addDays(T, 7); const clients = col("clients").all(), cases = col("cases").all(), pays = col("payments").all(), appts = col("appointments").all();
  const months: any[] = []; for (let i = 5; i >= 0; i--) { const m = jalaliMonth(addDays(T, -i * 30)); if (!months.find(x => x.key === m.key)) months.push({ ...m, revenue: 0, newClients: 0 }); }
  pays.forEach((p: any) => (p.history || []).forEach((h: any) => { const m = months.find(x => x.key === jalaliMonth(h.date).key); if (m) m.revenue += h.amount; }));
  clients.forEach((c: any) => { const m = months.find(x => x.key === jalaliMonth(c.joinedAt || T).key); if (m) m.newClients++; });
  const count = (arr: any[], f: any) => { const o: any = {}; arr.forEach(x => { const k = f(x); o[k] = (o[k] || 0) + 1; }); return o; };
  return {
    kpi: { clients: clients.length, newClients: clients.filter((c: any) => c.status === "new").length, activeCases: cases.filter((c: any) => c.status !== "closed").length, pendingAppts: appts.filter((a: any) => a.status === "pending").length, sessionsWeek: col("sessions").find((s: any) => s.date >= T && s.date <= W && !s.done).length, deadlinesWeek: col("deadlines").find((d: any) => !d.done && d.date >= T && d.date <= W).length, collected: pays.reduce((s: number, p: any) => s + (p.paid || 0), 0), outstanding: pays.reduce((s: number, p: any) => s + bal(p), 0), unread: col("messages").find((m: any) => m.from === "client" && !m.read).length },
    months, casesByType: Object.entries(count(cases, (c: any) => CASE_TYPES[c.type] || c.type)).map(([name, value]) => ({ name, value })), casesByStatus: count(cases, (c: any) => c.status), apptsByStatus: count(appts, (a: any) => a.status),
    today: { date: T, appointments: withNames(appts.filter((a: any) => a.date === T && a.status === "confirmed")), sessions: withNames(col("sessions").find((s: any) => s.date === T)) },
    upcomingSessions: withNames(col("sessions").find((s: any) => s.date >= T && !s.done).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(0, 6)),
    deadlines: withNames(col("deadlines").find((d: any) => !d.done && d.date >= T).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(0, 6)),
    pending: withNames(appts.filter((a: any) => a.status === "pending")), recentLogs: col("logs").all().slice(-8).reverse(), telegram: { enabled: true, paired: true, botName: "Fitmindsetbot (شبیه‌سازی)", demo: true },
  };
});
add("GET", "/admin/clients", "staff", c => {
  const q = (c.query.get("q") || "").trim(), st = c.query.get("status");
  const list = col("clients").all().filter((x: any) => (!st || x.status === st) && (!q || [x.name, x.mobile, x.idNo, x.city, x.email].some(v => String(v || "").includes(q))));
  return { clients: list.map((x: any) => ({ ...x, casesCount: col("cases").find((y: any) => y.clientId === x.id).length, balance: col("payments").find((p: any) => p.clientId === x.id).reduce((s: number, p: any) => s + bal(p), 0) })).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)) };
});
add("GET", "/admin/clients/:id", "staff", c => { const cl = clientFull(c.params.id); if (!cl) throw H(404, "پیدا نشد"); log(c.auth, "مشاهده پرونده موکل", cl.name); return { client: cl }; });
add("POST", "/admin/clients", "staff", c => { const b: any = pickClient(c.body); b.mobile = normMobile(b.mobile); if (!b.name || !b.mobile) throw H(400, "نام و موبایل معتبر لازم است"); if (col("clients").one((x: any) => x.mobile === b.mobile)) throw H(400, "این شماره قبلاً ثبت شده"); const cl = col("clients").insert({ kind: "real", status: "active", verified: false, joinedAt: todayStr(), ...b }); log(c.auth, "ایجاد موکل", cl.name); return { client: cl }; });
add("PUT", "/admin/clients/:id", "staff", c => { const b: any = pickClient(c.body); if (b.mobile) b.mobile = normMobile(b.mobile); const cl = col("clients").update(c.params.id, b); log(c.auth, "ویرایش موکل", cl?.name); return { client: cl }; });
add("DELETE", "/admin/clients/:id", "lawyer", c => { const id = c.params.id, cl = col("clients").get(id); ["cases", "sessions", "deadlines", "appointments", "documents", "payments", "messages", "notes"].forEach(n => col(n).removeWhere((x: any) => x.clientId === id)); col("clients").remove(id); log(c.auth, "حذف موکل", cl?.name); return ok; });
add("POST", "/admin/clients/:id/notes", "staff", c => ({ note: col("notes").insert({ clientId: c.params.id, text: String(c.body.text || "").slice(0, 1000), by: c.auth.name }) }));
add("GET", "/admin/cases", "staff", () => ({ cases: withNames(col("cases").all()), types: CASE_TYPES }));
add("GET", "/admin/cases/:id", "staff", c => { const cs = col("cases").get(c.params.id); if (!cs) throw H(404, "پیدا نشد"); return { case: { ...cs, clientName: nameOf(cs.clientId) }, sessions: col("sessions").find((s: any) => s.caseId === cs.id), deadlines: col("deadlines").find((d: any) => d.caseId === cs.id), documents: col("documents").find((d: any) => d.caseId === cs.id), payments: col("payments").find((p: any) => p.caseId === cs.id) }; });
add("POST", "/admin/cases", "staff", c => { const b = c.body; if (!b.clientId || !b.title) throw H(400, "موکل و عنوان لازم است"); const cs = col("cases").insert({ clientId: b.clientId, title: String(b.title).slice(0, 200), type: b.type || "contract", court: b.court || "", caseNo: b.caseNo || "", status: b.status || "preparation", fee: Number(b.fee) || 0, opened: todayStr(), timeline: [{ date: todayStr(), text: "افتتاح پرونده" }] }); log(c.auth, "ایجاد پرونده", cs.title); return { case: cs }; });
add("PUT", "/admin/cases/:id", "staff", c => { const b = c.body; const patch = Object.fromEntries(["title", "type", "court", "caseNo", "status", "fee"].filter(k => b[k] !== undefined).map(k => [k, k === "fee" ? Number(b[k]) : b[k]])); const cs = col("cases").update(c.params.id, patch); log(c.auth, "ویرایش پرونده", cs?.title); return { case: cs }; });
add("POST", "/admin/cases/:id/timeline", "staff", c => { const cs = col("cases").get(c.params.id); if (!cs) throw H(404, "پیدا نشد"); col("cases").update(cs.id, { timeline: [...cs.timeline, { date: c.body.date || todayStr(), text: String(c.body.text || "").slice(0, 300) }] }); return ok; });
add("DELETE", "/admin/cases/:id", "lawyer", c => { const id = c.params.id; ["sessions", "deadlines", "documents", "payments"].forEach(n => col(n).removeWhere((x: any) => x.caseId === id)); col("cases").remove(id); log(c.auth, "حذف پرونده"); return ok; });
for (const name of ["sessions", "deadlines"]) {
  add("GET", "/admin/" + name, "staff", () => ({ items: withNames(col(name).all()) }));
  add("POST", "/admin/" + name, "staff", c => { const b = c.body; const cs = col("cases").get(b.caseId); if (!cs || !b.date) throw H(400, "پرونده و تاریخ لازم است"); const it = col(name).insert({ caseId: cs.id, clientId: cs.clientId, date: b.date, time: b.time || "", title: b.title || "", court: b.court || cs.court, kind: b.kind || "جلسه رسیدگی", note: b.note || "", done: false }); log(c.auth, name === "sessions" ? "ثبت جلسه دادگاه" : "ثبت مهلت", cs.title); return { item: it }; });
  add("PUT", "/admin/" + name + "/:id", "staff", c => ({ item: col(name).update(c.params.id, c.body) }));
  add("DELETE", "/admin/" + name + "/:id", "staff", c => { col(name).remove(c.params.id); return ok; });
}
add("GET", "/admin/appointments", "staff", () => ({ appointments: withNames(col("appointments").all()).sort((a: any, b: any) => (a.date + a.time).localeCompare(b.date + b.time)), types: getSettings().types }));
add("POST", "/admin/appointments", "staff", c => { const b = c.body; if (!col("clients").get(b.clientId)) throw H(400, "موکل نامعتبر"); const r: any = createAppointment(b.clientId, b, "office"); if (r.error) throw H(400, r.error); if (b.confirm !== false) applyDecision(r.appt.id, "ok", c.auth.name); return r; });
add("PUT", "/admin/appointments/:id/decision", "staff", c => {
  const { decision, reason, date, time } = c.body;
  if (decision === "done" || decision === "noshow") { const u = col("appointments").update(c.params.id, { status: decision }); return { appt: u }; }
  const r: any = applyDecision(c.params.id, decision, c.auth.name, { reason, date, time }); if (r.error) throw H(400, r.error); log(c.auth, "تصمیم نوبت: " + decision, r.appt.name); return r;
});
add("DELETE", "/admin/appointments/:id", "staff", c => { col("appointments").remove(c.params.id); return ok; });
add("GET", "/admin/settings", "staff", () => ({ settings: getSettings(), telegram: { enabled: true, paired: true, botName: "Fitmindsetbot (شبیه‌سازی)", demo: true } }));
add("PUT", "/admin/settings", "lawyer", c => { const s = setSettings(c.body); log(c.auth, "تغییر تنظیمات نوبت‌دهی"); return { settings: s }; });
add("POST", "/admin/telegram/test", "lawyer", () => { tgSend("✅ تست اتصال: ربات دفتر وکالت به پنل متصل است. (شبیه‌سازی)"); return { ok: true }; });
add("POST", "/admin/demo/reset", "lawyer", c => { resetDemo(); return { reset: true }; });
add("GET", "/admin/documents", "staff", () => ({ documents: withNames(col("documents").all()).map((d: any) => ({ ...d, dataUrl: undefined })).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)) }));
add("POST", "/admin/documents", "staff", async (c: any) => { if (!c.file || !col("clients").get(c.body.clientId)) throw H(400, "فایل و موکل لازم است"); const rec = fileRecord(c.file, { title: c.body.title }); const d = col("documents").insert({ ...rec, clientId: c.body.clientId, caseId: c.body.caseId || null, category: c.body.category || "سایر", dataUrl: await readDataUrl(c.file), by: "office", visibleToClient: c.body.visibleToClient !== "false" }); log(c.auth, "آپلود مدرک", d.name); return { document: { ...d, dataUrl: undefined } }; });
add("DELETE", "/admin/documents/:id", "staff", c => { const d = col("documents").get(c.params.id); col("documents").remove(c.params.id); log(c.auth, "حذف مدرک", d?.name); return ok; });
add("GET", "/admin/payments", "staff", () => ({ payments: withNames(col("payments").all()) }));
add("POST", "/admin/payments", "staff", c => { const b = c.body; const cs = col("cases").get(b.caseId); if (!cs || !(Number(b.amount) > 0)) throw H(400, "پرونده و مبلغ لازم است"); const p = col("payments").insert({ clientId: cs.clientId, caseId: cs.id, title: b.title || "صورتحساب", amount: Number(b.amount), paid: 0, history: [], dueDate: b.dueDate || todayStr(), invoiceNo: `INV-${Date.now().toString().slice(-7)}` }); log(c.auth, "صدور صورتحساب", p.invoiceNo); return { payment: p }; });
add("POST", "/admin/payments/:id/pay", "staff", c => { const p = col("payments").get(c.params.id); const amt = Number(c.body.amount); if (!p || !(amt > 0)) throw H(400, "مبلغ نامعتبر"); const addv = Math.min(amt, bal(p)); col("payments").update(p.id, { paid: p.paid + addv, history: [...(p.history || []), { date: todayStr(), amount: addv, method: c.body.method || "نقدی" }] }); log(c.auth, "ثبت پرداخت", `${p.invoiceNo} — ${money(addv)}`); return ok; });
add("DELETE", "/admin/payments/:id", "lawyer", c => { col("payments").remove(c.params.id); return ok; });
add("GET", "/admin/messages", "staff", () => { const by: any = {}; col("messages").all().forEach((m: any) => { (by[m.clientId] ||= []).push(m); }); return { threads: Object.entries(by).map(([clientId, ms]: any) => { ms.sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt)); const cl = col("clients").get(clientId); return { clientId, clientName: cl?.name, mobile: cl?.mobile, last: ms[ms.length - 1], unread: ms.filter((m: any) => m.from === "client" && !m.read).length }; }).sort((a: any, b: any) => b.last.createdAt.localeCompare(a.last.createdAt)) }; });
add("GET", "/admin/messages/:clientId", "staff", c => { const ms = col("messages").find((m: any) => m.clientId === c.params.clientId).sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt)); ms.filter((m: any) => m.from === "client" && !m.read).forEach((m: any) => col("messages").update(m.id, { read: true })); return { messages: ms, client: col("clients").get(c.params.clientId) }; });
add("POST", "/admin/messages/:clientId", "staff", c => { const text = String(c.body.text || "").trim().slice(0, 1500); if (!text) throw H(400, "پیام خالی است"); return { message: col("messages").insert({ clientId: c.params.clientId, from: "office", text, read: false }) }; });
add("GET", "/admin/team", "lawyer", () => ({ users: col("users").all(), roles: { lawyer: "دسترسی کامل، تنظیمات، حذف و گزارش امنیتی", assistant: "مدیریت نوبت، پیام، مدارک و ثبت اطلاعات؛ بدون حذف، تنظیمات و لاگ", client: "فقط اطلاعات و پرونده‌های خودش" } }));
add("GET", "/admin/logs", "lawyer", () => ({ logs: col("logs").all().slice(-300).reverse() }));

// ---- simulated Telegram panel ----
add("GET", "/admin/demo/tg", "staff", () => ({ messages: col("tg").all().slice(-60) }));
add("POST", "/admin/demo/tg/seen", "staff", () => { col("tg").find((m: any) => !m.seen).forEach((m: any) => col("tg").update(m.id, { seen: true })); return ok; });
add("POST", "/admin/demo/tg/action", "staff", c => { tgCallback(c.body.id, c.body.data); return ok; });
add("POST", "/admin/demo/tg/command", "staff", c => { tgCommand(String(c.body.cmd || "")); return ok; });

// ================= exports (client-side) =================
const STAT: any = { preparation: "در حال بررسی", active: "در جریان", awaiting: "منتظر رأی", closed: "مختومه", new: "جدید", pending: "در انتظار", confirmed: "تأیید شده", rejected: "رد شده", done: "انجام شده", cancelled: "لغو شده", rescheduled: "زمان جدید پیشنهاد شد", noshow: "عدم حضور" };
const faD = (d: string) => (d ? fa(d, { year: "numeric", month: "2-digit", day: "2-digit" }) : "");
const x = (v: any) => String(v ?? "").replace(/[<>&"]/g, (ch: string) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch] as string));
function sheetXml(name: string, headers: string[], rows: any[][]) {
  const cell = (v: any) => (typeof v === "number" ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>` : `<Cell><Data ss:Type="String">${x(v)}</Data></Cell>`);
  return `<Worksheet ss:Name="${x(name)}"><Table>${`<Row>${headers.map(h => `<Cell ss:StyleID="h"><Data ss:Type="String">${x(h)}</Data></Cell>`).join("")}</Row>`}${rows.map(r => `<Row>${r.map(cell).join("")}</Row>`).join("")}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><DisplayRightToLeft/><FreezePanes/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane></WorksheetOptions></Worksheet>`;
}
function buildXls(what: string) {
  const sheets: string[] = [];
  const clients = () => sheets.push(sheetXml("موکلان", ["نام", "نوع", "موبایل", "کد/شناسه ملی", "شهر", "ایمیل", "وضعیت", "تعداد پرونده", "مانده بدهی (تومان)", "تاریخ عضویت"], col("clients").all().map((c: any) => [c.name, c.kind === "legal" ? "حقوقی" : "حقیقی", c.mobile, c.idNo, c.city, c.email, STAT[c.status] || c.status, col("cases").find((y: any) => y.clientId === c.id).length, col("payments").find((p: any) => p.clientId === c.id).reduce((s: number, p: any) => s + bal(p), 0), faD(c.joinedAt)])));
  const cases = () => sheets.push(sheetXml("پرونده‌ها", ["موکل", "عنوان", "نوع", "مرجع", "شماره پرونده", "وضعیت", "حق‌الوکاله (تومان)", "تاریخ افتتاح"], col("cases").all().map((c: any) => [nameOf(c.clientId), c.title, CASE_TYPES[c.type], c.court, c.caseNo, STAT[c.status], c.fee, faD(c.opened)])));
  const fin = () => sheets.push(sheetXml("مالی", ["شماره", "موکل", "شرح", "مبلغ", "پرداخت‌شده", "مانده", "سررسید"], col("payments").all().map((p: any) => [p.invoiceNo, nameOf(p.clientId), p.title, p.amount, p.paid, bal(p), faD(p.dueDate)])));
  const ap = () => sheets.push(sheetXml("نوبت‌ها", ["موکل", "موبایل", "تاریخ", "ساعت", "نوع", "وضعیت", "موضوع"], col("appointments").all().map((a: any) => [a.name, a.mobile, faD(a.date), a.time, getSettings().types[a.type]?.label, STAT[a.status], a.topic])));
  if (what === "clients") clients(); else if (what === "cases") cases(); else if (what === "finance") fin(); else if (what === "appointments") ap(); else if (what === "all") { clients(); cases(); fin(); ap(); } else throw H(404, "نامعتبر");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0B1B33" ss:Pattern="Solid"/></Style></Styles>${sheets.join("")}</Workbook>`;
  return new Blob([xml], { type: "application/vnd.ms-excel" });
}
function samplePdf(id: string) {
  const body = `BT /F1 18 Tf 72 720 Td (SAMPLE DOCUMENT (demo) - ${id}) Tj ET`;
  const pdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length ${body.length}>>stream\n${body}\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R/Size 6>>\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}
async function dataUrlToBlob(u: string) { return await (await fetch(u)).blob(); }
// Called by the UI's download() helper while in demo mode.
export async function demoDownload(path: string) {
  const [p] = path.split("?"); const auth = getAuth(areaOf(p));
  let m = p.match(/^\/admin\/export\/([^/]+)\.xlsx$/);
  if (m) { if (!guardOk("staff", auth)) throw H(401, "نیاز به ورود دارید"); log(auth, "خروجی Excel", m[1]); persistNow(); return { blob: buildXls(m[1]), filename: `${m[1]}.xls` }; }
  m = p.match(/^\/(admin|me)\/documents\/([^/]+)\/download$/);
  if (m) {
    if (!guardOk(m[1] === "admin" ? "staff" : "client", auth)) throw H(401, "نیاز به ورود دارید");
    const d = col("documents").get(m[2]); if (!d || (m[1] === "me" && (d.clientId !== auth.sub || !d.visibleToClient))) throw H(404, "پیدا نشد");
    log(auth, "دانلود مدرک", d.name);
    return { blob: d.dataUrl ? await dataUrlToBlob(d.dataUrl) : samplePdf(d.id), filename: d.dataUrl ? `${d.name}.${d.ext}` : "sample.pdf" };
  }
  throw H(404, "پیدا نشد");
}
export { db };
