import { useState } from "react";
import { Link, useLocation } from "wouter";
import { api, isDemo } from "./api";
import { Field, useBusy } from "./ui";
import { useAuth } from "./PortalApp";

export default function StaffLogin() {
  const { setUser } = useAuth(); const [, nav] = useLocation();
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, run] = useBusy();
  const submit = (e: React.FormEvent) => { e.preventDefault(); setErr(""); run(async () => { try { const r = await api("/auth/staff-login", { body: { username: u, password: p } }); setUser(r.user); nav("/admin"); } catch (x: any) { setErr(x.message); } }); };
  return <div className="login-wrap"><form className="login" onSubmit={submit}>
    <div className="row" style={{ marginBottom: 16 }}><div className="pt-logo" style={{ width: 46, height: 46 }}>SN</div><div><h2>ورود به پنل مدیریت</h2><p className="muted small">دفتر وکالت دکتر سبحان نیک‌سرشت</p></div></div>
    <Field label="نام کاربری"><input className="ltr" value={u} onChange={e => setU(e.target.value)} autoComplete="username" autoFocus /></Field>
    <Field label="رمز عبور"><input className="ltr" type="password" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" /></Field>
    {err && <p style={{ color: "#a3231b", marginBottom: 10 }}>{err}</p>}
    <button className="btn gold" style={{ width: "100%" }} disabled={busy || !u || !p}>{busy ? "در حال ورود…" : "ورود"}</button>
    {isDemo() && <div className="demo" style={{ marginTop: 16 }}>
      <b>حساب‌های ورود به این نمونه</b> (برای پر کردن خودکار کلیک کنید):
      <div className="row" style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn ghost sm" onClick={() => { setU("lawyer"); setP("Demo@1234"); }}>وکیل — دسترسی کامل</button>
        <button type="button" className="btn ghost sm" onClick={() => { setU("assistant"); setP("Demo@1234"); }}>منشی — دسترسی محدود</button>
      </div>
    </div>}
    <p className="small muted" style={{ marginTop: 12 }}><Link href="/demo">← انتخاب نوع پنل (موکل / وکیل)</Link> · <Link href="/">بازگشت به سایت</Link></p>
  </form></div>;
}
