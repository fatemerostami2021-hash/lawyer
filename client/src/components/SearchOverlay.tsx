import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { UI, searchAll, type Locale } from "@/lib/i18n";
import { searchPosts } from "@/content/insightsI18n";

export default function SearchOverlay({ open, onClose, locale, initial = "" }: { open: boolean; onClose: () => void; locale: Locale; initial?: string }) {
  const [q, setQ] = useState(initial);
  const [, go] = useLocation();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(initial); setTimeout(() => ref.current?.focus(), 50); } }, [open, initial]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const hits = useMemo(() => searchAll(q, locale, searchPosts(locale)), [q, locale]);
  if (!open) return null;
  const groups: { kind: "area" | "blog" | "faq"; label: string }[] = [
    { kind: "area", label: UI.groupAreas[locale] }, { kind: "faq", label: UI.groupFaq[locale] }, { kind: "blog", label: UI.groupBlog[locale] },
  ];
  const open_ = (href: string) => { onClose(); go(href); if (href.includes("#")) setTimeout(() => document.getElementById(href.split("#")[1])?.scrollIntoView({ behavior: "smooth", block: "center" }), 350); };
  return (
    <div className="search-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="search-box" onClick={e => e.stopPropagation()}>
        <div className="search-input"><Search size={20} /><input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder={UI.searchPh[locale]} /><button type="button" onClick={onClose} aria-label={UI.close[locale]}><X size={20} /></button></div>
        <div className="search-results">
          {q.trim() && hits.length === 0 && <p className="search-empty">{UI.noResults[locale]}</p>}
          {groups.map(g => { const list = hits.filter(h => h.kind === g.kind).slice(0, 4); return list.length ? <div key={g.kind} className="search-group"><span className="search-label">{g.label}</span>{list.map(h => <button key={h.kind + h.id} type="button" className="search-hit" onClick={() => open_(h.href)}><strong>{h.title}</strong><small>{h.snippet.slice(0, 110)}…</small></button>)}</div> : null; })}
          {!q.trim() && <p className="search-empty">{UI.searchPh[locale]}</p>}
        </div>
      </div>
    </div>
  );
}
