"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function StudentGradesPage() {
  const [grades, setGrades]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/grades").then(async (res) => {
      const json = await res?.json();
      if (res?.ok) setGrades(json.data);
      setLoading(false);
    });
  }, []);

  const scoreColor = (pct) => pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--yellow)" : "var(--red)";
  const avgPct = grades.length
    ? Math.round(grades.reduce((s, g) => s + (g.marksObtained / g.totalMarks) * 100, 0) / grades.length)
    : null;

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">My Grades</h1>
          <p className="page-sub">{grades.length} grade{grades.length !== 1 ? "s" : ""} recorded</p>
        </div>
        {avgPct !== null && (
          <div className="stat-card" style={{ textAlign: "center", minWidth: 100 }}>
            <div className="stat-value" style={{ color: scoreColor(avgPct) }}>{avgPct}%</div>
            <div className="stat-label">Average</div>
          </div>
        )}
      </div>

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
                    <td><span style={{ fontWeight: 700, fontSize: 15, color: scoreColor((g.marksObtained / g.totalMarks) * 100) }}>{g.marksObtained}/{g.totalMarks}</span></td>
                    <td className="td-muted">{g.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
