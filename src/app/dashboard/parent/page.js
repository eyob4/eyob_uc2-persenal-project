"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../lib/api";

export default function ParentDashboard() {
  const router = useRouter();
  const [children, setChildren]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [tab, setTab]                 = useState("grades");
  const [grades, setGrades]           = useState([]);
  const [attendance, setAttendance]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [detailLoading, setDetail]    = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    apiFetch("/api/parent/children").then(async (res) => {
      if (res?.ok) setChildren((await res.json()).children || []);
      setLoading(false);
    });
  }, []);

  async function selectChild(child) {
    setSelected(child); setDetail(true);
    const [gRes, aRes] = await Promise.all([
      apiFetch(`/api/parent/children/${child._id}/grades`),
      apiFetch(`/api/parent/children/${child._id}/attendance`),
    ]);
    if (gRes?.ok) setGrades((await gRes.json()).grades || []);
    if (aRes?.ok) setAttendance((await aRes.json()).attendance || []);
    setDetail(false);
  }

  const scoreColor = (s) => s >= 80 ? "var(--green)" : s >= 60 ? "var(--yellow)" : "var(--red)";
  const present = attendance.filter((a) => a.status === "present").length;
  const absent  = attendance.filter((a) => a.status === "absent").length;
  const late    = attendance.filter((a) => a.status === "late").length;

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-header">
        <h1 className="page-title">Parent Dashboard</h1>
        <p className="page-sub">Monitor your children's academic progress</p>
      </div>

      {children.length === 0 ? (
        <div className="card"><p style={{ color: "var(--text-2)", fontSize: 13 }}>No children linked to your account. Contact the admin.</p></div>
      ) : (
        <div className="picker-grid">
          {children.map((c) => (
            <button key={c._id} onClick={() => selectChild(c)}
              className={`picker-card ${selected?._id === c._id ? "selected" : ""}`}>
              <div className="picker-avatar" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="picker-name">{c.name}</div>
              <div className="picker-sub">{c.gradeLevel}</div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontWeight: 600, color: "var(--text)" }}>{selected.name}</p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{selected.gradeLevel}</p>
            </div>
            <div className="tabs">
              {["grades","attendance"].map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? "active" : ""}`}>{t}</button>
              ))}
            </div>
          </div>

          {detailLoading && <Spinner />}

          {!detailLoading && tab === "attendance" && attendance.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
              {[["Present", present, "badge-green"], ["Absent", absent, "badge-red"], ["Late", late, "badge-yellow"]].map(([l, n, cls]) => (
                <div key={l} className="stat-card" style={{ textAlign: "center", padding: "14px" }}>
                  <div className="stat-value" style={{ fontSize: 22 }}>{n}</div>
                  <span className={`badge ${cls}`} style={{ marginTop: 6 }}>{l}</span>
                </div>
              ))}
            </div>
          )}

          {!detailLoading && tab === "grades" && (
            <div className="table-wrap">
              {grades.length === 0
                ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No grades yet.</p>
                : <table>
                    <thead><tr><th>Subject</th><th>Term</th><th>Score</th><th>Note</th></tr></thead>
                    <tbody>
                      {grades.map((g, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{g.subject}</td>
                          <td className="td-muted">{g.term}</td>
                          <td><span style={{ fontWeight: 700, color: scoreColor(g.score) }}>{g.score}</span></td>
                          <td className="td-muted">{g.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          )}

          {!detailLoading && tab === "attendance" && (
            <div className="table-wrap">
              {attendance.length === 0
                ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No attendance records yet.</p>
                : <table>
                    <thead><tr><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {attendance.map((a, i) => (
                        <tr key={i}>
                          <td className="td-muted">{new Date(a.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${a.status === "present" ? "badge-green" : a.status === "absent" ? "badge-red" : "badge-yellow"}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
