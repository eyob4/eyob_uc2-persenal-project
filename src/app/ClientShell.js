"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientShell({ children }) {
  const pathname   = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && (
        <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <span style={{ width: 30, height: 30, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>S</span>
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>SchoolMS</span>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[{ href: "/", label: "Home" }, { href: "/dashboard", label: "Dashboard" }].map((l) => (
                <Link key={l.href} href={l.href}
                  style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-2)", textDecoration: "none", transition: "all 0.12s" }}
                  onMouseEnter={(e) => { e.target.style.background = "var(--surface2)"; e.target.style.color = "var(--text)"; }}
                  onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "var(--text-2)"; }}>
                  {l.label}
                </Link>
              ))}
              <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                <Link href="/login"    className="btn btn-ghost"   style={{ padding: "6px 14px", fontSize: 13 }}>Login</Link>
                <Link href="/register" className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>Register</Link>
              </div>
            </nav>
          </div>
        </header>
      )}

      <main style={{ flex: 1 }}>{children}</main>

      {!isDashboard && (
        <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--text-3)" }}>
            <p>© 2026 SchoolMS — Next.js · Express · MongoDB</p>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ href: "/", label: "Home" }, { href: "/login", label: "Login" }, { href: "/register", label: "Register" }].map((l) => (
                <Link key={l.href} href={l.href} style={{ color: "var(--text-2)", textDecoration: "none", fontSize: 12 }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
