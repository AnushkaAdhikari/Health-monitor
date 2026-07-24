import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const links = [["/", "Dashboard"], ["/patients", "Patients"], ["/live", "Live monitoring"], ["/history", "Patient history"], ["/alerts", "Alerts"], ["/reports", "Reports"], ["/settings", "Settings"]];

export default function DashboardLayout() {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();
  return <div className="app-shell"><aside className="sidebar"><nav>{links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className="side-link">{label}</NavLink>)}</nav><div className="sidebar-user"><span className="avatar">{username?.[0]?.toUpperCase() ?? "U"}</span><span><b>{username ?? "User"}</b><button onClick={() => { logout(); navigate("/login"); }}>Logout</button></span></div></aside><main className="main-content"><Outlet /></main></div>;
}
