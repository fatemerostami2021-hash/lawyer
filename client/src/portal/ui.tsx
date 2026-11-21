import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { APPT, CASE_ST } from "./fmt";

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

export function download(url: string) { const a = document.createElement("a"); a.href = url; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); }
export function useNoIndex() { useEffect(() => { const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex,nofollow"; document.head.appendChild(m); const t = document.title; document.title = "پنل دفتر وکالت"; return () => { m.remove(); document.title = t; }; }, []); }
