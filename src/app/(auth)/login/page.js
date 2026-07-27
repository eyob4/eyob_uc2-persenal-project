"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const DESTINATIONS = { admin: "/admin", teacher: "/teacher", student: "/student", parent: "/parent" };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Login failed"); return; }
      router.push(DESTINATIONS[json.data.user.role] || "/login");
    } catch {
      setError("Cannot reach the app server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pub-page">
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div className="pub-logo" style={{ background: "var(--accent)" }}>S</div>
          <h1 className="pub-title">Welcome back</h1>
          <p className="pub-sub">Sign in to your SchoolMS account</p>
        </div>

        {/* Form card */}
        <div className="pub-card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com" required className="input" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required className="input" />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: 4, padding: "10px" }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <hr className="pub-divider" />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>Register</Link>
          </p>
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-2)", marginTop: 6 }}>
            <Link href="/forgot-password" style={{ color: "var(--text-2)" }}>Forgot your password?</Link>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Demo accounts</p>
          {[["admin@sms.com","admin123"],["teacher@sms.com","teacher123"],["student@sms.com","student123"],["parent@sms.com","parent123"]].map(([e,p]) => (
            <div key={e} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-2)", padding: "2px 0" }}>
              <span>{e}</span><span style={{ color: "var(--text-3)" }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
