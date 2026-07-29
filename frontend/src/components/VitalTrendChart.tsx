import ReactApexChart from "react-apexcharts";
export type Vital = { heart_rate: number; spo2: number; temperature: number; recorded_at: string };
export default function VitalTrendChart({ data, height = 250 }: { data: Vital[]; height?: number }) {
  const points = [...data].reverse();
  if (!points.length) return <p className="muted">No readings available yet.</p>;
  return <ReactApexChart type="line" height={height} options={{ chart: { toolbar: { show: false } }, stroke: { curve: "smooth", width: 2 }, colors: ["#DC2626", "#1976D2", "#16A34A"], xaxis: { categories: points.map(v => new Date(v.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })) }, legend: { position: "top" }, grid: { borderColor: "#CBD5E1" } }} series={[{ name: "Heart rate", data: points.map(v => v.heart_rate) }, { name: "SpO₂", data: points.map(v => v.spo2) }, { name: "Temperature", data: points.map(v => v.temperature) }]} />;
}
