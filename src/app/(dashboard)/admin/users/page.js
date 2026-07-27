"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const ROLE_COLOR = { admin: "#6366f1", teacher: "#8b5cf6", student: "#10b981", parent: "#f59e0b" };

const EMPTY = { name: "", email: "", password: "", role: "student" };

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(EMPTY);
  const [msg, setMsg]         = useState(null);
  const [saving, setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const res  = await apiFetch("/api/users");
    const json = await res?.json();
    if (res?.ok) setUsers(json.data);
    setLoading(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await apiFetch("/api/users", { method: "POST", body: JSON.stringify(form) });
    const data = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setMsg({ ok: true, text: `User "${form.name}" created.` });
      setForm(EMPTY);
      setShowForm(false);
      loadUsers();
    } else {
      setMsg({ ok: false, text: data?.message || "Failed to create user." });
    }
  }

  const counts = users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {});

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">Manage all system accounts</p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
          {showForm ? "Cancel" : "+ New User"}
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {["admin","teacher","student","parent"].map((r) => (
          <div key={r} className="stat-card">
            <div className="stat-value" style={{ color: ROLE_COLOR[r] }}>{counts[r] || 0}</div>
            <div className="stat-label">{r}s</div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Create New User</p>
          {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
          <form onSubmit={handleCreate} className="form-grid form-grid-2">
            <div>
              <label className="form-label">Full Name</label>
              <input value={form.name} onChange={set("name")} placeholder="John Doe" required className="input" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="user@school.com" required className="input" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required className="input" />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select value={form.role} onChange={set("role")} className="input">
                {["admin","teacher","student","parent"].map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {msg && !showForm && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Linked</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ fontWeight: 500 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: ROLE_COLOR[u.role] + "20", color: ROLE_COLOR[u.role], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="td-muted">{u.email}</td>
                <td>
                  <span className="badge" style={{ background: ROLE_COLOR[u.role] + "20", color: ROLE_COLOR[u.role] }}>{u.role}</span>
                </td>
                <td className="td-muted" style={{ fontSize: 12 }}>
                  {u.student ? `Roll #${u.student.rollNumber || "—"}` : u.children?.length ? `${u.children.length} child(ren)` : "—"}
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
