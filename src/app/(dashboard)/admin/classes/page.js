"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY = { name: "" };

export default function AdminClassesPage() {
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY);
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    const res = await apiFetch("/api/classes");
    const json = await res?.json();
    if (res?.ok) setClasses(json.data);
    setLoading(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch("/api/classes", { method: "POST", body: JSON.stringify(form) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: `Class "${form.name}" created.` });
      setForm(EMPTY); setShowForm(false);
      loadClasses();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this class?")) return;
    const res = await apiFetch(`/api/classes/${id}`, { method: "DELETE" });
    if (res?.ok) { setClasses((c) => c.filter((x) => x._id !== id)); setMsg({ ok: true, text: "Class deleted." }); }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-sub">{classes.length} class{classes.length !== 1 ? "es" : ""}</p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setForm(EMPTY); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          {showForm ? "Cancel" : "+ New Class"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Create New Class</p>
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="form-label">Name</label>
              <input value={form.name} onChange={set("name")} placeholder='e.g. Grade 10-A' required className="input" />
            </div>
            <div>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Create Class"}
              </button>
            </div>
          </form>
        </div>
      )}

      {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Class Teacher</th><th></th></tr></thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td className="td-muted">{c.classTeacherId ? "Assigned" : "—"}</td>
                <td><button onClick={() => handleDelete(c._id)} className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button></td>
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
