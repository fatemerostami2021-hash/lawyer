import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { api, BASE, useApi } from "./api";
import { CASE_ST, CASE_TYPES, fd, jd, money, rel } from "./fmt";
import { CaseBadge, Empty, ErrorBox, Field, Loading, Modal, download, fail, ok, useBusy } from "./ui";
import { DocList, NewCase } from "./AdminClients";
import { useAuth } from "./PortalApp";

export const DateField = ({ label, v, set }: { label: string; v: string; set: (s: string) => void }) => <Field label={label}><input type="date" className="ltr" value={v} onChange={e => set(e.target.value)} />{v && <span className="small muted">{jd(v, "long")}</span>}</Field>;

export function CasesPage() {
  const { data, error, reload } = useApi<any>("/admin/cases"); const [st, setSt] = useState(""); const [ty, setTy] = useState(""); const [q, setQ] = useState(""); const [add, setAdd] = useState(false); const [, nav] = useLocation();
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />;
  const list = data.cases.filter((c: any) => (!st || c.status === st) && (!ty || c.type === ty) && (!q || (c.title + c.clientName + c.caseNo).includes(q)));
  return <div><div className="row mb no-print"><input style={{ maxWidth: 260 }} placeholder="جستجو…" value={q} onChange={e => setQ(e.target.value)} />
    <select style={{ width: 150 }} value={st} onChange={e => setSt(e.target.value)}><option value="">همه وضعیت‌ها</option>{Object.entries(CASE_ST).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
    <select style={{ width: 200 }} value={ty} onChange={e => setTy(e.target.value)}><option value="">همه حوزه‌ها</option>{Object.entries(CASE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><div className="sp" />
    <button className="btn ghost" onClick={() => download(BASE + "/admin/export/cases.xlsx")}>خروجی Excel</button><button className="btn gold" onClick={() => setAdd(true)}>+ پرونده جدید</button></div>
    <div className="tbl-wrap"><table className="tbl"><thead><tr><th>پرونده</th><th>موکل</th><th>حوزه</th><th>مرجع</th><th>وضعیت</th><th>حق‌الوکاله</th></tr></thead><tbody>
      {list.map((c: any) => <tr key={c.id} className="click" onClick={() => nav("/admin/cases/" + c.id)}><td><b>{c.title}</b><div className="small muted ltr">{fd(c.caseNo)}</div></td><td>{c.clientName}</td><td>{CASE_TYPES[c.type]}</td><td className="small">{c.court}</td><td><CaseBadge k={c.status} /></td><td>{money(c.fee)}</td></tr>)}
      {!list.length && <tr><td colSpan={6}><Empty>پرونده‌ای یافت نشد</Empty></td></tr>}</tbody></table></div>
    {add && <NewCase close={() => setAdd(false)} done={id => { reload(); nav("/admin/cases/" + id); }} />}</div>;
}

export function CaseDetail() {
  const { id } = useParams<{ id: string }>(); const { user } = useAuth(); const [, nav] = useLocation();
  const { data, error, reload } = useApi<any>(`/admin/cases/${id}`); const [modal, setModal] = useState(""); const [f, setF] = useState<any>({}); const [busy, run] = useBusy();
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />;
  const c = data.case; const put = (patch: any) => api(`/admin/cases/${id}`, { method: "PUT", body: patch }).then(() => { ok("ذخیره شد"); reload(); }).catch(fail);
  const T = new Date().toLocaleDateString("en-CA");
  const submit = (kind: "timeline" | "sessions" | "deadlines") => run(async () => { await api(kind === "timeline" ? `/admin/cases/${id}/timeline` : `/admin/${kind}`, { body: { ...f, caseId: id } }); ok("ثبت شد"); setModal(""); setF({}); reload(); });
  return <div className="grid">
    <div className="card"><div className="row sb"><div><div className="muted small">{CASE_TYPES[c.type]} · <Link href={"/admin/clients/" + c.clientId} style={{ color: "#8e702e" }}>{c.clientName}</Link></div><h2 style={{ fontSize: 21 }}>{c.title}</h2><div className="muted">{c.court} · شماره پرونده <span className="ltr">{fd(c.caseNo || "—")}</span> · افتتاح {jd(c.opened)}</div></div>
      <div className="row no-print"><select style={{ width: 150 }} value={c.status} onChange={e => put({ status: e.target.value })}>{Object.entries(CASE_ST).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>{user?.role === "lawyer" && <button className="btn red sm" onClick={async () => { if (confirm("حذف پرونده؟")) { await api(`/admin/cases/${id}`, { method: "DELETE" }).catch(fail); nav("/admin/cases"); } }}>حذف</button>}</div></div></div>
    <div className="grid g2">
      <div className="card"><div className="card-h"><span>تایم‌لاین پرونده</span><button className="btn ghost sm no-print" onClick={() => { setF({ date: T, text: "" }); setModal("timeline"); }}>+ رویداد</button></div><div className="tl">{[...c.timeline].sort((a: any, b: any) => b.date.localeCompare(a.date)).map((e: any, i: number) => <div key={i}><b>{e.text}</b><div className="small muted">{jd(e.date)}</div></div>)}</div></div>
      <div className="grid">
        <div className="card"><div className="card-h"><span>جلسات دادگاه</span><button className="btn ghost sm no-print" onClick={() => { setF({ date: T, time: "09:00", kind: "جلسه رسیدگی" }); setModal("sessions"); }}>+ جلسه</button></div>{!data.sessions.length ? <Empty>—</Empty> : <div className="list">{data.sessions.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((s: any) => <div key={s.id} className="row sb"><div><b>{s.kind}</b> <span className="small muted">{s.court}</span>{s.note && <div className="small muted">{s.note}</div>}</div><div className="row"><span className={"badge " + (s.done ? "gray" : "blue")}>{jd(s.date, "short")} {s.time && fd(s.time)}</span>{!s.done && <button className="btn ghost sm no-print" onClick={() => api(`/admin/sessions/${s.id}`, { method: "PUT", body: { done: true } }).then(reload)}>انجام شد</button>}</div></div>)}</div>}</div>
        <div className="card"><div className="card-h"><span>مهلت‌های قانونی</span><button className="btn ghost sm no-print" onClick={() => { setF({ date: T, title: "" }); setModal("deadlines"); }}>+ مهلت</button></div>{!data.deadlines.length ? <Empty>—</Empty> : <div className="list">{data.deadlines.sort((a: any, b: any) => a.date.localeCompare(b.date)).map((s: any) => <div key={s.id} className="row sb"><div style={{ textDecoration: s.done ? "line-through" : "none" }}><b>{s.title}</b></div><div className="row"><span className={"badge " + (s.done ? "gray" : s.date < T ? "red" : "amber")}>{jd(s.date, "short")} · {rel(s.date)}</span>{!s.done && <button className="btn ghost sm no-print" onClick={() => api(`/admin/deadlines/${s.id}`, { method: "PUT", body: { done: true } }).then(reload)}>✓</button>}</div></div>)}</div>}</div>
      </div></div>
    <div className="card"><h3>مدارک پرونده</h3><DocList docs={data.documents} cid={c.clientId} cases={[c]} reload={reload} /></div>
    <div className="card"><h3>مالی پرونده — حق‌الوکاله {money(c.fee)}</h3><div className="list">{data.payments.map((p: any) => <div key={p.id} className="row sb"><span>{p.title} <span className="muted small ltr">{fd(p.invoiceNo)}</span></span><span>{money(p.paid)} از {money(p.amount)}</span></div>)}</div></div>
    {modal && <Modal title={modal === "timeline" ? "رویداد جدید" : modal === "sessions" ? "ثبت جلسه دادگاه" : "ثبت مهلت قانونی"} onClose={() => setModal("")}>
      <DateField label="تاریخ" v={f.date || ""} set={d => setF({ ...f, date: d })} />
      {modal === "sessions" && <><Field label="ساعت"><input className="ltr" type="time" value={f.time || ""} onChange={e => setF({ ...f, time: e.target.value })} /></Field><Field label="نوع جلسه"><input value={f.kind || ""} onChange={e => setF({ ...f, kind: e.target.value })} /></Field></>}
      <Field label={modal === "timeline" ? "شرح رویداد" : modal === "deadlines" ? "عنوان مهلت (مثلاً: مهلت تجدیدنظر)" : "توضیح (اختیاری)"}><input value={(modal === "timeline" ? f.text : modal === "deadlines" ? f.title : f.note) || ""} onChange={e => setF({ ...f, [modal === "timeline" ? "text" : modal === "deadlines" ? "title" : "note"]: e.target.value })} /></Field>
      <button className="btn gold" disabled={busy || !f.date} onClick={() => submit(modal as any)}>ثبت</button></Modal>}
  </div>;
}
