"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY = { name: "", code: "", classId: "" };

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY);
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch("/api/subjects"), apiFetch("/api/classes")]).then(async ([sRes, cRes]) => {
      const sJson = await sRes?.json();
      const cJson = await cRes?.json();
      if (sRes?.ok) setSubjects(sJson.data);
      if (cRes?.ok) setClasses(cJson.data);
      setLoading(false);
    });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function loadSubjects() {
    const res  = await apiFetch("/api/subjects");
    const json = await res?.json();
    if (res?.ok) setSubjects(json.data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch("/api/subjects", {
      method: "POST",
      body: JSON.stringify({ ...form, classId: form.classId || undefined }),
    });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: `Subject "${form.name}" created.` });
      setForm(EMPTY); setShowForm(false);
      loadSubjects();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this subject?")) return;
    const res = await apiFetch(`/api/subjects/${id}`, { method: "DELETE" });
    if (res?.ok) { setSubjects((s) => s.filter((x) => x._id !== id)); setMsg({ ok: true, text: "Subject deleted." }); }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-sub">{subjects.length} subject{subjects.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setForm(EMPTY); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          {showForm ? "Cancel" : "+ New Subject"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Create New Subject</p>
          <form onSubmit={handleSubmit} className="form-grid form-grid-2">
            <div>
              <label className="form-label">Name</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Mathematics" required className="input" />
            </div>
            <div>
              <label className="form-label">Code</label>
              <input value={form.code} onChange={set("code")} placeholder="e.g. MATH101" required className="input" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Class (optional)</label>
              <select value={form.classId} onChange={set("classId")} className="input">
                <option value="">— None —</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Create Subject"}
              </button>
            </div>
          </form>
        </div>
      )}

      {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Code</th><th>Class</th><th></th></tr></thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td className="td-muted">{s.code}</td>
                <td className="td-muted">{s.classId?.name || "—"}</td>
                <td><button onClick={() => handleDelete(s._id)} className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
