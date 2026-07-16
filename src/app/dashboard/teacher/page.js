"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../lib/api";

export default function TeacherDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab]           = useState("grades");
  const [grade, setGrade]       = useState({ subject: "", term: "", score: "", note: "" });
  const [att, setAtt]           = useState({ date: new Date().toISOString().slice(0, 10), status: "present" });
  const [msg, setMsg]           = useState(null);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    apiFetch("/api/teacher/students").then(async (res) => {
      if (res?.ok) setStudents(await res.json());
      setLoading(false);
    });
  }, []);

  async function submitGrade(e) {
    e.preventDefault();
    const res = await apiFetch(`/api/teacher/students/${selected._id}/grade`, { method: "PUT", body: JSON.stringify({ ...grade, score: Number(grade.score) }) });
    setMsg(res?.ok ? { ok: true, text: "Grade saved." } : { ok: false, text: "Failed to save grade." });
    if (res?.ok) setGrade({ subject: "", term: "", score: "", note: "" });
  }

  async function submitAtt(e) {
    e.preventDefault();
    const res = await apiFetch(`/api/teacher/students/${selected._id}/attendance`, { method: "PUT", body: JSON.stringify(att) });
    setMsg(res?.ok ? { ok: true, text: "Attendance recorded." } : { ok: false, text: "Failed." });
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-header">
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="page-sub">Select a student to record grades or attendance</p>
      </div>

      {/* Student picker */}
      <div className="picker-grid">
        {students.map((s) => (
          <button key={s._id} onClick={() => { setSelected(s); setMsg(null); }}
            className={`picker-card ${selected?._id === s._id ? "selected" : ""}`}>
            <div className="picker-avatar" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
              {s.name.charAt(0).toUpperCase()}
            </div>
            <div className="picker-name">{s.name}</div>
            <div className="picker-sub">{s.gradeLevel}</div>
          </button>
        ))}
      </div>

      {/* Action panel */}
      {selected && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontWeight: 600, color: "var(--text)" }}>{selected.name}</p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{selected.gradeLevel}</p>
            </div>
            <div className="tabs">
              {["grades","attendance"].map((t) => (
                <button key={t} onClick={() => { setTab(t); setMsg(null); }} className={`tab ${tab === t ? "active" : ""}`}>{t}</button>
              ))}
            </div>
          </div>

          {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 14 }}>{msg.text}</div>}

          {tab === "grades" && (
            <form onSubmit={submitGrade} className="form-grid form-grid-2">
              <div><label className="form-label">Subject</label><input placeholder="e.g. Math" value={grade.subject} onChange={(e) => setGrade(g => ({...g, subject: e.target.value}))} required className="input" /></div>
              <div><label className="form-label">Term</label><input placeholder="e.g. Term 1" value={grade.term} onChange={(e) => setGrade(g => ({...g, term: e.target.value}))} required className="input" /></div>
              <div><label className="form-label">Score</label><input type="number" min="0" max="100" placeholder="0–100" value={grade.score} onChange={(e) => setGrade(g => ({...g, score: e.target.value}))} required className="input" /></div>
              <div><label className="form-label">Note</label><input placeholder="Optional" value={grade.note} onChange={(e) => setGrade(g => ({...g, note: e.target.value}))} className="input" /></div>
              <div style={{ gridColumn: "1 / -1" }}><button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>Save Grade</button></div>
            </form>
          )}

          {tab === "attendance" && (
            <form onSubmit={submitAtt} className="form-grid form-grid-2">
              <div><label className="form-label">Date</label><input type="date" value={att.date} onChange={(e) => setAtt(a => ({...a, date: e.target.value}))} required className="input" /></div>
              <div>
                <label className="form-label">Status</label>
                <select value={att.status} onChange={(e) => setAtt(a => ({...a, status: e.target.value}))} className="input">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}><button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>Record Attendance</button></div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
