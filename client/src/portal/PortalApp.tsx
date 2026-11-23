import { useEffect, useState, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { Toaster } from "sonner";
import "./portal.css";
import { api, initMode, isDemo } from "./api";
import { DemoBanner, useNoIndex } from "./ui";
import StaffLogin from "./StaffLogin";
import AdminApp from "./AdminApp";
import ClientLogin from "./ClientLogin";
import ClientApp from "./ClientApp";
import DemoStart from "./DemoStart";

export type User = { id: string; name: string; role: "lawyer" | "assistant" | "client" } | null;
const Ctx = createContext<{ user: User; setUser: (u: User) => void; logout: () => void }>({ user: null, setUser: () => {}, logout: () => {} });
export const useAuth = () => useContext(Ctx);

export default function PortalApp() {
  useNoIndex();
  const [loc, nav] = useLocation();
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);
  // Staff and client sessions are separate: re-read the right one whenever the person moves between /admin and /portal.
  const area = loc.startsWith("/admin") ? "admin" : loc.startsWith("/demo") ? "demo" : "portal";
  useEffect(() => { initMode().then(() => api("/auth/me")).then(r => setUser(r.user)).catch(() => setUser(null)).finally(() => setReady(true)); }, [area]);
  const logout = async () => { await api("/auth/logout", { method: "POST", body: {} }).catch(() => {}); setUser(null); nav(loc.startsWith("/admin") ? "/admin" : "/portal"); };
  const isAdmin = loc.startsWith("/admin");
  const isStart = loc === "/demo" || loc === "/demo/";
  let view;
  if (!ready) view = <div className="login-wrap"><div style={{ color: "#f4d487" }}>در حال بارگذاری…</div></div>;
  else if (isStart) view = <DemoStart />;
  else if (isAdmin) view = user && user.role !== "client" ? <AdminApp /> : <StaffLogin />;
  else view = user && user.role === "client" ? <ClientApp /> : <ClientLogin />;
  return <Ctx.Provider value={{ user, setUser, logout }}><div className={"pt" + (ready && isDemo() && !isStart ? " has-demo" : "")} dir="rtl" lang="fa">{ready && !isStart && <DemoBanner />}{view}<Toaster position="top-center" richColors /></div></Ctx.Provider>;
}
