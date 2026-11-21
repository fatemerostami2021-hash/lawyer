import { useEffect, useRef, useState } from "react";
import { api, BASE, useApi } from "./api";
import { dt, fd, jd, money, today, waLink } from "./fmt";
import { Empty, ErrorBox, Field, Loading, Switch, download, fail, ok, useBusy } from "./ui";
import { useAuth } from "./PortalApp";

export function MessagesPage() {
  const { data, reload } = useApi<any>("/admin/messages", 8000); const [cid, setCid] = useState(""); const [text, setText] = useState("");
  const { data: th, reload: rt } = useApi<any>(cid ? `/admin/messages/${cid}` : null, 8000); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [th?.messages.length]);
  if (!data) return <Loading />;
  const send = async () => { if (!text.trim()) return; try { await api(`/admin/messages/${cid}`, { body: { text } }); setText(""); rt(); reload(); } catch (e) { fail(e); } };
  return <div className="grid" style={{ gridTemplateColumns: "minmax(0,320px) minmax(0,1fr)" }}>
    <div className="card" style={{ padding: 8, maxHeight: "75vh", overflow: "auto" }}>{data.threads.map((t: any) => <button key={t.clientId} onClick={() => setCid(t.clientId)} style={{ display: "block", width: "100%", textAlign: "right", padding: "10px 12px", borderRadius: 10, background: cid === t.clientId ? "#f4ead0" : "transparent" }}><div className="row sb"><b>{t.clientName}</b>{t.unread > 0 && <span className="badge amber">{fd(t.unread)}</span>}</div><div className="small muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.last.from === "office" ? "شما: " : ""}{t.last.text}</div></button>)}</div>
    <div className="card">{!cid ? <Empty>یک گفتگو را انتخاب کنید</Empty> : !th ? <Loading /> : <>
      <div className="row sb mb"><b>{th.client?.name}</b><a className="btn ghost sm" target="_blank" rel="noopener noreferrer" href={waLink(th.client?.mobile || "", "")}>ادامه در واتساپ</a></div>
      <div className="chat">{th.messages.map((m: any) => <div key={m.id} className={"msg" + (m.from === "office" ? " me" : "")}>{m.text}<small>{dt(m.createdAt)}</small></div>)}<div ref={end} /></div>
      <div className="row mt no-print"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="پیام…" /><button className="btn gold" onClick={send}>ارسال</button></div></>}</div></div>;
}

export function ReportsPage() {
  const { data } = useApi<any>("/admin/dashboard");
  const items: [string, string, string][] = [["all", "همه‌چیز در یک فایل Excel", "موکلان، پرونده‌ها، مالی و نوبت‌ها در چهار برگه"], ["clients", "فهرست موکلان", "مشخصات تماس و مانده بدهی"], ["cases", "فهرست پرونده‌ها", "حوزه، مرجع، وضعیت و حق‌الوکاله"], ["finance", "گزارش مالی", "صورتحساب‌ها، پرداخت‌ها و مانده"], ["appointments", "گزارش نوبت‌ها", "تاریخچه و وضعیت همه نوبت‌ها"]];
  return <div className="grid">
    <div className="grid g3">{items.map(([k, t, d]) => <div className="card" key={k}><h3>{t}</h3><p className="muted small mb">{d}</p><button className="btn gold" onClick={() => download(`${BASE}/admin/export/${k}.xlsx`)}>دانلود Excel</button></div>)}</div>
    <div className="card"><div className="row sb mb"><h3>گزارش خلاصه وضعیت دفتر</h3><button className="btn ghost no-print" onClick={() => window.print()}>ذخیره به‌صورت PDF</button></div>
      {data && <><h2 className="print-only" style={{ marginBottom: 8 }}>گزارش خلاصه — دفتر وکالت دکتر سبحان نیک‌سرشت — {jd(today(), "long")}</h2><div className="tbl-wrap"><table className="tbl"><tbody>{[["تعداد موکلان", fd(data.kpi.clients)], ["پرونده‌های فعال", fd(data.kpi.activeCases)], ["نوبت‌های در انتظار", fd(data.kpi.pendingAppts)], ["جلسات دادگاه این هفته", fd(data.kpi.sessionsWeek)], ["دریافتی کل", money(data.kpi.collected)], ["مطالبات معوق", money(data.kpi.outstanding)], ...data.casesByType.map((c: any) => ["پرونده‌های «" + c.name + "»", fd(c.value)]), ...data.months.map((m: any) => ["درآمد " + m.label, money(m.revenue)])].map(([a, b]) => <tr key={a}><td>{a}</td><td><b>{b}</b></td></tr>)}</tbody></table></div></>}</div></div>;
}

const DAYS: [number, string][] = [[6, "شنبه"], [0, "یکشنبه"], [1, "دوشنبه"], [2, "سه‌شنبه"], [3, "چهارشنبه"], [4, "پنجشنبه"], [5, "جمعه"]];
export function SettingsPage() {
  const { data, error, reload } = useApi<any>("/admin/settings"); const [s, setS] = useState<any>(null); const [busy, run] = useBusy(); const [off, setOff] = useState("");
  useEffect(() => { if (data) setS(structuredClone(data.settings)); }, [data]);
  if (error) return <ErrorBox msg={error} />; if (!s) return <Loading />;
  const tg = data.telegram; const T = (k: string, p: any) => setS({ ...s, types: { ...s.types, [k]: { ...s.types[k], ...p } } });
  const save = () => run(async () => { await api("/admin/settings", { method: "PUT", body: s }); ok("تنظیمات ذخیره شد"); reload(); });
  return <div className="grid">
    <div className="card"><h3>نوبت‌دهی آنلاین</h3>
      <div className="row sb" style={{ padding: "8px 0" }}><div><b>پذیرش نوبت آنلاین</b><div className="small muted">با خاموش‌کردن، موکلان نمی‌توانند نوبت جدید بگیرند</div></div><Switch on={s.bookingOpen} onChange={v => setS({ ...s, bookingOpen: v })} /></div>
      <div className="row sb" style={{ padding: "8px 0" }}><div><b>تأیید خودکار نوبت‌ها</b><div className="small muted">نوبت‌ها بدون نیاز به تأیید شما قطعی شوند</div></div><Switch on={s.autoConfirm} onChange={v => setS({ ...s, autoConfirm: v })} /></div></div>
    <div className="grid g3">{Object.entries(s.types).map(([k, t]: any) => <div className="card" key={k}><div className="row sb"><h3>{t.label}</h3><Switch on={t.enabled} onChange={v => T(k, { enabled: v })} /></div>
      <Field label="هزینه مشاوره (تومان)"><input className="ltr" value={t.price} inputMode="numeric" onChange={e => T(k, { price: Number(e.target.value.replace(/\D/g, "")) })} /></Field>
      <Field label="مدت هر جلسه (دقیقه)"><select value={t.duration} onChange={e => T(k, { duration: Number(e.target.value) })}>{[15, 30, 45, 60, 90].map(x => <option key={x} value={x}>{fd(x)}</option>)}</select></Field>
      {k === "online" && <Field label="لینک جلسه آنلاین (Meet/Zoom)"><input className="ltr" value={t.link || ""} onChange={e => T(k, { link: e.target.value })} /></Field>}
      <Field label="توضیح برای موکل"><input value={t.note || ""} onChange={e => T(k, { note: e.target.value })} /></Field></div>)}</div>
    <div className="grid g2"><div className="card"><h3>ساعت و روزهای کاری</h3><div className="grid g2"><Field label="شروع"><input type="time" className="ltr" value={s.hours.start} onChange={e => setS({ ...s, hours: { ...s.hours, start: e.target.value } })} /></Field><Field label="پایان"><input type="time" className="ltr" value={s.hours.end} onChange={e => setS({ ...s, hours: { ...s.hours, end: e.target.value } })} /></Field><Field label="شروع استراحت"><input type="time" className="ltr" value={s.hours.breakStart} onChange={e => setS({ ...s, hours: { ...s.hours, breakStart: e.target.value } })} /></Field><Field label="پایان استراحت"><input type="time" className="ltr" value={s.hours.breakEnd} onChange={e => setS({ ...s, hours: { ...s.hours, breakEnd: e.target.value } })} /></Field></div>
      <div className="row" style={{ margin: "6px 0 12px" }}>{DAYS.map(([n, l]) => <button key={n} type="button" className={"slot" + (s.workingDays.includes(n) ? " on" : "")} style={{ padding: "6px 12px" }} onClick={() => setS({ ...s, workingDays: s.workingDays.includes(n) ? s.workingDays.filter((x: number) => x !== n) : [...s.workingDays, n] })}>{l}</button>)}</div>
      <Field label="حداکثر روز پیش‌رو برای رزرو"><input className="ltr" value={s.maxAdvanceDays} onChange={e => setS({ ...s, maxAdvanceDays: Number(e.target.value.replace(/\D/g, "")) || 1 })} /></Field></div>
      <div className="card"><h3>روزهای تعطیل / مرخصی</h3><div className="row mb"><input type="date" className="ltr" value={off} onChange={e => setOff(e.target.value)} /><button className="btn ghost" disabled={!off} onClick={() => { setS({ ...s, daysOff: [...new Set([...s.daysOff, off])] }); setOff(""); }}>افزودن</button></div><div className="row">{s.daysOff.length ? s.daysOff.map((d: string) => <span key={d} className="chip">{jd(d)} <button onClick={() => setS({ ...s, daysOff: s.daysOff.filter((x: string) => x !== d) })}>✕</button></span>) : <span className="muted small">روز تعطیل خاصی ثبت نشده</span>}</div>
        <h3 style={{ marginTop: 18 }}>اطلاعات دفتر</h3><Field label="شماره تماس"><input className="ltr" value={s.office.phone} onChange={e => setS({ ...s, office: { ...s.office, phone: e.target.value } })} /></Field><Field label="شماره واتساپ (با کد کشور)"><input className="ltr" value={s.office.whatsapp} onChange={e => setS({ ...s, office: { ...s.office, whatsapp: e.target.value } })} /></Field></div></div>
    <div className="row"><button className="btn gold" disabled={busy} onClick={save}>ذخیره تنظیمات</button></div>
    <div className="card"><h3>اعلان‌ها و پیام‌رسان‌ها</h3><div className="list">
      <div className="row sb"><div><b>ربات تلگرام</b> {tg.botName && <span className="ltr muted">@{tg.botName}</span>}<div className="small muted">درخواست نوبت، پیام و مدرک جدید + دکمه‌های تأیید/رد/پیشنهاد زمان دیگر</div></div><div className="row"><span className={"chip " + (tg.paired ? "ok" : "warn")}>{tg.paired ? "متصل" : tg.enabled ? "منتظر /start" : "غیرفعال"}</span><button className="btn ghost sm" onClick={async () => { try { const r = await api("/admin/telegram/test", { body: {} }); r.ok ? ok("پیام تست ارسال شد") : fail({ message: "ارسال نشد — در تلگرام به ربات /start بزنید" }); } catch (e) { fail(e); } }}>پیام تست</button></div></div>
      <div className="row sb"><div><b>واتساپ بیزنس (Cloud API)</b><div className="small muted">پس از دریافت API فعال می‌شود؛ تا آن زمان دکمه «واتساپ» پیام آماده را در واتساپ باز می‌کند</div></div><span className="chip">به‌زودی</span></div>
      <div className="row sb"><div><b>پیامک کد ورود موکل</b><div className="small muted">با تنظیم SMSIR_API_KEY در فایل .env فعال می‌شود</div></div><span className="chip warn">حالت نمایشی</span></div></div></div>
    <div className="card"><h3>داده‌های نمونه</h3><p className="muted small mb">برای شروع دوباره قبل از ارائه، ۲۰ موکل نمونه را بازنشانی کنید (تمام تغییرات فعلی پاک می‌شود).</p><button className="btn red" onClick={async () => { if (confirm("همه داده‌ها به حالت اولیه نمونه برگردد؟")) { try { await api("/admin/demo/reset", { body: {} }); ok("بازنشانی شد"); location.reload(); } catch (e) { fail(e); } } }}>بازنشانی داده‌های نمونه</button></div>
  </div>;
}

export function TeamPage() {
  const { user } = useAuth(); const { data } = useApi<any>(user?.role === "lawyer" ? "/admin/team" : null); const { data: lg } = useApi<any>(user?.role === "lawyer" ? "/admin/logs" : null);
  if (!data || !lg) return <Loading />;
  return <div className="grid"><div className="card"><h3>نقش‌ها و سطح دسترسی</h3><div className="list">{Object.entries(data.roles).map(([k, v]) => <div key={k}><b>{k === "lawyer" ? "وکیل" : k === "assistant" ? "منشی / دستیار" : "موکل"}</b><div className="muted small">{v as string}</div></div>)}</div></div>
    <div className="card"><h3>کاربران پنل</h3><div className="list">{data.users.map((u: any) => <div key={u.id} className="row sb"><span>{u.name}</span><span className="badge gray">{u.role === "lawyer" ? "وکیل" : "منشی"}</span></div>)}</div></div>
    <div className="card"><h3>گزارش فعالیت‌ها (۳۰۰ مورد اخیر)</h3><div className="tbl-wrap"><table className="tbl"><thead><tr><th>زمان</th><th>کاربر</th><th>نقش</th><th>عملیات</th><th>جزئیات</th></tr></thead><tbody>{lg.logs.map((l: any) => <tr key={l.id}><td>{dt(l.createdAt)}</td><td>{l.actorName}</td><td>{l.role === "lawyer" ? "وکیل" : l.role === "assistant" ? "منشی" : l.role === "client" ? "موکل" : l.role}</td><td>{l.action}</td><td className="muted">{l.detail}</td></tr>)}</tbody></table></div></div></div>;
}
