import { useState } from "react";
import type { ChangeEvent } from "react";
import { useThemeStore } from "../store/theme";
import { useAuthStore } from "../store/auth";

type Profile = { name: string; email: string; department: string; avatar: string };
const readProfile = (username: string | null): Profile => JSON.parse(localStorage.getItem("doctorProfile") || "null") || { name: username || "Doctor", email: "", department: "", avatar: "" };

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore(); const username = useAuthStore((state) => state.username);
  const [profile, setProfile] = useState(() => readProfile(username)); const [editing, setEditing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem("criticalSound") !== "off"); const darkMode = theme === "dark";
  const save = () => { localStorage.setItem("doctorProfile", JSON.stringify(profile)); setEditing(false); };
  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProfile({ ...profile, avatar: String(reader.result) }); reader.readAsDataURL(file); };
  const toggleSound = () => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem("criticalSound", next ? "on" : "off"); };
  return <><header className="page-head"><div><h1>Settings</h1><p>Manage your profile and workspace preferences.</p></div></header><section className="settings-stack">
    <article className="panel profile-summary"><div className="profile-avatar">{profile.avatar ? <img src={profile.avatar} alt="Doctor profile" /> : profile.name.slice(0, 1).toUpperCase()}</div><div><h2>Doctor profile</h2><p>{profile.name}</p><small>{profile.department || "Add your department or specialty"}</small></div><button className="button secondary" onClick={() => setEditing(true)}>Edit profile</button></article>
    <article className="panel preference-row"><div><h2>Appearance</h2><p>Use a light or dark display style.</p></div><label className="theme-switch"><input type="checkbox" checked={darkMode} onChange={() => setTheme(darkMode ? "light" : "dark")} /><span className="theme-slider" /><b>{darkMode ? "Dark" : "Light"}</b></label></article>
    <article className="panel preference-row"><div><h2>Critical alert sound</h2><p>Play a short sound when a new critical condition is detected.</p></div><label className="theme-switch"><input type="checkbox" checked={soundEnabled} onChange={toggleSound} /><span className="theme-slider" /><b>{soundEnabled ? "On" : "Off"}</b></label></article>
  </section>{editing && <div className="modal-backdrop" role="dialog"><section className="modal-card"><div className="modal-heading"><h2>Edit doctor profile</h2><button onClick={() => setEditing(false)}>×</button></div><div className="profile-grid"><label>Full name<input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></label><label>Email address<input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></label><label>Department / specialty<input value={profile.department} placeholder="e.g. General medicine" onChange={e => setProfile({ ...profile, department: e.target.value })} /></label></div><div className="profile-actions"><label className="upload-button">Upload photo<input type="file" accept="image/*" onChange={uploadAvatar} /></label><button className="button" onClick={save}>Save profile</button></div></section></div>}</>;
}
