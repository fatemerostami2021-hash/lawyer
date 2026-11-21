import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { api, BASE, useApi } from "./api";
import { CASE_TYPES, dt, fd, jd, money, size, waLink, APPT } from "./fmt";
import { ApptBadge, CaseBadge, Empty, ErrorBox, Field, Loading, Modal, Tabs, download, fail, ok, useBusy } from "./ui";
import { useAuth } from "./PortalApp";

export function ClientsPage() {
  const [q, setQ] = useState(""); const [st, setSt] = useState(""); const [add, setAdd] = useState(false); const [, nav] = useLocation();
  const { data, error, reload } = useApi<any>(`/admin/clients?q=${encodeURIComponent(q)}&status=${st}`);
  return <div>
    <div className="row mb no-print"><input style={{ maxWidth: 300 }} placeholder="جستجو: نام، موبایل، کد ملی…" value={q} onChange={e => setQ(e.target.value)} />
      <select style={{ width: 160 }} value={st} onChange={e => setSt(e.target.value)}><option value="">همه وضعیت‌ها</option><option value="active">فعال</option><option value="new">جدید (ثبت‌نام آنلاین)</option></select><div className="sp" />
      <button className="btn ghost" onClick={() => download(BASE + "/admin/export/clients.xlsx")}>خروجی Excel</button><button className="btn ghost" onClick={() => window.print()}>خروجی PDF</button><button className="btn gold" onClick={() => setAdd(true)}>+ موکل جدید</button></div>
    <h2 className="print-only" style={{ marginBottom: 10 }}>فهرست موکلان — دفتر وکالت دکتر سبحان نیک‌سرشت</h2>
    {error ? <ErrorBox msg={error} /> : !data ? <Loading /> : <div className="tbl-wrap"><table className="tbl"><thead><tr><th>نام</th><th>نوع</th><th>موبایل</th><th>شهر</th><th>پرونده‌ها</th><th>مانده بدهی</th><th>وضعیت</th></tr></thead><tbody>
      {data.clients.map((c: any) => <tr key={c.id} className="click" onClick={() => nav("/admin/clients/" + c.id)}><td><b>{c.name}</b>{c.contact && <div className="small muted">{c.contact}</div>}</td><td>{c.kind === "legal" ? "حقوقی" : "حقیقی"}</td><td className="ltr">{fd(c.mobile)}</td><td>{c.city || "—"}</td><td>{fd(c.casesCount)}</td><td>{c.balance > 0 ? <span style={{ color: "#a3231b" }}>{money(c.balance)}</span> : <span className="muted">تسویه</span>}</td><td>{c.status === "new" ? <span className="badge blue">جدید</span> : <span className="badge green">فعال</span>}</td></tr>)}
      {!data.clients.length && <tr><td colSpan={7}><Empty>موردی یافت نشد</Empty></td></tr>}</tbody></table></div>}
    {add && <ClientForm close={() => setAdd(false)} done={id => { setAdd(false); reload(); nav("/admin/clients/" + id); }} />}
  </div>;
}
export function ClientForm({ init, close, done }: { init?: any; close: () => void; done: (id: string) => void }) {
  const [f, setF] = useState<any>(init || { kind: "real", name: "", mobile: "", idNo: "", city: "", email: "", address: "", contact: "", source: "" }); const [busy, run] = useBusy();
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return <Modal title={init ? "ویرایش اطلاعات موکل" : "موکل جدید"} onClose={close} wide>
    <div className="grid g2"><Field label="نوع"><select value={f.kind} onChange={set("kind")}><option value="real">حقیقی</option><option value="legal">حقوقی (شرکت)</option></select></Field><Field label="نام / نام شرکت"><input value={f.name} onChange={set("name")} /></Field>
      <Field label="موبایل"><input className="ltr" value={f.mobile} onChange={set("mobile")} placeholder="09123456789" /></Field><Field label={f.kind === "legal" ? "شناسه ملی" : "کد ملی"}><input className="ltr" value={f.idNo} onChange={set("idNo")} /></Field>
      <Field label="شهر"><input value={f.city} onChange={set("city")} /></Field><Field label="ایمیل (اختیاری)"><input className="ltr" value={f.email} onChange={set("email")} /></Field>
      <Field label="نماینده / مسئول (برای شرکت‌ها)"><input value={f.contact || ""} onChange={set("contact")} /></Field><Field label="نحوه آشنایی"><input value={f.source || ""} onChange={set("source")} /></Field></div>
    <Field label="نشانی"><input value={f.address} onChange={set("address")} /></Field>
    <button className="btn gold" disabled={busy || !f.name || !f.mobile} onClick={() => run(async () => { const r = init ? await api(`/admin/clients/${init.id}`, { method: "PUT", body: f }) : await api("/admin/clients", { body: f }); ok("ذخیره شد"); done(r.client.id); })}>ذخیره</button></Modal>;
}

