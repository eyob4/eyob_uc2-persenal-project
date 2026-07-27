"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY = { subjectId: "", examType: "", marksObtained: "", totalMarks: "", term: "", remarks: "" };

export default function TeacherGradesPage() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [grades, setGrades]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    Promise.all([apiFetch("/api/students"), apiFetch("/api/subjects")]).then(async ([sRes, subRes]) => {
      const sJson = await sRes?.json();
      const subJson = await subRes?.json();
      if (sRes?.ok) setStudents(sJson.data);
      if (subRes?.ok) setSubjects(subJson.data);
      setLoading(false);
    });
  }, []);

  async function selectStudent(s) {
    setSelected(s); setMsg(null); setGradesLoading(true);
    const res  = await apiFetch(`/api/grades?studentId=${s._id}`);
    const json = await res?.json();
    if (res?.ok) setGrades(json.data);
    setGradesLoading(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await apiFetch("/api/grades", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        studentId: selected._id,
        marksObtained: Number(form.marksObtained),
        totalMarks: Number(form.totalMarks),
      }),
    });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setGrades((prev) => [json.data, ...prev]);
      setMsg({ ok: true, text: "Grade saved successfully." });
      setForm(EMPTY);
    } else {
      setMsg({ ok: false, text: json?.message || "Failed to save grade." });
    }
  }

  const scoreColor = (marksObtained, totalMarks) => {
    const pct = totalMarks ? (marksObtained / totalMarks) * 100 : 0;
    return pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--yellow)" : "var(--red)";
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">Grades</h1>
        <p className="page-sub">Record and review student grades</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
        {/* Student list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Students</p>
          {students.map((s) => (
            <button key={s._id} onClick={() => selectStudent(s)}
              style={{
                background: selected?._id === s._id ? "rgba(79,126,248,0.12)" : "var(--surface)",
                border: `1px solid ${selected?._id === s._id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10, padding: "10px 12px", textAlign: "left", cursor: "pointer", transition: "all 0.12s",
              }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{s.userId?.name || "—"}</p>
              <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>{s.classId?.name || "No class"}</p>
            </button>
          ))}
        </div>

        {/* Right panel */}
        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Add grade form */}
            <div className="card">
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>Add Grade — {selected.userId?.name}</p>
              {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
              <form onSubmit={handleSubmit} className="form-grid form-grid-2">
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Subject</label>
                  <select value={form.subjectId} onChange={set("subjectId")} required className="input">
                    <option value="" disabled>Select a subject</option>
                    {subjects.map((sub) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Exam Type</label><input value={form.examType} onChange={set("examType")} placeholder="e.g. Midterm" className="input" /></div>
                <div><label className="form-label">Term</label><input value={form.term} onChange={set("term")} placeholder="e.g. Term 1" className="input" /></div>
                <div><label className="form-label">Marks Obtained</label><input type="number" min="0" value={form.marksObtained} onChange={set("marksObtained")} placeholder="85" required className="input" /></div>
                <div><label className="form-label">Total Marks</label><input type="number" min="0" value={form.totalMarks} onChange={set("totalMarks")} placeholder="100" required className="input" /></div>
                <div style={{ gridColumn: "1 / -1" }}><label className="form-label">Remarks</label><input value={form.remarks} onChange={set("remarks")} placeholder="Optional comment" className="input" /></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                    {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Save Grade"}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing grades */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Grade History</p>
              <div className="table-wrap">
                {gradesLoading
                  ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>Loading…</p>
                  : grades.length === 0
                  ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No grades recorded yet.</p>
                  : <table>
                      <thead><tr><th>Subject</th><th>Exam</th><th>Term</th><th>Marks</th><th>Remarks</th></tr></thead>
                      <tbody>
                        {grades.map((g) => (
                          <tr key={g._id}>
                            <td style={{ fontWeight: 500 }}>{g.subjectId?.name || "—"}</td>
                            <td className="td-muted">{g.examType || "—"}</td>
                            <td className="td-muted">{g.term || "—"}</td>
                            <td><span style={{ fontWeight: 700, color: scoreColor(g.marksObtained, g.totalMarks) }}>{g.marksObtained}/{g.totalMarks}</span></td>
                            <td className="td-muted">{g.remarks || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>← Select a student to manage grades</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
