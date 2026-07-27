"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY_NEW  = { name: "", email: "", password: "" };
const EMPTY_EDIT = { phone: "", occupation: "" };

export default function AdminParentsPage() {
  const [parents, setParents]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newForm, setNewForm]   = useState(EMPTY_NEW);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);
  const [mode, setMode]         = useState(null);
  const [editId, setEditId]     = useState(null);

  useEffect(() => {
    loadParents();
  }, []);

  async function loadParents() {
    const res  = await apiFetch("/api/parents");
    const json = await res?.json();
    if (res?.ok) setParents(json.data);
    setLoading(false);
  }

  const setNew  = (k) => (e) => setNewForm((f) => ({ ...f, [k]: e.target.value }));
  const setEdit = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch("/api/users", { method: "POST", body: JSON.stringify({ ...newForm, role: "parent" }) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: `Parent account "${newForm.name}" created.` });
      setNewForm(EMPTY_NEW); setMode(null);
      loadParents();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  function startEdit(p) {
    setEditForm({ phone: p.phone || "", occupation: p.occupation || "" });
    setEditId(p._id);
    setMode("edit");
    setMsg(null);
  }

  async function handleEdit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch(`/api/parents/${editId}`, { method: "PUT", body: JSON.stringify(editForm) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: "Parent updated." });
      setMode(null); setEditId(null);
      loadParents();
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this parent profile?")) return;
    const res = await apiFetch(`/api/parents/${id}`, { method: "DELETE" });
    if (res?.ok) { setParents((p) => p.filter((x) => x._id !== id)); setMsg({ ok: true, text: "Parent profile deleted." }); }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Parents</h1>
          <p className="page-sub">{parents.length} parent{parents.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => { setMode((m) => m === "new" ? null : "new"); setNewForm(EMPTY_NEW); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          {mode === "new" ? "Cancel" : "+ New Parent"}
        </button>
      </div>

      {mode === "new" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Create Parent Account</p>
          <form onSubmit={handleCreate} className="form-grid form-grid-2">
            <div><label className="form-label">Full Name</label><input value={newForm.name} onChange={setNew("name")} placeholder="Alex Rivera" required className="input" /></div>
            <div><label className="form-label">Email</label><input type="email" value={newForm.email} onChange={setNew("email")} placeholder="alex@example.com" required className="input" /></div>
            <div><label className="form-label">Password</label><input type="password" value={newForm.password} onChange={setNew("password")} placeholder="••••••••" required className="input" /></div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Create Parent"}
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "edit" && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Edit Parent Profile</p>
          <form onSubmit={handleEdit} className="form-grid form-grid-2">
            <div><label className="form-label">Phone</label><input value={editForm.phone} onChange={setEdit("phone")} placeholder="e.g. 555-0100" className="input" /></div>
            <div><label className="form-label">Occupation</label><input value={editForm.occupation} onChange={setEdit("occupation")} placeholder="e.g. Engineer" className="input" /></div>
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
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Occupation</th><th>Children</th><th></th></tr></thead>
          <tbody>
            {parents.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 500 }}>{p.userId?.name || "—"}</td>
                <td className="td-muted">{p.userId?.email || "—"}</td>
                <td className="td-muted">{p.phone || "—"}</td>
                <td className="td-muted">{p.occupation || "—"}</td>
                <td className="td-muted">{p.children?.length || 0}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(p)} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button>
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
