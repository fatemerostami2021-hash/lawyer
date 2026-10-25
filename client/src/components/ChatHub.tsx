import { useEffect, useRef, useState } from "react";
import { Instagram, Linkedin, MessageCircle, Send, X, Headset } from "lucide-react";
import { FAQS, UI, searchAll, type Locale } from "@/lib/i18n";
import { searchPosts } from "@/content/insightsI18n";
import { SITE } from "@/lib/site";

const ICONS = [
  { id: "chat", Icon: Headset, color: "#d9b45b" },
  { id: "whatsapp", Icon: MessageCircle, color: "#25D366" },
  { id: "telegram", Icon: Send, color: "#2AABEE" },
  { id: "instagram", Icon: Instagram, color: "#E1306C" },
  { id: "linkedin", Icon: Linkedin, color: "#0A66C2" },
];
type Msg = { from: "bot" | "me"; text: string };

export default function ChatHub({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [hint, setHint] = useState(0);
  const [hintOn, setHintOn] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [offer, setOffer] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const hints = UI.chatHints[locale].split("|");

  useEffect(() => { setMsgs([{ from: "bot", text: UI.chatHello[locale] }]); setOffer(false); }, [locale]);
  useEffect(() => { if (open) return; const t = setInterval(() => setI(v => (v + 1) % ICONS.length), 1800); return () => clearInterval(t); }, [open]);
  useEffect(() => {
    if (open) { setHintOn(false); return; }
    let hide: number | undefined;
    const show = () => { setHintOn(true); hide = window.setTimeout(() => setHintOn(false), 3500); };
    const first = window.setTimeout(show, 3000);
    const t = window.setInterval(() => { setHint(v => (v + 1) % hints.length); show(); }, 7000);
    return () => { clearTimeout(first); clearTimeout(hide); clearInterval(t); };
  }, [open, hints.length]);
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" }); }, [msgs, open]);

  const ask = (question: string, answer?: string) => {
    setMsgs(m => [...m, { from: "me", text: question }]);
    let reply = answer; let miss = false;
    if (!reply) { const best = searchAll(question, locale, searchPosts(locale)).find(h => h.kind === "faq" || h.kind === "area"); if (best) reply = best.snippet; else { reply = UI.chatFallback[locale]; miss = true; } }
    setOffer(miss);
    setTimeout(() => setMsgs(m => [...m, { from: "bot", text: reply! }]), 450);
  };
  const submit = () => { const v = text.trim(); if (!v) return; setText(""); ask(v); };
  const cur = ICONS[i];

  return (
    <div className="chat-hub">
      {open && (
        <div className="chat-panel" role="dialog" aria-label={UI.chatTitle[locale]}>
          <div className="chat-head"><strong>{UI.chatTitle[locale]}</strong><button type="button" onClick={() => setOpen(false)} aria-label={UI.close[locale]}><X size={18} /></button></div>
          <div className="chat-body" ref={body}>
            {msgs.map((m, k) => <div key={k} className={`chat-msg ${m.from}`}>{m.text}</div>)}
            {offer && <a className="chat-wa" href={SITE.social.whatsapp} target="_blank" rel="noreferrer">{UI.chatWa[locale]}</a>}
            <div className="chat-quick">{FAQS.slice(0, 5).map(f => <button key={f.id} type="button" onClick={() => ask(f.q[locale], f.a[locale])}>{f.q[locale]}</button>)}</div>
          </div>
          <div className="chat-input"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder={UI.chatPh[locale]} /><button type="button" onClick={submit} aria-label={UI.chatSend[locale]}><Send size={16} /></button></div>
          <div className="chat-social">
            <a href={SITE.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={16} /></a>
            <a href={SITE.social.telegram} target="_blank" rel="noreferrer" aria-label="Telegram"><Send size={16} /></a>
            <a href={SITE.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={16} /></a>
            <a href={SITE.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>
          </div>
        </div>
      )}
      {!open && <div className={`chat-hint ${hintOn ? "is-on" : ""}`} aria-hidden="true">{hints[hint]}</div>}
      <button type="button" className="chat-fab" style={{ background: open ? "#d9b45b" : cur.color }} onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label={UI.chatTitle[locale]}>
        {open ? <X size={24} /> : <span key={cur.id} className="fab-icon"><cur.Icon size={26} /></span>}
        <span className="chat-dot" />
      </button>
    </div>
  );
}
