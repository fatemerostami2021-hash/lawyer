import { useEffect, useRef, useState } from "react";
import { Bell, Send, X } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { api, useApi } from "./api";
import { dt } from "./fmt";

const dec = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function Rich({ t }: { t: string }) {
  let bold = false, code = false;
  return <>{t.split(/(<\/?(?:b|code)>)/g).map((p, i) => {
    if (p === "<b>") { bold = true; return null; } if (p === "</b>") { bold = false; return null; }
    if (p === "<code>") { code = true; return null; } if (p === "</code>") { code = false; return null; }
    return <span key={i} style={{ fontWeight: bold ? 700 : 400, fontFamily: code ? "monospace" : undefined, letterSpacing: code ? 2 : undefined }}>{dec(p)}</span>;
  })}</>;
}

// Simulated Telegram: shows what the real bot would send to the lawyer, with working inline buttons (demo only).
export function TgBell() {
  const { data, reload } = useApi<any>("/admin/demo/tg", 2500);
  const [open, setOpen] = useState(false);
  const end = useRef<HTMLDivElement>(null); const prev = useRef<number | null>(null);
  const msgs: any[] = data?.messages || [];
  const unseen = msgs.filter(m => !m.seen && m.from === "bot").length;
  useEffect(() => { if (prev.current !== null && unseen > prev.current && !open) toast("📨 پیام جدید در تلگرام وکیل (شبیه‌سازی)"); prev.current = unseen; }, [unseen, open]);
  useEffect(() => { if (open) { api("/admin/demo/tg/seen", { body: {} }).then(reload); end.current?.scrollIntoView({ block: "end" }); } }, [open, msgs.length]);
  const act = async (id: string, d: string) => { await api("/admin/demo/tg/action", { body: { id, data: d } }); reload(); };
  const cmd = async (c: string) => { await api("/admin/demo/tg/command", { body: { cmd: c } }); reload(); };
  return <>
    <button className="btn ghost sm" onClick={() => setOpen(true)} aria-label="تلگرام (شبیه‌سازی)" style={{ position: "relative" }}><Bell size={16} />تلگرام{unseen > 0 && <span className="badge amber" style={{ marginRight: 4 }}>{unseen}</span>}</button>
    {open && createPortal(<div className="tg-bg" onMouseDown={e => e.target === e.currentTarget && setOpen(false)}><aside className="tg" dir="rtl">
      <div className="tg-head"><div className="pt-logo" style={{ width: 34, height: 34, fontSize: 14 }}>🤖</div><div><b>Fitmindsetbot</b><small>شبیه‌سازی ربات تلگرام وکیل</small></div><div className="sp" /><button onClick={() => setOpen(false)} aria-label="بستن"><X size={18} /></button></div>
      <div className="tg-body">{!msgs.length && <p style={{ color: "#8ba0b5", textAlign: "center", marginTop: 40 }}>هنوز پیامی نیست. از پورتال موکل نوبت بگیرید تا اینجا پیام ربات را ببینید.</p>}
        {msgs.map(m => <div key={m.id} className={"tg-msg " + (m.from === "me" ? "me" : "")}><div className="tg-bubble"><Rich t={m.text} /><small>{dt(m.createdAt)}</small></div>
          {m.buttons && <div className="tg-kb">{m.buttons.map((row: any[], i: number) => <div key={i}>{row.map(b => <button key={b.data} onClick={() => act(m.id, b.data)}>{b.text}</button>)}</div>)}</div>}</div>)}<div ref={end} /></div>
      <div className="tg-foot">{["/today", "/pending", "/stats"].map(c => <button key={c} onClick={() => cmd(c)}><Send size={12} /> {c}</button>)}</div>
    </aside></div>, document.querySelector(".pt") || document.body)}
  </>;
}
