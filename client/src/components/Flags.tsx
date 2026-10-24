// Inline SVG flags (emoji flags do not render on Windows).
export function Flag({ code }: { code: "fa" | "en" | "ar" }) {
  if (code === "fa") return (
    <svg viewBox="0 0 30 20" className="flag-svg" aria-hidden="true"><rect width="30" height="20" fill="#fff" /><rect width="30" height="6.67" fill="#239f40" /><rect y="13.33" width="30" height="6.67" fill="#da0000" /><circle cx="15" cy="10" r="2.3" fill="none" stroke="#da0000" strokeWidth="0.9" /><path d="M15 7.8v4.4" stroke="#da0000" strokeWidth="0.9" /></svg>
  );
  if (code === "ar") return (
    <svg viewBox="0 0 30 20" className="flag-svg" aria-hidden="true"><rect width="30" height="20" fill="#fff" /><rect x="8" width="22" height="6.67" fill="#00732f" /><rect x="8" y="13.33" width="22" height="6.67" fill="#000" /><rect width="8" height="20" fill="#ff0000" /><rect x="8" y="6.67" width="22" height="6.66" fill="#fff" /></svg>
  );
  return (
    <svg viewBox="0 0 30 20" className="flag-svg" aria-hidden="true"><rect width="30" height="20" fill="#012169" /><path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" /><path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" /><path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" /><path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.4" /></svg>
  );
}
