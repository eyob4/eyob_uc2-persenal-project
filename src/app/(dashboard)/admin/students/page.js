"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY_NEW  = { name: "", email: "", password: "" };
const EMPTY_EDIT = { rollNumber: "", classId: "", parentId: "", dateOfBirth: "", gender: "", address: "", admissionDate: "" };

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [parents, setParents]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newForm, setNewForm]   = useState(EMPTY_NEW);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);
  const [mode, setMode]         = useState(null); // null | "new" | "edit"
  const [editId, setEditId]     = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [sRes, cRes, pRes] = await Promise.all([apiFetch("/api/students"), apiFetch("/api/classes"), apiFetch("/api/parents")]);
    const sJson = await sRes?.json();
    const cJson = await cRes?.json();
    const pJson = await pRes?.json();
    if (sRes?.ok) setStudents(sJson.data);
    if (cRes?.ok) setClasses(cJson.data);
    if (pRes?.ok) setParents(pJson.data);
    setLoading(false);
  }

  const setNew  = (k) => (e) => setNewForm((f) => ({ ...f, [k]: e.target.value }));
  const setEdit = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch("/api/users", { method: "POST", body: JSON.stringify({ ...newForm, role: "student" }) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: `Student account "${newForm.name}" created.` });
      setNewForm(EMPTY_NEW); setMode(null);
      loadAll();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  function startEdit(s) {
    setEditForm({
      rollNumber: s.rollNumber || "",
      classId: s.classId?._id || "",
      parentId: s.parentId?._id || "",
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : "",
      gender: s.gender || "",
      address: s.address || "",
      admissionDate: s.admissionDate ? s.admissionDate.slice(0, 10) : "",
    });
    setEditId(s._id);
    setMode("edit");
    setMsg(null);
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch(`/api/students/${editId}`, { method: "PUT", body: JSON.stringify(editForm) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: "Student updated." });
      setMode(null); setEditId(null);
      loadAll();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this student profile?")) return;
    const res = await apiFetch(`/api/students/${id}`, { method: "DELETE" });
    if (res?.ok) { setStudents((s) => s.filter((x) => x._id !== id)); setMsg({ ok: true, text: "Student profile deleted." }); }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-sub">{students.length} student{students.length !== 1 ? "s" : ""} enrolled</p>
        </div>
        <button onClick={() => { setMode((m) => m === "new" ? null : "new"); setNewForm(EMPTY_NEW); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          {mode === "new" ? "Cancel" : "+ New Student"}
        </button>
      </div>

      {mode === "new" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Create Student Account</p>
          <form onSubmit={handleCreate} className="form-grid form-grid-2">
            <div>
              <label className="form-label">Full Name</label>
              <input value={newForm.name} onChange={setNew("name")} placeholder="Jane Smith" required className="input" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={newForm.email} onChange={setNew("email")} placeholder="jane@school.com" required className="input" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" value={newForm.password} onChange={setNew("password")} placeholder="••••••••" required className="input" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Create Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "edit" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Edit Student Profile</p>
          <form onSubmit={handleEdit} className="form-grid form-grid-2">
            <div>
              <label className="form-label">Roll Number</label>
              <input value={editForm.rollNumber} onChange={setEdit("rollNumber")} placeholder="e.g. 2026-014" className="input" />
            </div>
            <div>
              <label className="form-label">Class</label>
              <select value={editForm.classId} onChange={setEdit("classId")} className="input">
                <option value="">— None —</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Parent</label>
              <select value={editForm.parentId} onChange={setEdit("parentId")} className="input">
                <option value="">— None —</option>
                {parents.map((p) => <option key={p._id} value={p._id}>{p.userId?.name || p._id}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input type="date" value={editForm.dateOfBirth} onChange={setEdit("dateOfBirth")} className="input" />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select value={editForm.gender} onChange={setEdit("gender")} className="input">
                <option value="">— None —</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Address</label>
              <input value={editForm.address} onChange={setEdit("address")} className="input" />
            </div>
            <div>
              <label className="form-label">Admission Date</label>
              <input type="date" value={editForm.admissionDate} onChange={setEdit("admissionDate")} className="input" />
            </div>
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
          <thead>
            <tr><th>Name</th><th>Roll #</th><th>Class</th><th>Parent</th><th></th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 500 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {s.userId?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    {s.userId?.name || "—"}
                  </div>
                </td>
                <td className="td-muted">{s.rollNumber || "—"}</td>
                <td>{s.classId ? <span className="badge badge-blue">{s.classId.name}</span> : "—"}</td>
                <td className="td-muted">{s.parentId?.userId?.name || "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(s)} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button>
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
