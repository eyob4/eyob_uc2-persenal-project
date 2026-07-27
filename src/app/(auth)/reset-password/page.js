"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.message || "Something went wrong"); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
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
          <h1 className="pub-title">Set a new password</h1>
          <p className="pub-sub">Choose a new password for your account</p>
        </div>

        <div className="pub-card">
          {!token ? (
            <div className="alert alert-error">Missing or invalid reset link.</div>
          ) : done ? (
            <div className="alert alert-success">Password updated. Redirecting to sign in…</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required className="input" />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: 4, padding: "10px" }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Saving…</> : "Update Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
