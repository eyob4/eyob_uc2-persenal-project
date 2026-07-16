"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }
      router.push("/login");
    } catch {
      setError("Cannot reach server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pub-page">
      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 16 }}>

        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div className="pub-logo" style={{ background: "var(--accent)" }}>S</div>
          <h1 className="pub-title">Create account</h1>
          <p className="pub-sub">Join SchoolMS as admin, teacher, student, or parent</p>
        </div>

        <div className="pub-card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { key: "name",     label: "Full Name", type: "text",     placeholder: "John Doe" },
              { key: "email",    label: "Email",     type: "email",    placeholder: "you@school.com" },
              { key: "password", label: "Password",  type: "password", placeholder: "••••••••" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required className="input" />
              </div>
            ))}

            <div>
              <label className="form-label">Role</label>
              <select value={form.role} onChange={set("role")} className="input">
                {["admin","teacher","student","parent"].map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: 4, padding: "10px" }}>
              {loading ? <><span className="spinner" style={{ borderTopColor: "#fff" }} /> Creating…</> : "Create Account"}
            </button>
          </form>

          <hr className="pub-divider" />
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
