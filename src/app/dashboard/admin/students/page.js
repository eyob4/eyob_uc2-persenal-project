"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../../lib/api";

const EMPTY = { name: "", gradeLevel: "" };

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY);
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    loadStudents();
  }, []);

  async function loadStudents() {
    const res = await apiFetch("/api/admin/students");
    if (res?.ok) setStudents(await res.json());
    setLoading(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const url    = editId ? `/api/admin/students/${editId}` : "/api/admin/students";
    const method = editId ? "PUT" : "POST";
    const res    = await apiFetch(url, { method, body: JSON.stringify(form) });
    const data   = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: editId ? "Student updated." : `Student "${form.name}" created.` });
      setForm(EMPTY); setShowForm(false); setEditId(null);
      loadStudents();
    } else {
      setMsg({ ok: false, text: data?.message || "Failed." });
    }
  }

  function startEdit(s) {
    setForm({ name: s.name, gradeLevel: s.gradeLevel });
    setEditId(s._id);
    setShowForm(true);
    setMsg(null);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this student?")) return;
    const res = await apiFetch(`/api/admin/students/${id}`, { method: "DELETE" });
    if (res?.ok) { setStudents((s) => s.filter((x) => x._id !== id)); setMsg({ ok: true, text: "Student deleted." }); }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-sub">{students.length} student{students.length !== 1 ? "s" : ""} enrolled</p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setEditId(null); setForm(EMPTY); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          {showForm ? "Cancel" : "+ New Student"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>
            {editId ? "Edit Student" : "Create New Student"}
          </p>
          <form onSubmit={handleSubmit} className="form-grid form-grid-2">
            <div>
              <label className="form-label">Full Name</label>
              <input value={form.name} onChange={set("name")} placeholder="Jane Smith" required className="input" />
            </div>
            <div>
              <label className="form-label">Grade Level</label>
              <input value={form.gradeLevel} onChange={set("gradeLevel")} placeholder="e.g. Grade 10" required className="input" />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : editId ? "Update" : "Create Student"}
              </button>
              {editId && <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }} className="btn btn-ghost" style={{ padding: "9px 16px" }}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Grade</th><th>Parent</th><th>Grades</th><th>Attendance</th><th></th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 500 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    {s.name}
                  </div>
                </td>
                <td><span className="badge badge-blue">{s.gradeLevel}</span></td>
                <td className="td-muted">{s.parent?.name || "—"}</td>
                <td className="td-muted">{s.grades?.length ?? 0}</td>
                <td className="td-muted">{s.attendance?.length ?? 0}</td>
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
