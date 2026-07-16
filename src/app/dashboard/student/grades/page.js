"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../../lib/api";

export default function StudentGradesPage() {
  const router = useRouter();
  const [grades, setGrades]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    apiFetch("/api/student/grades").then(async (res) => {
      if (res?.ok) setGrades((await res.json()).grades || []);
      setLoading(false);
    });
  }, []);

  const scoreColor = (s) => s >= 80 ? "var(--green)" : s >= 60 ? "var(--yellow)" : "var(--red)";
  const avg = grades.length ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : null;

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">My Grades</h1>
          <p className="page-sub">{grades.length} grade{grades.length !== 1 ? "s" : ""} recorded</p>
        </div>
        {avg !== null && (
          <div className="stat-card" style={{ textAlign: "center", minWidth: 100 }}>
            <div className="stat-value" style={{ color: scoreColor(avg) }}>{avg}</div>
            <div className="stat-label">Average</div>
          </div>
        )}
      </div>

      <div className="table-wrap">
        {grades.length === 0
          ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No grades recorded yet.</p>
          : <table>
              <thead><tr><th>Subject</th><th>Term</th><th>Score</th><th>Note</th></tr></thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{g.subject}</td>
                    <td className="td-muted">{g.term}</td>
                    <td><span style={{ fontWeight: 700, fontSize: 15, color: scoreColor(g.score) }}>{g.score}</span></td>
                    <td className="td-muted">{g.note || "—"}</td>
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
