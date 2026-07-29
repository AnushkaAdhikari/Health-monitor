import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useCriticalAlertSound } from "../hooks/useCriticalAlertSound";
import VitalTrendChart from "../components/VitalTrendChart";

type Patient = { id: number; name: string };
type Vital = { heart_rate: number; spo2: number; temperature: number; recorded_at: string };
type Alert = { level: "warning" | "critical"; message: string };
type AlertData = { alerts: Alert[]; device_status: "connected" | "disconnected"; message?: string };
const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; };

export default function DashboardPage() {
  const [selected, setSelected] = useState<number>();
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: () => api.get("/api/patients/").then(r => r.data as Patient[]) });
  const patientId = selected ?? patients[0]?.id;
  const { data: latest } = useQuery({ queryKey: ["latest", patientId], enabled: !!patientId, queryFn: () => api.get(`/api/vitals/latest?patient_id=${patientId}`).then(r => r.data as Vital), retry: false, refetchInterval: 5000 });
  const { data: alertData = { alerts: [], device_status: "disconnected" } } = useQuery({ queryKey: ["alerts", patientId], enabled: !!patientId, queryFn: () => api.get(`/api/vitals/alerts?patient_id=${patientId}`).then(r => r.data as AlertData), refetchInterval: 5000 });
  const { data: history = [] } = useQuery({ queryKey: ["dashboard-history", patientId], enabled: !!patientId, queryFn: () => api.get(`/api/vitals/${patientId}?limit=20`).then(r => r.data as Vital[]), refetchInterval: 5000 });
  const alerts = alertData.alerts;
  useCriticalAlertSound(alerts);
  return <><header className="page-head"><div><h1>{greeting()}, Doctor</h1><p>Here is your patient monitoring overview.</p></div><Link className="button" to="/patients">Add patient</Link></header>
    <div className="dashboard-picker"><label>Patient <select value={patientId ?? ""} onChange={e => setSelected(Number(e.target.value))}>{patients.map(patient => <option key={patient.id} value={patient.id}>ID #{patient.id} · {patient.name}</option>)}</select></label></div>
    <section className="stats-grid"><Card icon="♙" label="Total patients" value={patients.length}/><Card icon="♥" label="Heart rate" value={latest?.heart_rate ?? "—"} unit="bpm"/><Card icon="◉" label="Oxygen level" value={latest?.spo2 ?? "—"} unit="%"/><Card icon="♨" label="Temperature" value={latest?.temperature ?? "—"} unit="°C"/></section>
    <section className="content-grid"><article className="panel"><h2>Recent vital trend</h2><VitalTrendChart data={history} height={235}/></article><article className="panel"><h2>Patient status</h2>{alertData.device_status === "disconnected" ? <p className="device-notice">{alertData.message || "No recent reading received. Check the monitor connection."}</p> : alerts.length ? alerts.map((alert, index) => <p className={alert.level === "critical" ? "status-bad" : "alert-warning"} key={index}>{alert.message}</p>) : <p className="status-good">Monitor connected. No active alerts.</p>}</article></section>
  </>;
}
function Card({ icon, label, value, unit = "" }: { icon: string; label: string; value: string | number; unit?: string }) { return <article className="stat-card dashboard-stat"><span className="dashboard-stat-icon" aria-hidden="true">{icon}</span><p>{label}</p><strong>{value}</strong><small>{unit}</small></article>; }
