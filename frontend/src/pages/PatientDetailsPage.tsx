import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

type Patient = { id: number; name: string; age: number; gender: string; ward?: string; phone?: string; blood_group?: string; address?: string; medical_history?: string };
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [draft, setDraft] = useState<Patient>();
  const [error, setError] = useState("");
  const { data: patient, isLoading } = useQuery({ queryKey: ["patient", id], queryFn: () => api.get(`/api/patients/${id}`).then(r => r.data as Patient) });
  const record = draft ?? patient;
  const update = useMutation({ mutationFn: (data: Patient) => api.put(`/api/patients/${id}`, data), onSuccess: () => { client.invalidateQueries({ queryKey: ["patients"] }); client.invalidateQueries({ queryKey: ["patient", id] }); setError(""); } });
  const remove = useMutation({ mutationFn: () => api.delete(`/api/patients/${id}`), onSuccess: () => { client.invalidateQueries({ queryKey: ["patients"] }); navigate("/patients"); } });
  const change = (key: keyof Patient, value: string | number) => record && setDraft({ ...record, [key]: value });

  if (isLoading || !record) return <div className="empty">Loading patient record…</div>;
  const save = () => { setError(""); update.mutate({ ...record, ward: record.ward ?? "", phone: record.phone ?? "", blood_group: record.blood_group ?? "", address: record.address ?? "", medical_history: record.medical_history ?? "" }, { onError: (err: any) => setError(err.response?.data?.detail ?? "Could not save changes.") }); };

  return <><div className="detail-heading"><div><Link className="text-link" to="/patients">← Patients</Link><h1 className="plain-title">Patient details</h1><p>Update this patient’s information.</p></div></div><section className="panel detail-form"><div className="form-grid">
    <label>Full name<input required value={record.name} onChange={e => change("name", e.target.value)} /></label>
    <label>Age<input required type="number" min="1" max="130" value={record.age} onChange={e => change("age", Number(e.target.value))} /></label>
    <label>Gender<select required value={record.gender} onChange={e => change("gender", e.target.value)}><option>Female</option><option>Male</option><option>Other</option></select></label>
    <label>Ward / room number<input required value={record.ward ?? ""} onChange={e => change("ward", e.target.value)} /></label>
    <label>Phone number<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={record.phone ?? ""} onChange={e => change("phone", e.target.value.replace(/\D/g, ""))} /></label>
    <label>Blood group<select required value={record.blood_group ?? ""} onChange={e => change("blood_group", e.target.value)}><option value="">Select blood group</option>{bloodGroups.map(group => <option key={group}>{group}</option>)}</select></label>
    <label>Address<input required value={record.address ?? ""} onChange={e => change("address", e.target.value)} /></label>
    <label>Medical history<input required value={record.medical_history ?? ""} onChange={e => change("medical_history", e.target.value)} /></label>
  </div>{error && <p className="form-error">{error}</p>}<div className="actions"><button className="button" onClick={save} disabled={update.isPending}>{update.isPending ? "Saving…" : "Save changes"}</button><button className="button danger" onClick={() => { if (confirm("Delete this patient record?")) remove.mutate(); }}>Delete patient</button></div></section></>;
}
