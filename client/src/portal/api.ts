import { useCallback, useEffect, useRef, useState } from "react";

// Local dev: Vite proxies /papi -> http://localhost:4000. Production: set VITE_PORTAL_API_URL to the deployed API (…/papi).
export const BASE: string = (import.meta as any).env?.VITE_PORTAL_API_URL || "/papi";

export async function api<T = any>(path: string, opts: { method?: string; body?: any; form?: FormData } = {}): Promise<T> {
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
