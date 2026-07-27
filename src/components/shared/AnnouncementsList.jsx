"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import AnnouncementCard from "@/components/shared/AnnouncementCard";

const EMPTY = { title: "", message: "", targetRole: "all" };

export default function AnnouncementsList({ canManage = false }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState(null);

  useEffect(() => {
    apiFetch("/api/announcements").then(async (res) => {
      const json = await res?.json();
      if (res?.ok) setItems(json.data);
      setLoading(false);
    });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await apiFetch("/api/announcements", { method: "POST", body: JSON.stringify(form) });
    const json = await res?.json();
    setSaving(false);
    if (res?.ok) {
      setItems((prev) => [json.data, ...prev]);
      setForm(EMPTY); setShowForm(false);
    } else {
      setMsg({ ok: false, text: json?.message || "Failed." });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this announcement?")) return;
    const res = await apiFetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res?.ok) setItems((prev) => prev.filter((a) => a._id !== id));
  }

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-sub">{items.length} announcement{items.length !== 1 ? "s" : ""}</p>
        </div>
        {canManage && (
          <button onClick={() => { setShowForm((v) => !v); setForm(EMPTY); setMsg(null); }} className="btn btn-primary" style={{ padding: "8px 16px" }}>
            {showForm ? "Cancel" : "+ New Announcement"}
          </button>
        )}
      </div>

      {canManage && showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 14, fontSize: 14 }}>Post Announcement</p>
          {msg && <div className="alert alert-error" style={{ marginBottom: 12 }}>{msg.text}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="form-label">Title</label>
              <input value={form.title} onChange={set("title")} placeholder="e.g. Midterm schedule released" required className="input" />
            </div>
            <div>
              <label className="form-label">Message</label>
              <textarea value={form.message} onChange={set("message")} required rows={3} className="input" style={{ resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div>
              <label className="form-label">Audience</label>
              <select value={form.targetRole} onChange={set("targetRole")} className="input">
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
                <option value="parents">Parents</option>
              </select>
            </div>
            <div>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "9px 20px" }}>
                {saving ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Posting…</> : "Post"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.length === 0
          ? <div className="card"><p style={{ color: "var(--text-2)", fontSize: 13 }}>No announcements yet.</p></div>
          : items.map((a) => <AnnouncementCard key={a._id} announcement={a} onDelete={canManage ? handleDelete : null} />)
        }
      </div>
    </div>
  );
}
