import { useEffect, useRef, useState } from "react";
import { Link, Route, Switch, useLocation, useParams } from "wouter";
import { Briefcase, CalendarPlus, FileText, Home, LogOut, MessageSquare, User, Wallet } from "lucide-react";
import { api, BASE, useApi } from "./api";
import { useAuth } from "./PortalApp";
import { SlotPicker } from "./Shared";
import { APPT, CASE_TYPES, dt, fd, jd, money, rel, size, TYPES } from "./fmt";
import { ApptBadge, CaseBadge, Empty, ErrorBox, Field, Loading, Modal, Stat, download, fail, ok, useBusy } from "./ui";

const NAV: [string, string, any][] = [["/portal", "خانه", Home], ["/portal/cases", "پرونده‌ها", Briefcase], ["/portal/appointments", "نوبت‌ها", CalendarPlus], ["/portal/documents", "مدارک", FileText], ["/portal/payments", "مالی", Wallet], ["/portal/messages", "پیام‌ها", MessageSquare], ["/portal/profile", "پروفایل", User]];
export default function ClientApp() {
  const { user, logout } = useAuth(); const [loc] = useLocation(); const { data } = useApi<any>("/me/overview", 20000);
  const on = (p: string) => (p === "/portal" ? loc === p : loc.startsWith(p));
  return <div className="pt-shell"><aside className="pt-side"><div className="pt-brand"><div className="pt-logo">SN</div><div><b>پورتال موکلان</b><small>{user?.name}</small></div></div>
    <nav className="pt-nav">{NAV.map(([p, l, Icon]) => <Link key={p} href={p} className={on(p) ? "on" : ""}><Icon size={18} />{l}{p === "/portal/messages" && data?.unread ? <span className="bd">{data.unread}</span> : null}</Link>)}<hr /><Link href="/"><Home size={18} />بازگشت به سایت</Link></nav>
    <div style={{ padding: 12 }}><button className="btn ghost" style={{ width: "100%" }} onClick={logout}><LogOut size={16} />خروج</button></div></aside>
    <div className="pt-main"><header className="pt-top"><h1>{NAV.find(([p]) => on(p))?.[1] || "پورتال"}</h1><div className="sp" /><Link href="/portal/book" className="btn gold">+ دریافت نوبت</Link><button className="btn ghost sm only-m" onClick={logout} aria-label="خروج"><LogOut size={16} /></button></header>
      <main className="pt-body"><Switch><Route path="/portal" component={HomePage} /><Route path="/portal/cases" component={CasesPage} /><Route path="/portal/cases/:id" component={CasePage} /><Route path="/portal/book" component={BookPage} /><Route path="/portal/appointments" component={ApptsPage} /><Route path="/portal/documents" component={DocsPage} /><Route path="/portal/payments" component={PayPage} /><Route path="/portal/messages" component={MsgPage} /><Route path="/portal/profile" component={ProfilePage} /><Route><Empty>صفحه پیدا نشد</Empty></Route></Switch></main></div>
    <nav className="pt-bottom" aria-label="ناوبری">{NAV.filter(([p]) => p !== "/portal/profile").map(([p, l, Icon]) => <Link key={p} href={p} className={on(p) ? "on" : ""}><Icon size={20} />{l}</Link>)}</nav></div>;
}

