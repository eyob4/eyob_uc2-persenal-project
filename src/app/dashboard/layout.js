"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getRole } from "../lib/api";
import { useEffect, useState } from "react";

const NAV = {
  admin:   [{ href: "/dashboard/admin",   label: "Overview",   icon: "▦" }, { href: "/dashboard/admin/users",    label: "Users",      icon: "◎" }, { href: "/dashboard/admin/students", label: "Students",   icon: "◈" }],
  teacher: [{ href: "/dashboard/teacher", label: "Overview",   icon: "▦" }, { href: "/dashboard/teacher/grades", label: "Grades",     icon: "◎" }, { href: "/dashboard/teacher/attendance", label: "Attendance", icon: "◈" }],
  student: [{ href: "/dashboard/student", label: "Overview",   icon: "▦" }, { href: "/dashboard/student/grades", label: "Grades",     icon: "◎" }, { href: "/dashboard/student/schedule",   label: "Schedule",   icon: "◈" }],
  parent:  [{ href: "/dashboard/parent",  label: "Overview",   icon: "▦" }, { href: "/dashboard/parent/grades",  label: "Grades",     icon: "◎" }, { href: "/dashboard/parent/attendance",  label: "Attendance", icon: "◈" }],
};

const ROLE_COLOR = { admin: "#6366f1", teacher: "#8b5cf6", student: "#10b981", parent: "#f59e0b" };
const ROLE_BG    = { admin: "#6366f115", teacher: "#8b5cf615", student: "#10b98115", parent: "#f59e0b15" };

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [role, setRole] = useState(null);

  useEffect(() => { setRole(getRole()); }, []);

  const links = NAV[role] || [];
  const color = ROLE_COLOR[role] || "#6366f1";
  const bg    = ROLE_BG[role]    || "#6366f115";

  return (
    <div className="dash-root">
      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        {/* Logo */}
        <div className="dash-logo">
          <div className="dash-logo-icon" style={{ background: color }}>S</div>
          <span className="dash-logo-text">SchoolMS</span>
        </div>

        {/* Role badge */}
        {role && (
          <div className="dash-role-badge" style={{ background: bg, color }}>
            {role.toUpperCase()} PANEL
          </div>
        )}

        {/* Nav links */}
        <nav className="dash-nav">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}
                className={`dash-nav-link ${active ? "dash-nav-link--active" : ""}`}
                style={active ? { background: bg, color, borderColor: color } : {}}>
                <span className="dash-nav-icon">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="dash-sidebar-footer">
          <button onClick={logout} className="dash-logout-btn">
            <span>⇤</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <span className="dash-breadcrumb">
              {links.find((l) => l.href === pathname)?.label ?? "Dashboard"}
            </span>
          </div>
          {role && (
            <span className="dash-role-pill" style={{ background: bg, color }}>
              {role}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
