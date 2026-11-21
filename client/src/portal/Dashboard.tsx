import { Link } from "wouter";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Banknote, Briefcase, CalendarCheck, Clock, Gavel, MessageSquare, UserPlus, Users } from "lucide-react";
import { api, useApi } from "./api";
import { CASE_ST, dt, fd, jd, money, rel, short, TYPES, APPT } from "./fmt";
import { ErrorBox, Loading, Stat, fail, ok } from "./ui";

const COLORS = ["#b8923a", "#0b1b33", "#3b6bb5", "#1e7a46", "#a3231b", "#7a5ea8", "#c9742e", "#4a8f94", "#8a8f99", "#d9b45b"];
export default function Dashboard() {
  const { data: d, error, reload } = useApi<any>("/admin/dashboard", 15000);
  if (error) return <ErrorBox msg={error} />; if (!d) return <Loading />;
  const k = d.kpi;
  const decide = async (id: string, decision: string) => { try { await api(`/admin/appointments/${id}/decision`, { method: "PUT", body: { decision } }); ok(decision === "ok" ? "نوبت تأیید شد و به موکل اطلاع داده شد" : "نوبت رد شد"); reload(); } catch (e) { fail(e); } };
  const test = async () => { try { const r = await api("/admin/telegram/test", { body: {} }); r.ok ? ok("پیام تست به تلگرام ارسال شد") : fail({ message: "ارسال نشد — ابتدا در تلگرام به ربات /start بزنید" }); } catch (e) { fail(e); } };
  const tg = d.telegram;
  return <div className="grid">
    {!tg.paired && <div className="demo">🤖 <b>اتصال تلگرام:</b> {tg.enabled ? <>ربات <b className="ltr">@{tg.botName}</b> فعال است. در تلگرام آن را باز کنید و <b>/start</b> بفرستید تا درخواست‌های نوبت برای شما ارسال شود.</> : <>توکن ربات تنظیم نشده. فایل <b className="ltr">portal-api/.env</b> را بررسی کنید.</>}</div>}
    <div className="grid g4">
      <Stat icon={<Users size={22} />} label="کل موکلان" value={fd(k.clients)} sub={k.newClients ? `${fd(k.newClients)} ثبت‌نام جدید` : undefined} />
      <Stat icon={<Briefcase size={22} />} label="پرونده‌های فعال" value={fd(k.activeCases)} />
      <Stat icon={<CalendarCheck size={22} />} label="نوبت در انتظار تأیید" value={fd(k.pendingAppts)} />
      <Stat icon={<MessageSquare size={22} />} label="پیام‌های خوانده‌نشده" value={fd(k.unread)} />
      <Stat icon={<Gavel size={22} />} label="جلسه دادگاه این هفته" value={fd(k.sessionsWeek)} />
      <Stat icon={<AlertTriangle size={22} />} label="مهلت‌های هفته جاری" value={fd(k.deadlinesWeek)} />
      <Stat icon={<Banknote size={22} />} label="دریافتی کل" value={short(k.collected)} sub="تومان" />
      <Stat icon={<Clock size={22} />} label="مطالبات معوق" value={short(k.outstanding)} sub="تومان" />
    </div>
    <div className="grid g21">
      <div className="card"><h3>درآمد ماهانه (میلیون تومان)</h3><div style={{ height: 260, direction: "ltr" }}><ResponsiveContainer><BarChart data={d.months.map((m: any) => ({ ...m, v: Math.round(m.revenue / 1e6) }))}><CartesianGrid strokeDasharray="3 3" stroke="#eee" /><XAxis dataKey="label" tick={{ fontFamily: "Vazirmatn", fontSize: 12 }} /><YAxis tick={{ fontSize: 11, fontFamily: "Vazirmatn" }} tickFormatter={(v: any) => fd(v)} /><Tooltip formatter={(v: any) => [fd(v) + " میلیون تومان", "درآمد"]} /><Bar dataKey="v" fill="#b8923a" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      <div className="card"><h3>پرونده‌ها بر اساس حوزه</h3><div style={{ height: 260, direction: "ltr" }}><ResponsiveContainer><PieChart><Pie data={d.casesByType} dataKey="value" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={2}>{d.casesByType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: any, n: any) => [fd(v), n]} /></PieChart></ResponsiveContainer></div>
        <div className="small muted" style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px" }}>{d.casesByType.map((c: any, i: number) => <span key={c.name}><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: 3, background: COLORS[i % COLORS.length], marginLeft: 4 }} />{c.name} ({fd(c.value)})</span>)}</div></div>
    </div>
    <div className="grid g2">
      <div className="card"><div className="card-h"><span>درخواست‌های نوبت در انتظار</span><Link href="/admin/appointments" className="small" style={{ color: "#8e702e" }}>همه ←</Link></div>
        {d.pending.length === 0 ? <div className="empty">درخواستی در انتظار نیست 👌</div> : <div className="list">{d.pending.map((a: any) => <div key={a.id}><div className="row sb"><div><b>{a.clientName}</b><div className="small muted">{TYPES[a.type]} · {jd(a.date, "day")} · ساعت {fd(a.time)}</div>{a.topic && <div className="small">{a.topic}</div>}</div><div className="row"><button className="btn green sm" onClick={() => decide(a.id, "ok")}>تأیید</button><button className="btn red sm" onClick={() => decide(a.id, "no")}>رد</button></div></div></div>)}</div>}</div>
      <div className="card"><div className="card-h"><span>برنامه امروز — {jd(d.today.date, "long")}</span></div>
        {!d.today.appointments.length && !d.today.sessions.length ? <div className="empty">برنامه‌ای برای امروز ثبت نشده</div> : <div className="list">{d.today.appointments.map((a: any) => <div key={a.id}>🤝 <b>{fd(a.time)}</b> — {a.clientName} <span className="muted small">({TYPES[a.type]})</span></div>)}{d.today.sessions.map((s: any) => <div key={s.id}>⚖️ <b>{fd(s.time || "")}</b> — {s.court} <div className="small muted">{s.caseTitle}</div></div>)}</div>}</div>
      <div className="card"><div className="card-h"><span>جلسات دادگاه پیش‌رو</span><Link href="/admin/calendar" className="small" style={{ color: "#8e702e" }}>تقویم ←</Link></div><div className="list">{d.upcomingSessions.map((s: any) => <div key={s.id} className="row sb"><div><b>{s.clientName}</b><div className="small muted">{s.court}</div></div><div style={{ textAlign: "left" }}><div>{jd(s.date, "day")} {s.time && "· " + fd(s.time)}</div><span className="badge blue">{rel(s.date)}</span></div></div>)}</div></div>
      <div className="card"><div className="card-h"><span>مهلت‌های قانونی نزدیک</span></div><div className="list">{d.deadlines.map((s: any) => <div key={s.id} className="row sb"><div><b>{s.title}</b><div className="small muted">{s.clientName} · {s.caseTitle?.slice(0, 34)}</div></div><span className={"badge " + (new Date(s.date).getTime() - Date.now() < 4 * 864e5 ? "red" : "amber")}>{jd(s.date, "day")} · {rel(s.date)}</span></div>)}</div></div>
    </div>
    <div className="grid g2">
      <div className="card"><h3>آخرین فعالیت‌ها</h3><div className="list">{d.recentLogs.map((l: any) => <div key={l.id} className="row sb small"><span><b>{l.actorName}</b> — {l.action}{l.detail ? ` (${l.detail})` : ""}</span><span className="muted">{dt(l.createdAt)}</span></div>)}</div></div>
      <div className="card"><h3>وضعیت اتصال‌ها</h3><div className="list">
        <div className="row sb"><span>ربات تلگرام {tg.botName && <span className="ltr muted">@{tg.botName}</span>}</span><span className={"chip " + (tg.paired ? "ok" : "warn")}>{tg.paired ? "متصل" : tg.enabled ? "منتظر /start" : "غیرفعال"}</span></div>
        <div className="row sb"><span>واتساپ بیزنس</span><span className="chip">به‌زودی (پس از دریافت API)</span></div>
        <div className="row sb"><span>پیامک کد ورود موکل</span><span className="chip warn">حالت نمایشی</span></div>
        <div><button className="btn ghost sm" onClick={test} disabled={!tg.enabled}>ارسال پیام تست به تلگرام</button></div></div></div>
    </div>
  </div>;
}
