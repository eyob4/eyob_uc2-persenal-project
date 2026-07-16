"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../lib/api";

const ROLE_COLOR = { admin: "#6366f1", teacher: "#8b5cf6", student: "#10b981", parent: "#f59e0b" };

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers]       = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    Promise.all([apiFetch("/api/admin/users"), apiFetch("/api/admin/students")]).then(async ([uRes, sRes]) => {
      if (uRes?.ok) setUsers(await uRes.json()); else setError("Failed to load data");
      if (sRes?.ok) setStudents(await sRes.json());
      setLoading(false);
    });
  }, []);

  async function deleteStudent(id) {
    if (!confirm("Delete this student?")) return;
    const res = await apiFetch(`/api/admin/students/${id}`, { method: "DELETE" });
    if (res?.ok) setStudents((s) => s.filter((x) => x._id !== id));
  }

  const counts = users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {});

  if (loading) return <Spinner />;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">System overview and user management</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {["admin","teacher","student","parent"].map((r) => (
          <div key={r} className="stat-card">
            <div className="stat-value" style={{ color: ROLE_COLOR[r] }}>{counts[r] || 0}</div>
            <div className="stat-label">{r}s</div>
          </div>
        ))}
      </div>

      {/* Users */}
      <div className="section">
        <p className="section-title">All Users</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td className="td-muted">{u.email}</td>
                  <td>
                    <span className="badge" style={{ background: ROLE_COLOR[u.role] + "20", color: ROLE_COLOR[u.role] }}>{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students */}
      <div className="section">
        <p className="section-title">Students</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Grade</th><th>Parent</th><th></th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td><span className="badge badge-blue">{s.gradeLevel}</span></td>
                  <td className="td-muted">{s.parent?.name || "—"}</td>
                  <td><button onClick={() => deleteStudent(s._id)} className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