function HomePage() {
  const { data: d, error } = useApi<any>("/me/overview", 15000);
  if (error) return <ErrorBox msg={error} />; if (!d) return <Loading />;
  const c = d.client; const incomplete = c.status === "new";
  return <div className="grid">
    <div className="card" style={{ background: "linear-gradient(135deg,#0b1b33,#16305a)", color: "#fff" }}><h2 style={{ color: "#f4d487", fontSize: 21 }}>سلام {c.name} 👋</h2><p style={{ color: "#cdd3de" }}>به پورتال اختصاصی موکلان دفتر وکالت دکتر نیک‌سرشت خوش آمدید. از اینجا روند پرونده، جلسات، مدارک و صورتحساب‌هایتان را می‌بینید و نوبت می‌گیرید.</p><div className="row" style={{ marginTop: 12 }}><Link href="/portal/book" className="btn gold">دریافت نوبت مشاوره</Link>{incomplete && <Link href="/portal/profile" className="btn ghost">تکمیل پروفایل</Link>}</div></div>
    <div className="grid g4"><Stat icon={<Briefcase size={22} />} label="پرونده فعال" value={fd(c.cases.filter((x: any) => x.status !== "closed").length)} /><Stat icon={<CalendarPlus size={22} />} label="نوبت پیش‌رو" value={fd(d.upcomingAppts.length)} /><Stat icon={<Wallet size={22} />} label="مانده حساب" value={d.balance > 0 ? money(d.balance) : "تسویه ✓"} /><Stat icon={<MessageSquare size={22} />} label="پیام جدید" value={fd(d.unread)} /></div>
    <div className="grid g2">
      <div className="card"><h3>نوبت‌های من</h3>{!d.upcomingAppts.length ? <Empty>نوبت فعالی ندارید</Empty> : <div className="list">{d.upcomingAppts.map((a: any) => <div key={a.id} className="row sb"><div><b>{TYPES[a.type]}</b> · {jd(a.date, "day")} · {fd(a.time)}</div><ApptBadge k={a.status} /></div>)}</div>}</div>
      <div className="card"><h3>جلسات و مهلت‌های پیش‌رو</h3>{!d.nextSessions.length && !d.deadlines.length ? <Empty>موردی ثبت نشده</Empty> : <div className="list">{d.nextSessions.map((s: any) => <div key={s.id} className="row sb"><span>⚖️ {s.court}</span><span className="badge blue">{jd(s.date, "day")} · {rel(s.date)}</span></div>)}{d.deadlines.map((s: any) => <div key={s.id} className="row sb"><span>⏳ {s.title}</span><span className="badge amber">{jd(s.date, "day")}</span></div>)}</div>}</div></div>
    <div className="card"><h3>پرونده‌های من</h3><div className="list">{c.cases.map((x: any) => <Link key={x.id} href={"/portal/cases/" + x.id} className="row sb" style={{ display: "flex" }}><div><b>{x.title}</b><div className="small muted">{CASE_TYPES[x.type]}</div></div><CaseBadge k={x.status} /></Link>)}{!c.cases.length && <Empty>هنوز پرونده‌ای برای شما باز نشده است.</Empty>}</div></div></div>;
}
function CasesPage() {
  const { data } = useApi<any>("/me/overview"); if (!data) return <Loading />;
  if (!data.client.cases.length) return <Empty>هنوز پرونده‌ای برای شما ثبت نشده است. پس از مشاوره و دریافت وکالت‌نامه، پرونده شما اینجا نمایش داده می‌شود.</Empty>;
  return <div className="grid">{data.client.cases.map((x: any) => <Link key={x.id} href={"/portal/cases/" + x.id} className="card"><div className="row sb"><div><b style={{ fontSize: 16 }}>{x.title}</b><div className="small muted">{CASE_TYPES[x.type]} · {x.court}</div><div className="small muted">شماره پرونده: <span className="ltr">{fd(x.caseNo || "—")}</span></div></div><CaseBadge k={x.status} /></div></Link>)}</div>;
}
function CasePage() {
  const { id } = useParams<{ id: string }>(); const { data, error } = useApi<any>(`/me/cases/${id}`);
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />; const c = data.case; const T = new Date().toLocaleDateString("en-CA");
  return <div className="grid"><div className="card"><div className="row sb"><div><div className="muted small">{CASE_TYPES[c.type]}</div><h2 style={{ fontSize: 20 }}>{c.title}</h2><div className="muted">{c.court} · شماره <span className="ltr">{fd(c.caseNo || "—")}</span></div></div><CaseBadge k={c.status} /></div></div>
    <div className="grid g2"><div className="card"><h3>روند پرونده</h3><div className="tl">{[...c.timeline].sort((a: any, b: any) => b.date.localeCompare(a.date)).map((e: any, i: number) => <div key={i}><b>{e.text}</b><div className="small muted">{jd(e.date)}</div></div>)}</div></div>
      <div className="grid"><div className="card"><h3>جلسات دادگاه</h3>{!data.sessions.length ? <Empty>—</Empty> : <div className="list">{data.sessions.sort((a: any, b: any) => a.date.localeCompare(b.date)).map((s: any) => <div key={s.id} className="row sb"><span>{s.kind}</span><span className={"badge " + (s.date >= T && !s.done ? "blue" : "gray")}>{jd(s.date, "short")} {s.time && fd(s.time)}</span></div>)}</div>}</div>
        <div className="card"><h3>مدارک پرونده</h3>{!data.documents.length ? <Empty>—</Empty> : <div className="list">{data.documents.map((d: any) => <div key={d.id} className="row sb"><span>📄 {d.name}</span><button className="btn ghost sm" onClick={() => download(`${BASE}/me/documents/${d.id}/download`)}>دانلود</button></div>)}</div>}</div></div></div></div>;
}
function BookPage() {
  const [v, setV] = useState({ type: "", date: "", time: "" }); const [topic, setTopic] = useState(""); const [done, setDone] = useState(false); const [busy, run] = useBusy();
  const { data: cfg } = useApi<any>("/public/booking"); const t = cfg?.types?.[v.type];
  if (done) return <div className="card" style={{ textAlign: "center", padding: 34 }}><div style={{ fontSize: 42 }}>✅</div><h2>درخواست شما ثبت شد</h2><p className="muted" style={{ margin: "8px 0 16px" }}>پس از تأیید وکیل، نتیجه همین‌جا و در بخش پیام‌ها به شما اطلاع داده می‌شود.</p><Link href="/portal/appointments" className="btn gold">مشاهده نوبت‌ها</Link></div>;
  return <div className="card"><h3>دریافت نوبت مشاوره</h3><SlotPicker value={v} onChange={setV} />
    <Field label="موضوع مشاوره (اختیاری)"><textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)} placeholder="به‌طور خلاصه توضیح دهید…" /></Field>
    {t && v.time && <div className="demo mb">خلاصه: <b>{t.label}</b> — {jd(v.date, "long")} ساعت {fd(v.time)} — هزینه مشاوره {money(t.price)}</div>}
    <button className="btn gold" disabled={!v.time || busy} onClick={() => run(async () => { await api("/me/appointments", { body: { ...v, topic } }); setDone(true); })}>ثبت درخواست نوبت</button></div>;
}
function ApptsPage() {
  const { data, error, reload } = useApi<any>("/me/overview", 10000); const [busy, run] = useBusy();
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />; const list = data.client.appointments;
  const respond = (id: string, accept: boolean) => run(async () => { await api(`/me/appointments/${id}/respond`, { body: { accept } }); ok(accept ? "زمان جدید تأیید شد" : "ثبت شد"); reload(); });
  return <div><div className="row mb"><Link href="/portal/book" className="btn gold">+ نوبت جدید</Link></div>{!list.length ? <Empty>هنوز نوبتی نگرفته‌اید</Empty> : <div className="grid">{list.map((a: any) => <div className="card" key={a.id}><div className="row sb"><div><div className="row"><b>{TYPES[a.type]}</b><ApptBadge k={a.status} /></div><div className="muted">{jd(a.date, "long")} · ساعت {fd(a.time)}</div>{a.topic && <div className="small">{a.topic}</div>}
      {a.status === "confirmed" && a.type === "online" && a.meetLink && <div className="small">🔗 <a className="ltr" style={{ color: "#1f4f99" }} href={a.meetLink} target="_blank" rel="noopener noreferrer">ورود به جلسه آنلاین</a></div>}
      {a.status === "rejected" && a.reason && <div className="small muted">توضیح وکیل: {a.reason}</div>}
      {a.status === "rescheduled" && a.proposed && <div className="demo" style={{ marginTop: 8 }}>زمان پیشنهادی وکیل: <b>{jd(a.proposed.date, "long")} ساعت {fd(a.proposed.time)}</b><div className="row" style={{ marginTop: 8 }}><button className="btn green sm" disabled={busy} onClick={() => respond(a.id, true)}>می‌پذیرم</button><button className="btn ghost sm" disabled={busy} onClick={() => respond(a.id, false)}>نمی‌پذیرم</button></div></div>}</div>
      {["pending", "confirmed"].includes(a.status) && a.date >= new Date().toLocaleDateString("en-CA") && <button className="btn ghost sm" onClick={async () => { if (confirm("نوبت لغو شود؟")) { try { await api(`/me/appointments/${a.id}/cancel`, { body: {} }); reload(); } catch (e) { fail(e); } } }}>لغو</button>}</div></div>)}</div>}</div>;
}
function DocsPage() {
  const { data, reload } = useApi<any>("/me/overview"); const [up, setUp] = useState(false); const [file, setFile] = useState<File | null>(null); const [cat, setCat] = useState("هویتی و وکالت"); const [cs, setCs] = useState(""); const [busy, run] = useBusy();
  if (!data) return <Loading />; const docs = data.client.documents.filter((d: any) => d.visibleToClient);
  return <div><div className="row mb"><button className="btn gold" onClick={() => setUp(true)}>+ بارگذاری مدرک</button><span className="small muted">PDF، عکس، Word، Excel — تا ۱۰ مگابایت</span></div>
    {!docs.length ? <Empty>هنوز مدرکی بارگذاری نشده</Empty> : <div className="tbl-wrap"><table className="tbl"><thead><tr><th>مدرک</th><th>دسته</th><th>حجم</th><th>تاریخ</th><th /></tr></thead><tbody>{docs.map((d: any) => <tr key={d.id}><td>📄 {d.name}</td><td>{d.category}</td><td>{size(d.size)}</td><td>{dt(d.createdAt)}</td><td><button className="btn ghost sm" onClick={() => download(`${BASE}/me/documents/${d.id}/download`)}>دانلود</button></td></tr>)}</tbody></table></div>}
    {up && <Modal title="بارگذاری مدرک" onClose={() => setUp(false)}><Field label="فایل"><input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.txt" onChange={e => setFile(e.target.files?.[0] || null)} /></Field><Field label="دسته"><select value={cat} onChange={e => setCat(e.target.value)}>{["هویتی و وکالت", "قراردادها", "دادگاهی", "مالی", "سایر"].map(x => <option key={x}>{x}</option>)}</select></Field>
      <Field label="مربوط به پرونده"><select value={cs} onChange={e => setCs(e.target.value)}><option value="">— عمومی —</option>{data.client.cases.map((x: any) => <option key={x.id} value={x.id}>{x.title.slice(0, 40)}</option>)}</select></Field>
      <button className="btn gold" disabled={!file || busy} onClick={() => run(async () => { const f = new FormData(); f.append("category", cat); f.append("caseId", cs); f.append("file", file!); await api("/me/documents", { form: f }); ok("مدرک ارسال شد"); setUp(false); setFile(null); reload(); })}>ارسال</button></Modal>}</div>;
}
function PayPage() {
  const { data } = useApi<any>("/me/overview"); if (!data) return <Loading />; const p = data.client.payments;
  return <div className="grid"><div className="card row sb"><div><div className="muted small">مانده حساب شما</div><b style={{ fontSize: 22, color: data.balance > 0 ? "#a3231b" : "#15663a" }}>{data.balance > 0 ? money(data.balance) : "تسویه کامل ✓"}</b></div><div className="small muted">پرداخت‌ها از طریق دفتر ثبت می‌شوند. برای پرداخت با دفتر هماهنگ کنید.</div></div>
    {!p.length ? <Empty>صورتحسابی ثبت نشده</Empty> : <div className="tbl-wrap"><table className="tbl"><thead><tr><th>شماره</th><th>شرح</th><th>مبلغ</th><th>پرداخت‌شده</th><th>مانده</th><th>سررسید</th></tr></thead><tbody>{p.map((x: any) => <tr key={x.id}><td className="ltr">{fd(x.invoiceNo)}</td><td>{x.title}</td><td>{money(x.amount)}</td><td>{money(x.paid)}</td><td>{money(x.amount - x.paid)}</td><td>{jd(x.dueDate, "short")}</td></tr>)}</tbody></table></div>}</div>;
}
function MsgPage() {
  const { data, reload } = useApi<any>("/me/messages", 8000); const [t, setT] = useState(""); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [data?.messages.length]);
  if (!data) return <Loading />;
  const send = async () => { if (!t.trim()) return; try { await api("/me/messages", { body: { text: t } }); setT(""); reload(); } catch (e) { fail(e); } };
  return <div className="card"><div className="chat">{data.messages.length ? data.messages.map((m: any) => <div key={m.id} className={"msg" + (m.from === "client" ? " me" : "")}>{m.text}<small>{dt(m.createdAt)}</small></div>) : <Empty>هنوز پیامی ندارید</Empty>}<div ref={end} /></div><div className="row mt"><input value={t} onChange={e => setT(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="پیام به دفتر وکالت…" /><button className="btn gold" onClick={send}>ارسال</button></div></div>;
}
function ProfilePage() {
  const { data, reload } = useApi<any>("/me/overview"); const [f, setF] = useState<any>(null); const [busy, run] = useBusy();
  useEffect(() => { if (data) setF(data.client); }, [data]); if (!f) return <Loading />; const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return <div className="card"><h3>اطلاعات من</h3><div className="grid g2"><Field label="نام و نام خانوادگی"><input value={f.name} onChange={set("name")} /></Field><Field label="موبایل"><input className="ltr" value={f.mobile} disabled /></Field><Field label="کد ملی"><input className="ltr" value={f.idNo || ""} onChange={set("idNo")} /></Field><Field label="شهر"><input value={f.city || ""} onChange={set("city")} /></Field><Field label="ایمیل (اختیاری)"><input className="ltr" value={f.email || ""} onChange={set("email")} /></Field><Field label="نشانی"><input value={f.address || ""} onChange={set("address")} /></Field></div>
    <button className="btn gold" disabled={busy} onClick={() => run(async () => { await api("/me/profile", { method: "PUT", body: f }); ok("ذخیره شد"); reload(); })}>ذخیره</button></div>;
}