export function ClientDetail() {
  const { id } = useParams<{ id: string }>(); const { user } = useAuth(); const [, nav] = useLocation();
  const { data, error, reload } = useApi<any>(`/admin/clients/${id}`);
  const [tab, setTab] = useState("info"); const [edit, setEdit] = useState(false); const [note, setNote] = useState(""); const [newCase, setNewCase] = useState(false);
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />;
  const c = data.client;
  const del = async () => { if (!confirm(`حذف «${c.name}» و تمام پرونده‌ها و مدارکش؟ این کار قابل بازگشت نیست.`)) return; try { await api(`/admin/clients/${id}`, { method: "DELETE" }); ok("حذف شد"); nav("/admin/clients"); } catch (e) { fail(e); } };
  return <div>
    <div className="card mb"><div className="row sb"><div><div className="row"><h2 style={{ fontSize: 22 }}>{c.name}</h2>{c.status === "new" && <span className="badge blue">ثبت‌نام جدید</span>}<span className="badge gray">{c.kind === "legal" ? "حقوقی" : "حقیقی"}</span></div>
      <div className="muted">📱 <span className="ltr">{fd(c.mobile)}</span> {c.email && <>· ✉️ <span className="ltr">{c.email}</span></>} · 📍 {c.city || "—"} · عضویت: {jd(c.joinedAt)}</div></div>
      <div className="row no-print"><a className="btn ghost" target="_blank" rel="noopener noreferrer" href={waLink(c.mobile, `سلام ${c.name}، دفتر وکالت دکتر نیک‌سرشت`)}>واتساپ</a><a className="btn ghost" href={"tel:" + c.mobile}>تماس</a><button className="btn ghost" onClick={() => setEdit(true)}>ویرایش</button><button className="btn ghost" onClick={() => window.print()}>PDF پرونده</button>{user?.role === "lawyer" && <button className="btn red" onClick={del}>حذف</button>}</div></div>
      <div className="grid g4 mt"><div><div className="muted small">پرونده‌ها</div><b>{fd(c.cases.length)}</b></div><div><div className="muted small">مجموع حق‌الوکاله</div><b>{money(c.cases.reduce((s: number, x: any) => s + x.fee, 0))}</b></div><div><div className="muted small">مانده بدهی</div><b style={{ color: c.balance > 0 ? "#a3231b" : "#15663a" }}>{money(c.balance)}</b></div><div><div className="muted small">مدارک</div><b>{fd(c.documents.length)}</b></div></div></div>
    <Tabs on={tab} set={setTab} tabs={[["info", "اطلاعات"], ["cases", `پرونده‌ها (${fd(c.cases.length)})`], ["appts", "نوبت‌ها"], ["docs", `مدارک (${fd(c.documents.length)})`], ["fin", "مالی"], ["notes", "یادداشت‌ها"]]} />
    {tab === "info" && <div className="grid g2"><div className="card"><h3>مشخصات</h3><div className="list">{[["کد/شناسه ملی", c.idNo], ["نماینده", c.contact], ["نشانی", c.address], ["نحوه آشنایی", c.source], ["تأیید موبایل", c.verified ? "تأیید شده ✓" : "—"]].map(([k, v]) => <div key={k} className="row sb"><span className="muted">{k}</span><b>{fd(v) || "—"}</b></div>)}</div></div>
      <div className="card"><h3>رویدادهای پیش‌رو</h3>{(() => { const T = new Date().toLocaleDateString("en-CA"); const ev = [...c.sessions.filter((s: any) => s.date >= T && !s.done).map((s: any) => ({ d: s.date, t: "⚖️ " + s.court, x: s.time })), ...c.deadlines.filter((s: any) => !s.done && s.date >= T).map((s: any) => ({ d: s.date, t: "⏳ " + s.title })), ...c.appointments.filter((a: any) => ["confirmed", "pending"].includes(a.status) && a.date >= T).map((a: any) => ({ d: a.date, t: "🤝 نوبت", x: a.time }))].sort((a, b) => a.d.localeCompare(b.d)); return ev.length ? <div className="list">{ev.map((e, i) => <div key={i} className="row sb"><span>{e.t}</span><span className="muted">{jd(e.d, "day")} {e.x && "· " + fd(e.x)}</span></div>)}</div> : <Empty>رویدادی ثبت نشده</Empty>; })()}</div></div>}
    {tab === "cases" && <div><div className="row mb no-print"><button className="btn gold" onClick={() => setNewCase(true)}>+ پرونده جدید</button></div>{!c.cases.length ? <Empty>پرونده‌ای ثبت نشده</Empty> : <div className="grid">{c.cases.map((x: any) => <Link key={x.id} href={"/admin/cases/" + x.id} className="card"><div className="row sb"><div><b>{x.title}</b><div className="small muted">{CASE_TYPES[x.type]} · {x.court} · شماره {fd(x.caseNo || "—")}</div></div><CaseBadge k={x.status} /></div></Link>)}</div>}</div>}
    {tab === "appts" && (!c.appointments.length ? <Empty>نوبتی ثبت نشده</Empty> : <div className="tbl-wrap"><table className="tbl"><tbody>{c.appointments.map((a: any) => <tr key={a.id}><td>{jd(a.date)}</td><td>{fd(a.time)}</td><td>{a.type === "inperson" ? "حضوری" : a.type === "online" ? "آنلاین" : "تلفنی"}</td><td>{a.topic}</td><td><ApptBadge k={a.status} /></td></tr>)}</tbody></table></div>)}
    {tab === "docs" && <DocList docs={c.documents} cid={c.id} cases={c.cases} reload={reload} />}
    {tab === "fin" && (!c.payments.length ? <Empty>صورتحسابی ثبت نشده</Empty> : <div className="tbl-wrap"><table className="tbl"><thead><tr><th>شماره</th><th>شرح</th><th>مبلغ</th><th>پرداخت‌شده</th><th>مانده</th><th>سررسید</th></tr></thead><tbody>{c.payments.map((p: any) => <tr key={p.id}><td className="ltr">{fd(p.invoiceNo)}</td><td>{p.title}</td><td>{money(p.amount)}</td><td>{money(p.paid)}</td><td style={{ color: p.amount - p.paid > 0 ? "#a3231b" : "#15663a" }}>{money(p.amount - p.paid)}</td><td>{jd(p.dueDate, "short")}</td></tr>)}</tbody></table></div>)}
    {tab === "notes" && <div className="card"><div className="row mb no-print"><input value={note} onChange={e => setNote(e.target.value)} placeholder="یادداشت داخلی (برای موکل نمایش داده نمی‌شود)…" /><button className="btn gold" disabled={!note} onClick={async () => { try { await api(`/admin/clients/${id}/notes`, { body: { text: note } }); setNote(""); reload(); } catch (e) { fail(e); } }}>افزودن</button></div><div className="list">{c.notes.map((n: any) => <div key={n.id}>{n.text}<div className="small muted">{n.by} · {dt(n.createdAt)}</div></div>)}</div></div>}
    {edit && <ClientForm init={c} close={() => setEdit(false)} done={() => { setEdit(false); reload(); }} />}
    {newCase && <NewCase clientId={c.id} close={() => setNewCase(false)} done={cid => nav("/admin/cases/" + cid)} />}
  </div>;
}
export function NewCase({ clientId, close, done }: { clientId?: string; close: () => void; done: (id: string) => void }) {
  const { data: cl } = useApi<any>(clientId ? null : "/admin/clients");
  const [f, setF] = useState<any>({ clientId: clientId || "", title: "", type: "contract", court: "", caseNo: "", fee: "", status: "preparation" }); const [busy, run] = useBusy(); const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return <Modal title="پرونده جدید" onClose={close}>
    {!clientId && <Field label="موکل"><select value={f.clientId} onChange={set("clientId")}><option value="">— انتخاب —</option>{cl?.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
    <Field label="عنوان پرونده"><input value={f.title} onChange={set("title")} /></Field>
    <div className="grid g2"><Field label="حوزه"><select value={f.type} onChange={set("type")}>{Object.entries(CASE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field><Field label="وضعیت"><select value={f.status} onChange={set("status")}><option value="preparation">در حال بررسی</option><option value="active">در جریان</option></select></Field>
      <Field label="مرجع / شعبه"><input value={f.court} onChange={set("court")} /></Field><Field label="شماره پرونده"><input className="ltr" value={f.caseNo} onChange={set("caseNo")} /></Field></div>
    <Field label="حق‌الوکاله (تومان)"><input className="ltr" inputMode="numeric" value={f.fee} onChange={set("fee")} /></Field>
    <button className="btn gold" disabled={busy || !f.title || !f.clientId} onClick={() => run(async () => { const r = await api("/admin/cases", { body: f }); ok("پرونده ایجاد شد"); done(r.case.id); })}>ایجاد پرونده</button></Modal>;
}
export function DocList({ docs, cid, cases, reload }: any) {
  const [up, setUp] = useState(false);
  return <div><div className="row mb no-print"><button className="btn gold" onClick={() => setUp(true)}>+ بارگذاری مدرک</button></div>
    {!docs.length ? <Empty>مدرکی وجود ندارد</Empty> : <div className="tbl-wrap"><table className="tbl"><thead><tr><th>نام</th><th>دسته</th><th>حجم</th><th>منبع</th><th>تاریخ</th><th className="no-print"></th></tr></thead><tbody>{docs.map((d: any) => <tr key={d.id}><td>📄 {d.name}</td><td>{d.category}</td><td>{size(d.size)}</td><td>{d.by === "client" ? "موکل" : "دفتر"}</td><td>{dt(d.createdAt)}</td><td className="no-print"><button className="btn ghost sm" onClick={() => download(`${BASE}/admin/documents/${d.id}/download`)}>دانلود</button> <button className="btn ghost sm" onClick={async () => { if (confirm("حذف مدرک؟")) { try { await api(`/admin/documents/${d.id}`, { method: "DELETE" }); reload(); } catch (e) { fail(e); } } }}>🗑</button></td></tr>)}</tbody></table></div>}
    {up && <UploadModal cid={cid} cases={cases} close={() => setUp(false)} done={() => { setUp(false); reload(); }} />}</div>;
}
export function UploadModal({ cid, cases, close, done }: any) {
  const [file, setFile] = useState<File | null>(null); const [cat, setCat] = useState("سایر"); const [cs, setCs] = useState(""); const [vis, setVis] = useState(true); const [busy, run] = useBusy();
  return <Modal title="بارگذاری مدرک" onClose={close}><Field label="فایل (PDF، تصویر، Word، Excel — حداکثر ۱۰ مگابایت)"><input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.txt" onChange={e => setFile(e.target.files?.[0] || null)} /></Field>
    <div className="grid g2"><Field label="دسته"><select value={cat} onChange={e => setCat(e.target.value)}>{["هویتی و وکالت", "قراردادها", "دادگاهی", "مالی", "سایر"].map(x => <option key={x}>{x}</option>)}</select></Field>
      <Field label="پرونده"><select value={cs} onChange={e => setCs(e.target.value)}><option value="">— عمومی —</option>{cases?.map((x: any) => <option key={x.id} value={x.id}>{x.title.slice(0, 40)}</option>)}</select></Field></div>
    <label className="row small" style={{ marginBottom: 12 }}><input type="checkbox" checked={vis} onChange={e => setVis(e.target.checked)} /> نمایش برای موکل در پورتال</label>
    <button className="btn gold" disabled={!file || busy} onClick={() => run(async () => { const fd_ = new FormData(); fd_.append("clientId", cid); fd_.append("category", cat); fd_.append("caseId", cs); fd_.append("visibleToClient", String(vis)); fd_.append("file", file!); await api("/admin/documents", { form: fd_ }); ok("بارگذاری شد"); done(); })}>بارگذاری</button></Modal>;
}
