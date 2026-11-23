import { useCallback, useEffect, useRef, useState } from "react";

// Local dev: Vite proxies /papi -> http://localhost:4000. Production: set VITE_PORTAL_API_URL to the deployed API (…/papi).
export const BASE: string = (import.meta as any).env?.VITE_PORTAL_API_URL || "/papi";

// ---- Demo mode: no backend needed. The "server" runs inside the browser (see ./demo/engine.ts). ----
// Turns on when VITE_DEMO_MODE=true, or automatically on a public website where /papi/health does not answer.
let demo = false;
let modeReady: Promise<void> | null = null;
export const isDemo = () => demo;
const isPrivateHost = (h: string) => /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || h.endsWith(".local");
export function initMode(): Promise<void> {
  if (!modeReady) modeReady = (async () => {
    const forced = (import.meta as any).env?.VITE_DEMO_MODE;
    const saved = localStorage.getItem("pt_mode");
    if (forced === "true" || saved === "demo") { demo = true; return; }
    if (forced === "false" || saved === "real" || isPrivateHost(location.hostname)) return;
    try {
      const r = await fetch(BASE + "/health", { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined });
      const j = (r.headers.get("content-type") || "").includes("json") ? await r.json() : null;
      if (!(r.ok && j && j.ok)) demo = true;
    } catch { demo = true; }
  })();
  return modeReady;
}

export async function api<T = any>(path: string, opts: { method?: string; body?: any; form?: FormData } = {}): Promise<T> {
  if (demo) {
    const { demoRequest } = await import("./demo/engine");
    try { return (await demoRequest(opts.method || (opts.body || opts.form ? "POST" : "GET"), path, opts.body, opts.form)) as T; }
    catch (e: any) { if (e && e.status) { const err: any = new Error(e.message); err.status = e.status; err.data = e.data; throw err; } throw e; }
  }
  const init: RequestInit = { method: opts.method || (opts.body || opts.form ? "POST" : "GET"), credentials: "include", headers: {} };
  if (opts.form) init.body = opts.form;
  else if (opts.body !== undefined) { (init.headers as any)["Content-Type"] = "application/json"; init.body = JSON.stringify(opts.body); }
  let res: Response;
  try { res = await fetch(BASE + path, init); } catch { throw new Error("ارتباط با سرور برقرار نشد. مطمئن شوید بک‌اند (portal-api) در حال اجراست."); }
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("json") ? await res.json().catch(() => ({})) : null;
  if (!res.ok) { const e: any = new Error(data?.error || "خطا در انجام درخواست"); e.status = res.status; e.data = data; throw e; }
  return data as T;
}

export function useApi<T = any>(path: string | null, poll = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);
  const load = useCallback(async (silent = false) => {
    if (!path) return;
    if (!silent) setLoading(true);
    try { const d = await api<T>(path); if (alive.current) { setData(d); setError(""); } }
    catch (e: any) { if (alive.current) setError(e.message); }
    finally { if (alive.current) setLoading(false); }
  }, [path]);
  useEffect(() => { alive.current = true; setData(null); load(); const t = poll ? window.setInterval(() => load(true), poll) : 0; return () => { alive.current = false; if (t) clearInterval(t); }; }, [load, poll]);
  return { data, error, loading, reload: () => load(true) };
}
