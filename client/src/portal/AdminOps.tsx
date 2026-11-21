import { useState } from "react";
import { Link } from "wouter";
import { api, BASE, useApi } from "./api";
import { dt, fd, jalaliMonth, jd, money, size, today, short, TYPES } from "./fmt";
import { Empty, ErrorBox, Field, Loading, Modal, Stat, download, fail, ok, useBusy } from "./ui";
import { Banknote, Clock, Wallet } from "lucide-react";

export function CalendarPage() {
  const [ref, setRef] = useState(today()); const [sel, setSel] = useState(today());
  const { data: ses } = useApi<any>("/admin/sessions"); const { data: dl } = useApi<any>("/admin/deadlines"); const { data: ap } = useApi<any>("/admin/appointments");
  const m = jalaliMonth(ref);
  const by: Record<string, any[]> = {};
  const push = (d: string, e: any) => (by[d] ||= []).push(e);
  ses?.items.forEach((s: any) => push(s.date, { k: "s", t: `⚖️ ${s.time ? fd(s.time) + " " : ""}${s.clientName}`, s }));
  dl?.items.filter((x: any) => !x.done).forEach((s: any) => push(s.date, { k: "d", t: `⏳ ${s.title}`, s }));
  ap?.appointments.filter((a: any) => a.status === "confirmed").forEach((a: any) => push(a.date, { k: "a", t: `🤝 ${fd(a.time)} ${a.clientName}`, s: a }));
  const week = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  return <div className="grid g21">
    <div className="card"><div className="row sb mb"><div className="row"><button className="btn ghost sm" onClick={() => setRef(m.next)}>→ ماه بعد</button><button className="btn ghost sm" onClick={() => { setRef(today()); setSel(today()); }}>امروز</button><button className="btn ghost sm" onClick={() => setRef(m.prev)}>ماه قبل ←</button></div><h2 style={{ fontSize: 19 }}>{m.title}</h2></div>
      <div className="cal">{week.map(w => <div className="h" key={w}>{w}</div>)}{m.cells.map((c, i) => c ? <div key={i} className={"d" + (c.date === today() ? " today" : "") + (c.date === sel ? " sel" : "")} onClick={() => setSel(c.date)}><b>{fd(c.day)}</b>{(by[c.date] || []).slice(0, 3).map((e, j) => <div key={j} className={"ev " + e.k}>{e.t}</div>)}{(by[c.date] || []).length > 3 && <div className="small muted">+{fd(by[c.date].length - 3)}</div>}</div> : <div key={i} className="d off" />)}</div>
      <div className="small muted mt"><span className="ev s" style={{ padding: "1px 8px" }}>جلسه دادگاه</span> <span className="ev a" style={{ padding: "1px 8px" }}>نوبت مشاوره</span> <span className="ev d" style={{ padding: "1px 8px" }}>مهلت قانونی</span></div></div>
    <div className="card"><h3>{jd(sel, "long")}</h3>{!(by[sel] || []).length ? <Empty>رویدادی ثبت نشده</Empty> : <div className="list">{by[sel].map((e, i) => <div key={i}><div className={"ev " + e.k} style={{ fontSize: 13, padding: "4px 8px", whiteSpace: "normal" }}>{e.t}</div><div className="small muted">{e.k === "s" ? e.s.court : e.k === "a" ? TYPES[e.s.type] : e.s.caseTitle}</div></div>)}</div>}
      <p className="small muted mt">برای افزودن جلسه یا مهلت، وارد صفحه پرونده شوید.</p></div></div>;
}

export function DocumentsPage() {
  const { data, error, reload } = useApi<any>("/admin/documents"); const [q, setQ] = useState(""); const [cat, setCat] = useState("");
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />;
  const list = data.documents.filter((d: any) => (!cat || d.category === cat) && (!q || (d.name + d.clientName).includes(q)));
  return <div><div className="row mb"><input style={{ maxWidth: 260 }} placeholder="جستجوی نام مدرک یا موکل…" value={q} onChange={e => setQ(e.target.value)} /><select style={{ width: 170 }} value={cat} onChange={e => setCat(e.target.value)}><option value="">همه دسته‌ها</option>{["هویتی و وکالت", "قراردادها", "دادگاهی", "مالی", "سایر"].map(x => <option key={x}>{x}</option>)}</select><span className="muted small">{fd(list.length)} مدرک</span></div>
    <div className="tbl-wrap"><table className="tbl"><thead><tr><th>مدرک</th><th>موکل</th><th>دسته</th><th>حجم</th><th>منبع</th><th>تاریخ</th><th /></tr></thead><tbody>{list.map((d: any) => <tr key={d.id}><td>📄 {d.name}</td><td><Link href={"/admin/clients/" + d.clientId} style={{ color: "#8e702e" }}>{d.clientName}</Link></td><td>{d.category}</td><td>{size(d.size)}</td><td>{d.by === "client" ? <span className="badge blue">آپلود موکل</span> : "دفتر"}</td><td>{dt(d.createdAt)}</td><td><button className="btn ghost sm" onClick={() => download(`${BASE}/admin/documents/${d.id}/download`)}>دانلود</button></td></tr>)}</tbody></table></div></div>;
}

