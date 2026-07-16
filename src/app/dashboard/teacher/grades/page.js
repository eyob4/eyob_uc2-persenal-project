"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken } from "../../../lib/api";

export default function TeacherGradesPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ subject: "", term: "", score: "", note: "" });
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    apiFetch("/api/teacher/students").then(async (res) => {
      if (res?.ok) setStudents(await res.json());
      setLoading(false);
    });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await apiFetch(`/api/teacher/students/${selected._id}/grade`, {
      method: "PUT",
      body: JSON.stringify({ ...form, score: Number(form.score) }),
    });
    setSaving(false);
    if (res?.ok) {
      const updated = await res.json();
      setStudents((prev) => prev.map((s) => s._id === updated._id ? updated : s));
      setSelected(updated);
      setMsg({ ok: true, text: "Grade saved successfully." });
      setForm({ subject: "", term: "", score: "", note: "" });
    } else {
      setMsg({ ok: false, text: "Failed to save grade." });
    }
  }

  const scoreColor = (s) => s >= 80 ? "var(--green)" : s >= 60 ? "var(--yellow)" : "var(--red)";

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
            <button key={s._id} onClick={() => { setSelected(s); setMsg(null); }}
              style={{
                background: selected?._id === s._id ? "rgba(79,126,248,0.12)" : "var(--surface)",
                border: `1px solid ${selected?._id === s._id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10, padding: "10px 12px", textAlign: "left", cursor: "pointer", transition: "all 0.12s",
              }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{s.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>{s.gradeLevel} · {s.grades?.length ?? 0} grades</p>
            </button>
          ))}
        </div>

        {/* Right panel */}
        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Add grade form */}
            <div className="card">
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>Add Grade — {selected.name}</p>
              {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
              <form onSubmit={handleSubmit} className="form-grid form-grid-2">
                <div><label className="form-label">Subject</label><input value={form.subject} onChange={set("subject")} placeholder="e.g. Mathematics" required className="input" /></div>
                <div><label className="form-label">Term</label><input value={form.term} onChange={set("term")} placeholder="e.g. Term 1" required className="input" /></div>
                <div><label className="form-label">Score (0–100)</label><input type="number" min="0" max="100" value={form.score} onChange={set("score")} placeholder="85" required className="input" /></div>
                <div><label className="form-label">Note</label><input value={form.note} onChange={set("note")} placeholder="Optional comment" className="input" /></div>
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
                {selected.grades?.length === 0
                  ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No grades recorded yet.</p>
                  : <table>
                      <thead><tr><th>Subject</th><th>Term</th><th>Score</th><th>Note</th></tr></thead>
                      <tbody>
                        {selected.grades?.map((g, i) => (
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
