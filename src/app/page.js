import Link from "next/link";
import { ShieldIcon, ChartIcon, MessageIcon, CalendarIcon } from "@/components/ui/Icons";

const features = [
  { Icon: ShieldIcon, color: "#4f7ef8", title: "Role-based access", desc: "Admin, teacher, student, and parent views with tailored permissions." },
  { Icon: ChartIcon, color: "#10b981", title: "Grades & attendance", desc: "Track progress in real time with grade entries and attendance logs." },
  { Icon: MessageIcon, color: "#8b5cf6", title: "Communication", desc: "Teachers and parents can send contextual messages to stay aligned." },
  { Icon: CalendarIcon, color: "#f59e0b", title: "Announcements", desc: "Keep everyone in the loop with role-targeted school announcements." },
];

const roles = [
  { role: "Admin",   color: "#6366f1", desc: "Manage users, students, classes, and all system data." },
  { role: "Teacher", color: "#8b5cf6", desc: "Record grades, attendance, and message parents." },
  { role: "Student", color: "#10b981", desc: "View grades, announcements, and class updates." },
  { role: "Parent",  color: "#f59e0b", desc: "Monitor your child's progress, fees, and attendance." },
];

export default function Home() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "72px 24px 56px", overflow: "hidden" }}>
        <div className="hero-glow" />
        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 48, gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span style={{ display: "inline-flex", alignItems: "center", background: "var(--accent-dim)", color: "var(--accent-h)", border: "1px solid rgba(79,126,248,0.3)", borderRadius: 999, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", width: "fit-content" }}>
              STUDENT MANAGEMENT SYSTEM
            </span>
            <h1 style={{ fontSize: 44, fontWeight: 800, color: "var(--text)", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Manage your school<br />
              <span style={{ color: "var(--accent)" }}>smarter, faster.</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, maxWidth: 440 }}>
              A unified platform for admins, teachers, students, and parents. Track grades, attendance, fees, and communication — all in one place.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/login"    className="btn btn-primary" style={{ padding: "10px 22px", fontSize: 14 }}>Get Started →</Link>
              <Link href="/register" className="btn btn-ghost"   style={{ padding: "10px 22px", fontSize: 14 }}>Create Account</Link>
            </div>
            <div style={{ display: "flex", gap: 28, paddingTop: 4 }}>
              {[["4","Roles"],["REST","API"],["JWT","Auth"],["Live","Demo"]].map(([v,l]) => (
                <div key={l}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{v}</p>
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {features.map((f) => (
              <div key={f.title} className="card feature-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="feature-icon" style={{ background: f.color + "18", color: f.color }}>
                  <f.Icon size={20} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{f.title}</p>
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section style={{ borderTop: "1px solid var(--border)", maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Who uses SchoolMS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {roles.map((r) => (
            <div key={r.role} className="card feature-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ background: r.color + "20", color: r.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, width: "fit-content" }}>{r.role}</span>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{r.desc}</p>
              <Link href="/login" style={{ color: r.color, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Sign in →</Link>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