export function FinancePage() {
  const { data, error, reload } = useApi<any>("/admin/payments"); const [pay, setPay] = useState<any>(null); const [inv, setInv] = useState(false); const [f, setF] = useState("all");
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />;
  const all = data.payments, tot = all.reduce((s: number, p: any) => s + p.amount, 0), paid = all.reduce((s: number, p: any) => s + p.paid, 0), T = today();
  const list = all.filter((p: any) => f === "all" || (f === "open" ? p.amount > p.paid : f === "late" ? p.amount > p.paid && p.dueDate < T : p.amount <= p.paid));
  return <div><div className="grid g3 mb"><Stat icon={<Wallet size={22} />} label="مجموع صورتحساب‌ها" value={short(tot)} sub="تومان" /><Stat icon={<Banknote size={22} />} label="دریافت‌شده" value={short(paid)} sub={`${fd(Math.round((paid / (tot || 1)) * 100))}٪ از کل`} /><Stat icon={<Clock size={22} />} label="مانده" value={short(tot - paid)} sub="تومان" /></div>
    <div className="row mb no-print"><select style={{ width: 170 }} value={f} onChange={e => setF(e.target.value)}><option value="all">همه</option><option value="open">پرداخت‌نشده / ناقص</option><option value="late">معوق (گذشته از سررسید)</option><option value="paid">تسویه‌شده</option></select><div className="sp" /><button className="btn ghost" onClick={() => download(BASE + "/admin/export/finance.xlsx")}>خروجی Excel</button><button className="btn ghost" onClick={() => window.print()}>خروجی PDF</button><button className="btn gold" onClick={() => setInv(true)}>+ صورتحساب جدید</button></div>
    <div className="tbl-wrap"><table className="tbl"><thead><tr><th>شماره</th><th>موکل</th><th>شرح</th><th>مبلغ</th><th>پرداخت‌شده</th><th>پیشرفت</th><th>سررسید</th><th className="no-print" /></tr></thead><tbody>{list.map((p: any) => <tr key={p.id}><td className="ltr">{fd(p.invoiceNo)}</td><td>{p.clientName}</td><td>{p.title}</td><td>{money(p.amount)}</td><td>{money(p.paid)}</td><td style={{ minWidth: 90 }}><div className="bar"><i style={{ width: Math.min(100, (p.paid / p.amount) * 100) + "%" }} /></div></td><td>{p.amount > p.paid && p.dueDate < T ? <span className="badge red">{jd(p.dueDate, "short")}</span> : jd(p.dueDate, "short")}</td><td className="no-print">{p.amount > p.paid && <button className="btn ghost sm" onClick={() => setPay(p)}>ثبت پرداخت</button>}</td></tr>)}</tbody></table></div>
    {pay && <PayModal p={pay} close={() => setPay(null)} done={() => { setPay(null); reload(); }} />}{inv && <InvModal close={() => setInv(false)} done={() => { setInv(false); reload(); }} />}</div>;
}
function PayModal({ p, close, done }: any) {
  const [a, setA] = useState(String(p.amount - p.paid)); const [m, setM] = useState("کارت به کارت"); const [busy, run] = useBusy();
  return <Modal title={`ثبت پرداخت — ${p.clientName}`} onClose={close}><p className="muted small mb">مانده: {money(p.amount - p.paid)}</p><Field label="مبلغ (تومان)"><input className="ltr" inputMode="numeric" value={a} onChange={e => setA(e.target.value.replace(/\D/g, ""))} /></Field><Field label="روش"><select value={m} onChange={e => setM(e.target.value)}>{["کارت به کارت", "واریز بانکی", "نقدی", "پوز"].map(x => <option key={x}>{x}</option>)}</select></Field>
    <button className="btn gold" disabled={busy || !+a} onClick={() => run(async () => { await api(`/admin/payments/${p.id}/pay`, { body: { amount: +a, method: m } }); ok("پرداخت ثبت شد"); done(); })}>ثبت</button></Modal>;
}
function InvModal({ close, done }: any) {
  const { data } = useApi<any>("/admin/cases"); const [cs, setCs] = useState(""); const [t, setT] = useState("حق‌الوکاله"); const [a, setA] = useState(""); const [d, setD] = useState(today()); const [busy, run] = useBusy();
  return <Modal title="صورتحساب جدید" onClose={close}><Field label="پرونده"><select value={cs} onChange={e => setCs(e.target.value)}><option value="">— انتخاب —</option>{data?.cases.map((c: any) => <option key={c.id} value={c.id}>{c.clientName} — {c.title.slice(0, 36)}</option>)}</select></Field><Field label="شرح"><input value={t} onChange={e => setT(e.target.value)} /></Field><Field label="مبلغ (تومان)"><input className="ltr" inputMode="numeric" value={a} onChange={e => setA(e.target.value.replace(/\D/g, ""))} /></Field><Field label="سررسید"><input type="date" className="ltr" value={d} onChange={e => setD(e.target.value)} /></Field>
    <button className="btn gold" disabled={busy || !cs || !+a} onClick={() => run(async () => { await api("/admin/payments", { body: { caseId: cs, title: t, amount: +a, dueDate: d } }); ok("صادر شد"); done(); })}>صدور</button></Modal>;
}
