import { useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { BarChart3, Briefcase, CalendarCheck, CalendarDays, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, Settings as Cog, ShieldCheck, Users, Wallet } from "lucide-react";
import { useApi } from "./api";
import { useAuth } from "./PortalApp";
import Dashboard from "./Dashboard";
import { AppointmentsPage } from "./AdminAppointments";
import { ClientsPage, ClientDetail } from "./AdminClients";
import { CasesPage, CaseDetail } from "./AdminCases";
import { CalendarPage, DocumentsPage, FinancePage } from "./AdminOps";
import { MessagesPage, ReportsPage, SettingsPage, TeamPage } from "./AdminMore";

const NAV: [string, string, any, boolean?][] = [
  ["/admin", "داشبورد", LayoutDashboard], ["/admin/appointments", "نوبت‌دهی", CalendarCheck], ["/admin/clients", "موکلان", Users], ["/admin/cases", "پرونده‌ها", Briefcase],
  ["/admin/calendar", "تقویم و مهلت‌ها", CalendarDays], ["/admin/documents", "مدارک", FileText], ["/admin/finance", "مالی", Wallet], ["/admin/messages", "پیام‌ها", MessageSquare],
  ["/admin/reports", "گزارش و خروجی", BarChart3], ["/admin/settings", "تنظیمات", Cog, true], ["/admin/team", "نقش‌ها و امنیت", ShieldCheck, true],
];
export default function AdminApp() {
  const { user, logout } = useAuth(); const [loc] = useLocation(); const [open, setOpen] = useState(false);
  const { data } = useApi<any>("/admin/dashboard", 20000);
  const badge = (p: string) => (p === "/admin/appointments" ? data?.kpi.pendingAppts : p === "/admin/messages" ? data?.kpi.unread : 0);
  const cur = NAV.find(([p]) => (p === "/admin" ? loc === "/admin" : loc.startsWith(p)));
  return <div className="pt-shell">
    <aside className={"pt-side" + (open ? " open" : "")} onClick={() => setOpen(false)}>
      <div className="pt-brand"><div className="pt-logo">SN</div><div><b>پنل مدیریت دفتر</b><small>{user?.role === "lawyer" ? "وکیل" : "منشی"} · {user?.name}</small></div></div>
      <nav className="pt-nav" aria-label="منوی اصلی">{NAV.filter(([, , , lo]) => !lo || user?.role === "lawyer").map(([p, l, Icon]) => <Link key={p} href={p} className={(p === "/admin" ? loc === p : loc.startsWith(p)) ? "on" : ""}><Icon size={18} />{l}{badge(p) ? <span className="bd">{badge(p)}</span> : null}</Link>)}
        <hr /><Link href="/portal"><Users size={18} />نمای پورتال موکل</Link><Link href="/"><LayoutDashboard size={18} />بازگشت به سایت</Link></nav>
      <div style={{ padding: 12 }}><button className="btn ghost" style={{ width: "100%" }} onClick={logout}><LogOut size={16} />خروج</button></div>
    </aside>
    <div className="pt-main">
      <header className="pt-top"><button className="btn ghost sm only-m" onClick={() => setOpen(true)} aria-label="منو"><Menu size={18} /></button><h1>{cur?.[1] || "جزئیات"}</h1><div className="sp" />
        <span className={"chip " + (data?.telegram?.paired ? "ok" : "warn")}>{data?.telegram?.paired ? "تلگرام متصل ✓" : "تلگرام: نیاز به اتصال"}</span></header>
      <main className="pt-body"><Switch>
        <Route path="/admin" component={Dashboard} /><Route path="/admin/appointments" component={AppointmentsPage} />
        <Route path="/admin/clients" component={ClientsPage} /><Route path="/admin/clients/:id" component={ClientDetail} />
        <Route path="/admin/cases" component={CasesPage} /><Route path="/admin/cases/:id" component={CaseDetail} />
        <Route path="/admin/calendar" component={CalendarPage} /><Route path="/admin/documents" component={DocumentsPage} /><Route path="/admin/finance" component={FinancePage} />
        <Route path="/admin/messages" component={MessagesPage} /><Route path="/admin/reports" component={ReportsPage} />
        <Route path="/admin/settings" component={SettingsPage} /><Route path="/admin/team" component={TeamPage} />
        <Route><div className="empty">صفحه پیدا نشد</div></Route>
      </Switch></main>
    </div>
  </div>;
}
