import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { api, isDemo } from "./api";
import { Field, useBusy } from "./ui";
import { useAuth } from "./PortalApp";
import { fd } from "./fmt";

export default function ClientLogin() {
  const { setUser } = useAuth(); const [, nav] = useLocation();
  const [step, setStep] = useState<"mobile" | "code">("mobile");
  const [mobile, setMobile] = useState(""); const [code, setCode] = useState(""); const [name, setName] = useState("");
  const [exists, setExists] = useState(true); const [demo, setDemo] = useState(""); const [err, setErr] = useState(""); const [left, setLeft] = useState(0); const [busy, run] = useBusy();
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t); }, [left]);
  const send = () => run(async () => { setErr(""); try { const r = await api("/auth/otp/request", { body: { mobile } }); setExists(r.exists); setDemo(r.demoCode || ""); setStep("code"); setLeft(45); } catch (e: any) { setErr(e.message); } });
  const verify = () => run(async () => { setErr(""); try { const r = await api("/auth/otp/verify", { body: { mobile, code, name } }); setUser(r.user); nav("/portal"); } catch (e: any) { setErr(e.message); } });
  return <div className="login-wrap"><div className="login">
    <div className="row" style={{ marginBottom: 16 }}><div className="pt-logo" style={{ width: 46, height: 46 }}>SN</div><div><h2>پورتال موکلان</h2><p className="muted small">دفتر وکالت دکتر سبحان نیک‌سرشت</p></div></div>
    {step === "mobile" ? <form onSubmit={e => { e.preventDefault(); send(); }}>
      <p className="muted" style={{ marginBottom: 14 }}>شماره موبایل خود را وارد کنید؛ یک کد تأیید برایتان ارسال می‌شود. اگر قبلاً ثبت‌نام نکرده‌اید، همین‌جا حساب شما ساخته می‌شود.</p>
      <Field label="شماره موبایل"><input className="ltr" inputMode="numeric" placeholder="09123456789" value={mobile} onChange={e => setMobile(e.target.value)} autoFocus /></Field>
      {isDemo() && <div className="demo" style={{ marginBottom: 12 }}>برای امتحان کردن:<div className="row" style={{ marginTop: 8, gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn ghost sm" onClick={() => setMobile("09120000001")}>موکلی که پرونده دارد</button>
        <button type="button" className="btn ghost sm" onClick={() => setMobile("09121234567")}>ثبت‌نام به‌عنوان موکل جدید</button></div></div>}
      {err && <p style={{ color: "#a3231b", marginBottom: 10 }}>{err}</p>}
      <button className="btn gold" style={{ width: "100%" }} disabled={busy || mobile.length < 10}>دریافت کد تأیید</button>
    </form> : <form onSubmit={e => { e.preventDefault(); verify(); }}>
      <p className="muted" style={{ marginBottom: 12 }}>کد ۵ رقمی ارسال‌شده به <b className="ltr">{fd(mobile)}</b> را وارد کنید.</p>
      {demo && <div className="demo" style={{ marginBottom: 12 }}>🔐 کد تأیید شما: <b style={{ fontSize: 18, letterSpacing: 3 }}>{fd(demo)}</b><br /><span className="small muted">(در نسخه نهایی، کد با پیامک ارسال می‌شود)</span></div>}
      <Field label="کد تأیید"><input className="otp" inputMode="numeric" maxLength={5} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} autoFocus /></Field>
      {!exists && <Field label="نام و نام خانوادگی (برای ثبت‌نام)"><input value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: علی رضایی" /></Field>}
      {err && <p style={{ color: "#a3231b", marginBottom: 10 }}>{err}</p>}
      <button className="btn gold" style={{ width: "100%" }} disabled={busy || code.length < 5 || (!exists && name.trim().length < 3)}>{exists ? "ورود" : "ثبت‌نام و ورود"}</button>
      <div className="row sb" style={{ marginTop: 12 }}><button type="button" className="small muted" onClick={() => { setStep("mobile"); setCode(""); }}>← تغییر شماره</button><button type="button" className="small" disabled={left > 0} onClick={send} style={{ color: left ? "#999" : "#8e702e" }}>{left > 0 ? `ارسال مجدد (${fd(left)})` : "ارسال مجدد کد"}</button></div>
    </form>}
    <p className="small muted" style={{ marginTop: 14 }}><Link href="/demo">← انتخاب نوع پنل (موکل / وکیل)</Link> · <Link href="/">بازگشت به سایت</Link></p>
  </div></div>;
}
