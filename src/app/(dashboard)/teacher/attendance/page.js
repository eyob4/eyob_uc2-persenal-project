"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [form, setForm]         = useState({ date: new Date().toISOString().slice(0, 10), status: "present" });
  const [msg, setMsg]           = useState(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    apiFetch("/api/students").then(async (res) => {
      const json = await res?.json();
      if (res?.ok) setStudents(json.data);
      setLoading(false);
    });
  }, []);

  async function selectStudent(s) {
    setSelected(s); setMsg(null); setRecordsLoading(true);
    const res  = await apiFetch(`/api/attendance?studentId=${s._id}`);
    const json = await res?.json();
    if (res?.ok) setRecords(json.data);
    setRecordsLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await apiFetch("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ studentId: selected._id, classId: selected.classId?._id, ...form }),
    });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setRecords((prev) => [json.data, ...prev]);
      setMsg({ ok: true, text: "Attendance recorded." });
    } else {
      setMsg({ ok: false, text: json?.message || "Failed to record attendance." });
    }
  }

  const statusBadge = (s) => s === "present" ? "badge-green" : s === "absent" ? "badge-red" : "badge-yellow";

  const summary = (recs = []) => ({
    present: recs.filter((r) => r.status === "present").length,
    absent:  recs.filter((r) => r.status === "absent").length,
    late:    recs.filter((r) => r.status === "late").length,
  });

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-sub">Mark and review student attendance</p>
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
            {/* Summary stats */}
            {(() => { const sum = summary(records); return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[["Present", sum.present, "var(--green)"], ["Absent", sum.absent, "var(--red)"], ["Late", sum.late, "var(--yellow)"]].map(([l, n, c]) => (
                  <div key={l} className="stat-card" style={{ textAlign: "center" }}>
                    <div className="stat-value" style={{ color: c }}>{n}</div>
                    <div className="stat-label">{l}</div>
                  </div>
                ))}
              </div>
            ); })()}

            {/* Mark attendance form */}
            <div className="card">
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>Mark Attendance — {selected.userId?.name}</p>
              {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
              <form onSubmit={handleSubmit} className="form-grid form-grid-2">
                <div>
                  <label className="form-label">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required className="input" />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="input">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                    {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Record Attendance"}
                  </button>
                </div>
              </form>
            </div>

            {/* History */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Attendance History</p>
              <div className="table-wrap">
                {recordsLoading
                  ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>Loading…</p>
                  : !records.length
                  ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No records yet.</p>
                  : <table>
                      <thead><tr><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {[...records].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r) => (
                          <tr key={r._id}>
                            <td className="td-muted">{new Date(r.date).toLocaleDateString()}</td>
                            <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
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
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>← Select a student to manage attendance</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
