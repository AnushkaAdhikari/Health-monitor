import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

const firmwareItems = [
  ["Wi-Fi", "Set WIFI_SSID and WIFI_PASS in firmware/src/main.cpp. Keep the password out of the dashboard and source control."],
  ["Backend endpoint", "Set API_ENDPOINT to your computer's IPv4 address followed by :8000/api/vitals/."],
  ["Patient assignment", "Set PATIENT_ID in main.cpp to the ID of the patient who will wear the device."],
  ["Sensors", "MAX30102 uses SDA GPIO 21 and SCL GPIO 22. DS18B20 data uses GPIO 4 with a 4.7kΩ pull-up resistor."],
];

export default function SettingsPage() {
  const health = useQuery({ queryKey: ["backend-health"], queryFn: () => api.get("/health").then(() => true), retry: false, refetchInterval: 15000 });
  const apiUrl = api.defaults.baseURL ?? "http://localhost:8000";
  const backendStatus = health.isSuccess ? "Connected" : health.isError ? "Unavailable" : "Checking…";

  return <><header className="page-head"><div><h1>Settings</h1><p>System details and instructions for connecting the monitoring device.</p></div></header>
    <section className="settings-grid system-settings">
      <article className="panel setting-card"><h2>Backend API</h2><p className={health.isSuccess ? "status-good" : health.isError ? "status-bad" : ""}>{backendStatus}</p><p>{apiUrl}</p><small>The backend must run before the dashboard or ESP32 can send and read data.</small></article>
      <article className="panel setting-card"><h2>Database</h2><p>PostgreSQL is configured on the backend server.</p><small>Database credentials stay in <code>backend/.env</code>; they are not exposed in this dashboard.</small></article>
      <article className="panel setting-card"><h2>ESP32 device</h2><p>Configure Wi-Fi, API endpoint, and patient ID in <code>firmware/src/main.cpp</code>.</p><small>After flashing, use the serial monitor to confirm each POST returns HTTP 201.</small></article>
      <article className="panel setting-card"><h2>Network</h2><p>Use the same Wi-Fi or hotspot for the computer and ESP32.</p><small>Allow the backend through Windows Firewall on port 8000.</small></article>
    </section>
    <section className="panel setup-panel"><h2>ESP32 setup checklist</h2><ol>{firmwareItems.map(([title, text]) => <li key={title}><b>{title}:</b> {text}</li>)}</ol><p>When the serial monitor shows <b>HTTP 201</b>, open Live monitoring and select the assigned patient.</p></section>
  </>;
}
