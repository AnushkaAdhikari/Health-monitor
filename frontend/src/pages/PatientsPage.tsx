import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

type Patient = { id: number; name: string; age: number; gender: string; ward?: string };
const empty = { full_name: "", age: "", gender: "", ward: "", phone: "", blood_group: "", address: "", medical_history: "" };
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/api/patients/").then((r) => setPatients(r.data)).catch(() => setError("Could not load patients. Please check that the backend is running and sign in again."));
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true); setError("");
      await api.post("/api/patients/", { name: form.full_name, age: Number(form.age), gender: form.gender, ward: form.ward, phone: form.phone, blood_group: form.blood_group, address: form.address, medical_history: form.medical_history });
      setForm(empty); load();
    } catch (err: any) { setError(err.response?.data?.detail || "Could not save patient."); }
    finally { setSaving(false); }
  }

  const setValue = (key: keyof typeof empty, value: string) => setForm({ ...form, [key]: value });
  const filtered = patients.filter((patient) => patient.name.toLowerCase().includes(search.toLowerCase()));

  return <><h1 className="plain-title">Patients</h1><section className="two"><form className="panel patient-form" onSubmit={save}><h2>Add patient</h2>
    <input required minLength={2} placeholder="Full name" value={form.full_name} onChange={e => setValue("full_name", e.target.value)} />
    <input required type="number" min="1" max="130" placeholder="Age" value={form.age} onChange={e => setValue("age", e.target.value)} />
    <select required value={form.gender} onChange={e => setValue("gender", e.target.value)}><option value="">Gender</option><option>Female</option><option>Male</option><option>Other</option></select>
    <input required placeholder="Ward / room number" value={form.ward} onChange={e => setValue("ward", e.target.value)} />
    <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="Phone number (10 digits)" value={form.phone} onChange={e => setValue("phone", e.target.value.replace(/\D/g, ""))} />
    <select required value={form.blood_group} onChange={e => setValue("blood_group", e.target.value)}><option value="">Blood group</option>{bloodGroups.map(group => <option key={group}>{group}</option>)}</select>
    <input required placeholder="Address" value={form.address} onChange={e => setValue("address", e.target.value)} />
    <input required placeholder="Medical history" value={form.medical_history} onChange={e => setValue("medical_history", e.target.value)} />
    {error && <small className="form-error">{error}</small>}<button className="button" disabled={saving}>{saving ? "Adding…" : "Add patient"}</button></form>
    <section className="panel patient-list-panel"><h2>Patient list</h2><input className="search" placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)} />
      {filtered.map(p => <Link className="patient" key={p.id} to={`/patients/${p.id}`}>{p.name}<span>{p.age} years</span></Link>)}
      {!filtered.length && <p className="muted">No matching patients.</p>}
    </section></section></>;
}
