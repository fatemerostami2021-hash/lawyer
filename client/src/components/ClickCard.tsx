import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useLocation } from "wouter";

// A whole card that behaves like a link (mouse + keyboard), while links/buttons inside keep working.
export default function ClickCard({ href, className = "", children, tilt = false, id }: { href: string; className?: string; children: ReactNode; tilt?: boolean; id?: string }) {
  const [, go] = useLocation();
  const onClick = (e: MouseEvent<HTMLDivElement>) => { if ((e.target as HTMLElement).closest("a,button")) return; go(href); };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); go(href); } };
  return <div id={id} role="link" tabIndex={0} className={`click-card ${className}`} data-tilt={tilt ? "" : undefined} onClick={onClick} onKeyDown={onKey}>{children}</div>;
}
