import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const links = [["/", "Dashboard"], ["/patients", "Patients"], ["/live", "Live monitoring"], ["/history", "Patient history"], ["/alerts", "Alerts"], ["/reports", "Reports"], ["/settings", "Settings"]];

export default function DashboardLayout() {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();
  const signOut = () => { if (window.confirm("Are you sure you want to log out?")) { logout(); navigate("/login"); } };
  return <div className="app-shell"><aside className="sidebar"><div className="portal-brand"><span>+</span><b>VitalCare<small>CLINICAL PORTAL</small></b></div><nav>{links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className="side-link">{label}</NavLink>)}</nav><div className="sidebar-user"><span className="avatar">{username?.[0]?.toUpperCase() ?? "U"}</span><span><b>{username ?? "Doctor"}</b><button onClick={signOut}>Logout</button></span></div></aside><main className="main-content"><Outlet /></main></div>;
}
