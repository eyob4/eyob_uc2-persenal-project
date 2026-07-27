"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const EMPTY = { amount: "", dueDate: "", status: "unpaid", receiptNo: "" };

export default function AdminFeesPage() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [fees, setFees]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [feesLoading, setFeesLoading] = useState(false);
  const [form, setForm]         = useState(EMPTY);
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
    setSelected(s); setMsg(null); setFeesLoading(true);
    const res  = await apiFetch(`/api/fees?studentId=${s._id}`);
    const json = await res?.json();
    if (res?.ok) setFees(json.data);
    setFeesLoading(false);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch("/api/fees", {
      method: "POST",
      body: JSON.stringify({ ...form, studentId: selected._id, amount: Number(form.amount) }),
    });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setFees((prev) => [json.data, ...prev]);
      setMsg({ ok: true, text: "Fee created." });
      setForm(EMPTY);
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  async function markPaid(fee) {
    const res  = await apiFetch(`/api/fees/${fee._id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "paid", paymentDate: new Date().toISOString().slice(0, 10) }),
    });
    const json = await res?.json();
    if (res?.ok) setFees((prev) => prev.map((f) => (f._id === fee._id ? json.data : f)));
  }

  const statusBadge = (s) => s === "paid" ? "badge-green" : s === "overdue" ? "badge-red" : "badge-yellow";

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">Fees</h1>
        <p className="page-sub">Manage student fee records</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
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

        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>New Fee — {selected.userId?.name}</p>
              {msg && <div className={`alert ${msg.ok ? "alert-success" : "alert-error"}`} style={{ marginBottom: 12 }}>{msg.text}</div>}
              <form onSubmit={handleSubmit} className="form-grid form-grid-2">
                <div><label className="form-label">Amount</label><input type="number" min="0" value={form.amount} onChange={set("amount")} placeholder="500" required className="input" /></div>
                <div><label className="form-label">Due Date</label><input type="date" value={form.dueDate} onChange={set("dueDate")} required className="input" /></div>
                <div>
                  <label className="form-label">Status</label>
                  <select value={form.status} onChange={set("status")} className="input">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div><label className="form-label">Receipt No.</label><input value={form.receiptNo} onChange={set("receiptNo")} placeholder="Optional" className="input" /></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                    {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Create Fee"}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Fee History</p>
              <div className="table-wrap">
                {feesLoading
                  ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>Loading…</p>
                  : fees.length === 0
                  ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No fee records yet.</p>
                  : <table>
                      <thead><tr><th>Amount</th><th>Due Date</th><th>Status</th><th>Receipt</th><th></th></tr></thead>
                      <tbody>
                        {fees.map((f) => (
                          <tr key={f._id}>
                            <td style={{ fontWeight: 600 }}>${f.amount}</td>
                            <td className="td-muted">{new Date(f.dueDate).toLocaleDateString()}</td>
                            <td><span className={`badge ${statusBadge(f.status)}`}>{f.status}</span></td>
                            <td className="td-muted">{f.receiptNo || "—"}</td>
                            <td>
                              {f.status !== "paid" && (
                                <button onClick={() => markPaid(f)} className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }}>Mark Paid</button>
                              )}
                            </td>
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
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>← Select a student to manage fees</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
}
