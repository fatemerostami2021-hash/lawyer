import { useState } from "react";
import { Link } from "wouter";
import { api, useApi } from "./api";
import { APPT, fd, jd, rel, TYPES, waLink } from "./fmt";
import { ApptBadge, ErrorBox, Field, Loading, Modal, Tabs, Empty, fail, ok, useBusy } from "./ui";
import { SlotPicker } from "./Shared";

export function AppointmentsPage() {
  const { data, error, reload } = useApi<any>("/admin/appointments", 12000);
  const [tab, setTab] = useState("pending"); const [resched, setResched] = useState<any>(null); const [reject, setReject] = useState<any>(null); const [manual, setManual] = useState(false);
  if (error) return <ErrorBox msg={error} />; if (!data) return <Loading />;
  const all: any[] = data.appointments; const T = new Date().toLocaleDateString("en-CA");
  const lists: Record<string, any[]> = {
    pending: all.filter(a => a.status === "pending"),
    upcoming: all.filter(a => ["confirmed", "rescheduled"].includes(a.status) && a.date >= T),
    history: all.filter(a => !["pending"].includes(a.status) && !(["confirmed", "rescheduled"].includes(a.status) && a.date >= T)).reverse(),
  };
  const act = async (id: string, decision: string, extra: any = {}) => { try { await api(`/admin/appointments/${id}/decision`, { method: "PUT", body: { decision, ...extra } }); ok("انجام شد"); reload(); } catch (e) { fail(e); } };
  const list = lists[tab];
  return <div>
    <div className="row sb mb"><Tabs on={tab} set={setTab} tabs={[["pending", `در انتظار (${fd(lists.pending.length)})`], ["upcoming", `پیش‌رو (${fd(lists.upcoming.length)})`], ["history", "تاریخچه"]]} /><div className="row no-print"><button className="btn gold" onClick={() => setManual(true)}>+ ثبت نوبت دستی</button><Link href="/admin/settings" className="btn ghost">تنظیمات نوبت‌دهی</Link></div></div>
    {!list.length ? <Empty>موردی وجود ندارد</Empty> : <div className="grid">{list.map(a => <div className="card" key={a.id}>
      <div className="row sb"><div><div className="row"><b style={{ fontSize: 16 }}>{a.clientName}</b><ApptBadge k={a.status} /><span className="badge gray">{TYPES[a.type]}</span></div>
        <div className="muted small">{jd(a.date, "long")} · ساعت {fd(a.time)} · {fd(a.duration)} دقیقه · <span className="b">{rel(a.date)}</span></div>
        {a.topic && <div style={{ marginTop: 4 }}>📝 {a.topic}</div>}
        {a.status === "rescheduled" && a.proposed && <div className="small" style={{ color: "#1f4f99" }}>زمان پیشنهادی: {jd(a.proposed.date, "day")} ساعت {fd(a.proposed.time)} — منتظر پاسخ موکل</div>}
        {a.status === "rejected" && a.reason && <div className="small muted">دلیل: {a.reason}</div>}
        {a.type === "online" && a.status === "confirmed" && a.meetLink && <div className="small">🔗 <a className="ltr" href={a.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: "#1f4f99" }}>{a.meetLink}</a></div>}
        <div className="small muted">{a.source === "portal" ? "ثبت‌شده از پورتال موکل" : "ثبت دستی"} · {a.decidedBy ? "تصمیم: " + a.decidedBy : ""}</div></div>
        <div className="row no-print">
          {a.status === "pending" && <><button className="btn green sm" onClick={() => act(a.id, "ok")}>تأیید</button><button className="btn ghost sm" onClick={() => setResched(a)}>پیشنهاد زمان دیگر</button><button className="btn red sm" onClick={() => setReject(a)}>رد</button></>}
          {a.status === "confirmed" && <><button className="btn ghost sm" onClick={() => act(a.id, "done")}>انجام شد</button><button className="btn ghost sm" onClick={() => act(a.id, "noshow")}>عدم حضور</button><button className="btn ghost sm" onClick={() => setResched(a)}>جابجایی</button></>}
          <a className="btn ghost sm" target="_blank" rel="noopener noreferrer" href={waLink(a.mobile, `سلام ${a.clientName}، نوبت شما در ${jd(a.date)} ساعت ${fd(a.time)} است. دفتر وکالت دکتر نیک‌سرشت`)}>واتساپ</a>
        </div></div></div>)}</div>}
    {resched && <Reschedule a={resched} close={() => setResched(null)} done={() => { setResched(null); reload(); }} />}
    {reject && <Reject a={reject} close={() => setReject(null)} done={() => { setReject(null); reload(); }} />}
    {manual && <Manual close={() => setManual(false)} done={() => { setManual(false); reload(); }} />}
  </div>;
}
function Reschedule({ a, close, done }: any) {
  const [v, setV] = useState({ type: a.type, date: "", time: "" }); const [busy, run] = useBusy();
  return <Modal title={`پیشنهاد زمان جدید برای ${a.clientName}`} onClose={close} wide><SlotPicker lockType value={v} onChange={setV} />
    <button className="btn gold" disabled={!v.time || busy} onClick={() => run(async () => { await api(`/admin/appointments/${a.id}/decision`, { method: "PUT", body: { decision: "resched", date: v.date, time: v.time } }); ok("پیشنهاد برای موکل ارسال شد"); done(); })}>ارسال پیشنهاد به موکل</button></Modal>;
}
function Reject({ a, close, done }: any) {
  const [r, setR] = useState(""); const [busy, run] = useBusy();
  return <Modal title={`رد نوبت ${a.clientName}`} onClose={close}><Field label="دلیل (اختیاری — برای موکل نمایش داده می‌شود)"><textarea rows={3} value={r} onChange={e => setR(e.target.value)} /></Field>
    <button className="btn red" disabled={busy} onClick={() => run(async () => { await api(`/admin/appointments/${a.id}/decision`, { method: "PUT", body: { decision: "no", reason: r } }); ok("رد شد"); done(); })}>رد نوبت</button></Modal>;
}
function Manual({ close, done }: any) {
  const { data } = useApi<any>("/admin/clients"); const [cid, setCid] = useState(""); const [topic, setTopic] = useState(""); const [v, setV] = useState({ type: "inperson", date: "", time: "" }); const [busy, run] = useBusy();
  return <Modal title="ثبت نوبت دستی" onClose={close} wide>
    <Field label="موکل"><select value={cid} onChange={e => setCid(e.target.value)}><option value="">— انتخاب کنید —</option>{data?.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} — {c.mobile}</option>)}</select></Field>
    <SlotPicker value={v} onChange={setV} /><Field label="موضوع"><input value={topic} onChange={e => setTopic(e.target.value)} /></Field>
    <button className="btn gold" disabled={!cid || !v.time || busy} onClick={() => run(async () => { await api("/admin/appointments", { body: { clientId: cid, ...v, topic } }); ok("نوبت ثبت و تأیید شد"); done(); })}>ثبت و تأیید</button></Modal>;
}
