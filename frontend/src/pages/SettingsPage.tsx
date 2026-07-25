import { useThemeStore } from "../store/theme";
import { useAuthStore } from "../store/auth";

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const username = useAuthStore((state) => state.username);
  const darkMode = theme === "dark";
  return <><header className="page-head"><div><h1>Settings</h1><p>Personalize your workspace and review your account preferences.</p></div></header>
    <section className="settings-stack">
      <article className="panel preference-row"><div><h2>Appearance</h2><p>Use a light or dark display style.</p></div><label className="theme-switch" aria-label="Toggle dark mode"><input type="checkbox" checked={darkMode} onChange={() => setTheme(darkMode ? "light" : "dark")} /><span className="theme-slider" /><b>{darkMode ? "Dark" : "Light"}</b></label></article>
      <article className="panel preference-row"><div><h2>Account</h2><p>Signed in as <strong>{username ?? "User"}</strong></p></div><span className="setting-note">Your account details are protected.</span></article>
      <article className="panel preference-row"><div><h2>Alerts</h2><p>Critical conditions are shown in red; warnings are shown in amber.</p></div><span className="setting-note">Review alerts regularly.</span></article>
      <article className="panel preference-row"><div><h2>Help</h2><p>Manage records in Patients and view the latest readings in Live monitoring.</p></div><span className="setting-note">Contact your administrator if you need help.</span></article>
    </section>
  </>;
}
