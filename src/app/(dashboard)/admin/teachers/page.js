"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY_NEW  = { name: "", email: "", password: "" };
const EMPTY_EDIT = { qualification: "", joiningDate: "" };

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newForm, setNewForm]   = useState(EMPTY_NEW);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);
  const [mode, setMode]         = useState(null);
  const [editId, setEditId]     = useState(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    const res  = await apiFetch("/api/teachers");
    const json = await res?.json();
    if (res?.ok) setTeachers(json.data);
    setLoading(false);
  }

  const setNew  = (k) => (e) => setNewForm((f) => ({ ...f, [k]: e.target.value }));
  const setEdit = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch("/api/users", { method: "POST", body: JSON.stringify({ ...newForm, role: "teacher" }) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: `Teacher account "${newForm.name}" created.` });
      setNewForm(EMPTY_NEW); setMode(null);
      loadTeachers();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  function startEdit(t) {
    setEditForm({
      qualification: t.qualification || "",
      joiningDate: t.joiningDate ? t.joiningDate.slice(0, 10) : "",
    });
    setEditId(t._id);
    setMode("edit");
    setMsg(null);
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch(`/api/teachers/${editId}`, { method: "PUT", body: JSON.stringify(editForm) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: "Teacher updated." });
      setMode(null); setEditId(null);
      loadTeachers();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this teacher profile?")) return;
    const res = await apiFetch(`/api/teachers/${id}`, { method: "DELETE" });
    if (res?.ok) { setTeachers((t) => t.filter((x) => x._id !== id)); setMsg({ ok: true, text: "Teacher profile deleted." }); }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-sub">{teachers.length} teacher{teachers.length !== 1 ? "s" : ""} on staff</p>
        </div>
        <button onClick={() => { setMode((m) => m === "new" ? null : "new"); setNewForm(EMPTY_NEW); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          {mode === "new" ? "Cancel" : "+ New Teacher"}
        </button>
      </div>

      {mode === "new" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Create Teacher Account</p>
          <form onSubmit={handleCreate} className="form-grid form-grid-2">
            <div><label className="form-label">Full Name</label><input value={newForm.name} onChange={setNew("name")} placeholder="Jordan Lee" required className="input" /></div>
            <div><label className="form-label">Email</label><input type="email" value={newForm.email} onChange={setNew("email")} placeholder="jordan@school.com" required className="input" /></div>
            <div><label className="form-label">Password</label><input type="password" value={newForm.password} onChange={setNew("password")} placeholder="••••••••" required className="input" /></div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Create Teacher"}
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "edit" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Edit Teacher Profile</p>
          <form onSubmit={handleEdit} className="form-grid form-grid-2">
            <div><label className="form-label">Qualification</label><input value={editForm.qualification} onChange={setEdit("qualification")} placeholder="e.g. M.Ed" className="input" /></div>
            <div><label className="form-label">Joining Date</label><input type="date" value={editForm.joiningDate} onChange={setEdit("joiningDate")} className="input" /></div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Update"}
              </button>
              <button type="button" onClick={() => { setMode(null); setEditId(null); }} className="btn btn-ghost" style={{ padding: "9px 16px" }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Qualification</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id}>
                <td style={{ fontWeight: 500 }}>{t.userId?.name || "—"}</td>
                <td className="td-muted">{t.userId?.email || "—"}</td>
                <td className="td-muted">{t.qualification || "—"}</td>
                <td className="td-muted">{t.joiningDate ? new Date(t.joiningDate).toLocaleDateString() : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(t)} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(t._id)} className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button>
                  </div>
                </td>
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
