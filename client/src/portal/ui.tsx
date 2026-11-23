import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { APPT, CASE_ST } from "./fmt";
import { BASE, isDemo } from "./api";

export const Badge = ({ map, k }: { map: Record<string, [string, string]>; k: string }) => { const [t, c] = map[k] || [k, "gray"]; return <span className={`badge ${c}`}>{t}</span>; };
export const ApptBadge = ({ k }: { k: string }) => <Badge map={APPT} k={k} />;
export const CaseBadge = ({ k }: { k: string }) => <Badge map={CASE_ST} k={k} />;

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => { const f = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [onClose]);
  return <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className={"modal" + (wide ? " wide" : "")} role="dialog" aria-modal="true"><div className="row sb"><h3>{title}</h3><button className="btn ghost sm" onClick={onClose} aria-label="بستن">✕</button></div>{children}</div></div>;
}
export const Field = ({ label, children }: { label: string; children: ReactNode }) => <div className="field"><label>{label}</label>{children}</div>;
export const Empty = ({ children }: { children: ReactNode }) => <div className="empty">{children}</div>;
export const Loading = () => <div className="empty">در حال بارگذاری…</div>;
export const ErrorBox = ({ msg }: { msg: string }) => <div className="demo" style={{ borderColor: "#e0a39e", background: "#fdeceb" }}>⚠️ {msg}</div>;
export const Switch = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => <button type="button" role="switch" aria-checked={on} className={"switch" + (on ? " on" : "")} onClick={() => onChange(!on)} />;
export const ok = (m: string) => toast.success(m);
export const fail = (e: any) => toast.error(e?.message || "خطا");
export function useBusy() { const [b, set] = useState(false); return [b, async (fn: () => Promise<any>) => { set(true); try { return await fn(); } catch (e) { fail(e); } finally { set(false); } }] as const; }
export const Stat = ({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: string }) => <div className="card stat"><div className="ic">{icon}</div><div><b>{value}</b><span>{label}</span>{sub && <div className="small muted">{sub}</div>}</div></div>;
export const Tabs = ({ tabs, on, set }: { tabs: [string, string][]; on: string; set: (k: string) => void }) => <div className="tabs" role="tablist">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={on === k} className={on === k ? "on" : ""} onClick={() => set(k)}>{l}</button>)}</div>;

export async function download(url: string) {
  const a = document.createElement("a"); a.rel = "noopener";
  if (isDemo()) { // demo: build the file in the browser
    try { const { demoDownload } = await import("./demo/engine"); const { blob, filename } = await demoDownload(url.startsWith(BASE) ? url.slice(BASE.length) : url); a.href = URL.createObjectURL(blob); a.download = filename; }
    catch (e: any) { fail(e); return; }
  } else a.href = url;
  document.body.appendChild(a); a.click(); a.remove();
}
export function DemoBanner() {
  const [open, setOpen] = useState(false); const [loc] = useLocation();
  if (!isDemo()) return null;
  const inAdmin = loc.startsWith("/admin");
  const reset = async () => { if (confirm("همه‌ی تغییراتی که در این نمونه داده‌اید پاک شود و از اول شروع شود؟")) { const { resetDemo } = await import("./demo/core"); resetDemo(); location.reload(); } };
  return <>
    <div className="demo-bar" role="status">
      <span className="long">وب‌سایت نمونه — برای امتحان کردن، به‌عنوان موکل یا وکیل وارد شوید:</span>
      <Link href="/portal" className={"pill" + (!inAdmin ? " on" : "")}>پنل موکل</Link>
      <Link href="/admin" className={"pill" + (inAdmin ? " on" : "")}>پنل وکیل</Link>
      <button onClick={() => setOpen(true)}>راهنمای استفاده</button>
      <button className="soft" onClick={reset}>شروع از اول</button>
    </div>
    {open && <Modal title="راهنمای استفاده از وب‌سایت نمونه" onClose={() => setOpen(false)} wide>
      <p className="muted" style={{ marginBottom: 12 }}>این وب‌سایت دو پنل جدا دارد. هر پنل ورود و اطلاعات مخصوص خودش را دارد، پس می‌توانید هر دو را هم‌زمان در دو تب باز کنید.</p>
      <div className="grid g2">
        <div className="card"><h3>👤 پنل موکل</h3><ol className="guide-ol"><li>روی «پنل موکل» بزنید و شماره موبایل بنویسید.</li><li>کد تأیید روی همان صفحه نشان داده می‌شود.</li><li>شماره‌ی جدید، حساب جدید می‌سازد. برای موکل دارای پرونده: <b className="ltr">09120000001</b></li><li>پروفایل، مدارک، پیام و نوبت‌گیری از تقویم را امتحان کنید.</li></ol><Link href="/portal" className="btn gold" onClick={() => setOpen(false)}>رفتن به پنل موکل</Link></div>
        <div className="card"><h3>⚖️ پنل وکیل</h3><ol className="guide-ol"><li>روی «پنل وکیل» بزنید.</li><li>وکیل: <b className="ltr">lawyer</b> · منشی: <b className="ltr">assistant</b> · رمز: <b className="ltr">Demo@1234</b></li><li>نوبت‌های ثبت‌شده توسط موکلان را تأیید یا رد کنید.</li><li>موکلان، پرونده‌ها، مالی، تقویم و گزارش‌ها را ببینید.</li></ol><Link href="/admin" className="btn" onClick={() => setOpen(false)}>رفتن به پنل وکیل</Link></div>
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>اطلاعاتی که وارد می‌کنید فقط در همین مرورگر ذخیره می‌شود. با «شروع از اول» همه چیز به حالت اولیه برمی‌گردد.</p>
    </Modal>}
  </>;
}
export function useNoIndex() { useEffect(() => { const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex,nofollow"; document.head.appendChild(m); const t = document.title; document.title = "پنل دفتر وکالت"; return () => { m.remove(); document.title = t; }; }, []); }
