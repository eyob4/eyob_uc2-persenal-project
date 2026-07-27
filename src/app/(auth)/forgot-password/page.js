"use client";

import { useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Something went wrong"); return; }
      setSent(true);
    } catch {
      setError("Cannot reach the app server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pub-page">
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div className="pub-logo" style={{ background: "var(--accent)" }}>S</div>
          <h1 className="pub-title">Reset your password</h1>
          <p className="pub-sub">We'll email you a link to reset it</p>
        </div>

        <div className="pub-card">
          {sent ? (
            <div className="alert alert-success">
              If that email is registered, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com" required className="input" />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: 4, padding: "10px" }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Sending…</> : "Send Reset Link"}
              </button>
            </form>
          )}

          <hr className="pub-divider" />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)" }}>
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
