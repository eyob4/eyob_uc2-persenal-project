"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function StudentDashboard() {
  const [profile, setProfile]   = useState(null);
  const [grades, setGrades]     = useState([]);
  const [tab, setTab]           = useState("profile");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/api/students"), apiFetch("/api/grades")])
      .then(async ([pRes, gRes]) => {
        const pJson = await pRes?.json();
        const gJson = await gRes?.json();
        if (pRes?.ok) setProfile(pJson.data[0] || null);
        if (gRes?.ok) setGrades(gJson.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  if (!profile) return <div className="alert alert-error">Profile not found. Ask your admin to complete your student profile.</div>;

  const avgPct = grades.length
    ? Math.round(grades.reduce((s, g) => s + (g.marksObtained / g.totalMarks) * 100, 0) / grades.length)
    : null;
  const scoreColor = (pct) => pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--yellow)" : "var(--red)";

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Profile header */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(16,185,129,0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
          {profile.userId?.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{profile.userId?.name}</p>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{profile.userId?.email}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          {profile.classId && <span className="badge badge-green">{profile.classId.name}</span>}
          {avgPct !== null && <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6 }}>Avg: <strong style={{ color: scoreColor(avgPct) }}>{avgPct}%</strong></p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {["profile","grades"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? "active" : ""}`}>{t}</button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {[
            ["Full name", profile.userId?.name || "—"],
            ["Roll number", profile.rollNumber || "—"],
            ["Class", profile.classId?.name || "—"],
            ["Email", profile.userId?.email || "—"],
            ["Parent", profile.parentId?.userId?.name || "—"],
          ].map(([k, v]) => (
            <div key={k} className="profile-row" style={{ padding: "12px 20px" }}>
              <span className="profile-key">{k}</span>
              <span className="profile-value">{v}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "grades" && (
        <div className="table-wrap">
          {grades.length === 0
            ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No grades recorded yet.</p>
            : <table>
                <thead><tr><th>Subject</th><th>Exam</th><th>Term</th><th>Marks</th><th>Remarks</th></tr></thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g._id}>
                      <td style={{ fontWeight: 500 }}>{g.subjectId?.name || "—"}</td>
                      <td className="td-muted">{g.examType || "—"}</td>
                      <td className="td-muted">{g.term || "—"}</td>
                      <td><span style={{ fontWeight: 700, color: scoreColor((g.marksObtained / g.totalMarks) * 100) }}>{g.marksObtained}/{g.totalMarks}</span></td>
                      <td className="td-muted">{g.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
