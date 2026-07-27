"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/app/lib/api";

export default function MessagesPanel({ recipients, currentUserId }) {
  const [selected, setSelected] = useState(null);
  const [thread, setThread]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [text, setText]         = useState("");
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [thread]);

  async function selectRecipient(r) {
    setSelected(r); setLoading(true);
    const res  = await apiFetch(`/api/messages?with=${r.id}`);
    const json = await res?.json();
    if (res?.ok) setThread(json.data);
    setLoading(false);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    const res  = await apiFetch("/api/messages", { method: "POST", body: JSON.stringify({ receiverId: selected.id, content: text }) });
    const json = await res?.json();
    setSending(false);
    if (res?.ok) {
      setThread((prev) => [...prev, json.data]);
      setText("");
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-sub">Send and receive messages</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Contacts</p>
          {recipients.length === 0 && <p style={{ fontSize: 12, color: "var(--text-2)" }}>No contacts available yet.</p>}
          {recipients.map((r) => (
            <button key={r.id} onClick={() => selectRecipient(r)}
              style={{
                background: selected?.id === r.id ? "rgba(79,126,248,0.12)" : "var(--surface)",
                border: `1px solid ${selected?.id === r.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10, padding: "10px 12px", textAlign: "left", cursor: "pointer", transition: "all 0.12s",
              }}>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{r.name}</p>
              {r.sub && <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>{r.sub}</p>}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="card" style={{ display: "flex", flexDirection: "column", height: 480, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
              {selected.name}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {loading
                ? <p style={{ color: "var(--text-2)", fontSize: 13 }}>Loading…</p>
                : thread.length === 0
                ? <p style={{ color: "var(--text-2)", fontSize: 13 }}>No messages yet. Say hello!</p>
                : thread.map((m) => {
                    const senderId = m.senderId?._id || m.senderId;
                    const mine = senderId === currentUserId;
                    return (
                      <div key={m._id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                        <div style={{
                          background: mine ? "var(--accent)" : "var(--surface2)",
                          color: mine ? "#fff" : "var(--text)",
                          borderRadius: 12,
                          padding: "8px 12px",
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}>
                          {m.content}
                        </div>
                        <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3, textAlign: mine ? "right" : "left" }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </p>
                      </div>
                    );
                  })
              }
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--border)" }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="input" style={{ flex: 1 }} />
              <button type="submit" disabled={sending} className="btn btn-primary" style={{ padding: "8px 18px" }}>Send</button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
            <p style={{ color: "var(--text-2)", fontSize: 13 }}>← Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
