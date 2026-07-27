"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function ParentFeesPage() {
  const [fees, setFees]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/fees").then(async (res) => {
      const json = await res?.json();
      if (res?.ok) setFees(json.data);
      setLoading(false);
    });
  }, []);

  const statusBadge = (s) => s === "paid" ? "badge-green" : s === "overdue" ? "badge-red" : "badge-yellow";
  const outstanding = fees.filter((f) => f.status !== "paid").reduce((sum, f) => sum + f.amount, 0);

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Fees</h1>
          <p className="page-sub">{fees.length} record{fees.length !== 1 ? "s" : ""} across your children</p>
        </div>
        {outstanding > 0 && (
          <div className="stat-card" style={{ textAlign: "center", minWidth: 120 }}>
            <div className="stat-value" style={{ color: "var(--red)" }}>${outstanding}</div>
            <div className="stat-label">Outstanding</div>
          </div>
        )}
      </div>

      <div className="table-wrap">
        {fees.length === 0
          ? <p style={{ padding: 20, color: "var(--text-2)", fontSize: 13 }}>No fee records yet.</p>
          : <table>
              <thead><tr><th>Student</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Receipt</th></tr></thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f._id}>
                    <td style={{ fontWeight: 500 }}>{f.studentId?.userId?.name || "—"}</td>
                    <td style={{ fontWeight: 600 }}>${f.amount}</td>
                    <td className="td-muted">{new Date(f.dueDate).toLocaleDateString()}</td>
                    <td><span className={`badge ${statusBadge(f.status)}`}>{f.status}</span></td>
                    <td className="td-muted">{f.receiptNo || "—"}</td>
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
