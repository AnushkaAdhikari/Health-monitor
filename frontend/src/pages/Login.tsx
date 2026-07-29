import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const registered = params.get("registered") === "1";
  const dark = useThemeStore((s) => s.theme) === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const me = await api.get("/auth/me", { headers: { Authorization: `Bearer ${res.data.access_token}` } });
      login(res.data.access_token, me.data.username);
      if (!localStorage.getItem("doctorProfile")) localStorage.setItem("doctorProfile", JSON.stringify({ name: me.data.username, email: me.data.email, department: "", avatar: "" }));
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.page, background: dark ? "#111827" : "#F4F7FB" }}>
      <div style={{ ...styles.card, background: dark ? "#1F2937" : "#fff", color: dark ? "#F9FAFB" : "#17223B" }}>
        <div style={styles.brand}><span>+</span>VitalCare</div><p style={{ ...styles.subtitle, color: dark ? "#D1D5DB" : "#667085" }}>Sign in to your account</p>

        {registered && <div style={styles.success}>Account created! Please sign in.</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email address</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrap}><input style={{ ...styles.input, marginBottom: 0, paddingRight: "3.2rem" }} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eye}>{showPassword ? "Hide" : "Show"}</button></div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:     { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F4F7FB" },
  card:     { background: "#fff", borderRadius: 12, padding: "2.5rem", width: 360, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" },
  title:    { margin: 0, fontSize: "1.6rem", color: "#17223B", textAlign: "center" },
  brand: { color: "#1976D2", textAlign: "center", fontSize: "1.7rem", fontWeight: 700, marginBottom: 7 },
  subtitle: { textAlign: "center", color: "#667085", marginBottom: "1.5rem" },
  label:    { display: "block", marginBottom: 4, fontWeight: 600, fontSize: "0.9rem" },
  input:    { width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1px solid #CBD5E1", marginBottom: "1rem", fontSize: "1rem", boxSizing: "border-box" },
  passwordWrap: { position: "relative", marginBottom: "1rem" },
  eye: { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", color: "#1976D2", fontSize: "0.8rem", fontWeight: 600, padding: 5 },
  button:   { width: "100%", padding: "0.75rem", background: "#1976D2", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  error:    { background: "#fef2f2", color: "#dc2626", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.9rem" },
  success:  { background: "#f0fdf4", color: "#16a34a", padding: "0.75rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.9rem", fontWeight: 600 },
  footer:   { textAlign: "center", color: "#6b7280", fontSize: "0.9rem", margin: "0.5rem 0 0" },
  link:     { color: "#1a56db", fontWeight: 600, textDecoration: "none" },
};
