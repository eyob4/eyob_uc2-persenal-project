"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/lib/api";
import {
  OverviewIcon, UsersIcon, GraduationCapIcon, ClassesIcon, BookIcon,
  AwardIcon, CalendarCheckIcon, DollarIcon, MegaphoneIcon, MessageIcon, LogoutIcon,
} from "@/components/ui/Icons";

const NAV = {
  admin: [
    { href: "/admin", label: "Overview", icon: OverviewIcon },
    { href: "/admin/users", label: "Users", icon: UsersIcon },
    { href: "/admin/students", label: "Students", icon: GraduationCapIcon },
    { href: "/admin/teachers", label: "Teachers", icon: UsersIcon },
    { href: "/admin/parents", label: "Parents", icon: UsersIcon },
    { href: "/admin/classes", label: "Classes", icon: ClassesIcon },
    { href: "/admin/subjects", label: "Subjects", icon: BookIcon },
    { href: "/admin/fees", label: "Fees", icon: DollarIcon },
    { href: "/admin/announcements", label: "Announcements", icon: MegaphoneIcon },
  ],
  teacher: [
    { href: "/teacher", label: "Overview", icon: OverviewIcon },
    { href: "/teacher/grades", label: "Grades", icon: AwardIcon },
    { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheckIcon },
    { href: "/teacher/messages", label: "Messages", icon: MessageIcon },
    { href: "/teacher/announcements", label: "Announcements", icon: MegaphoneIcon },
  ],
  student: [
    { href: "/student", label: "Overview", icon: OverviewIcon },
    { href: "/student/grades", label: "Grades", icon: AwardIcon },
    { href: "/student/announcements", label: "Announcements", icon: MegaphoneIcon },
  ],
  parent: [
    { href: "/parent", label: "Overview", icon: OverviewIcon },
    { href: "/parent/fees", label: "Fees", icon: DollarIcon },
    { href: "/parent/messages", label: "Messages", icon: MessageIcon },
    { href: "/parent/announcements", label: "Announcements", icon: MegaphoneIcon },
  ],
};

const ROLE_COLOR = { admin: "#6366f1", teacher: "#8b5cf6", student: "#10b981", parent: "#f59e0b" };
const ROLE_BG    = { admin: "#6366f115", teacher: "#8b5cf615", student: "#10b98115", parent: "#f59e0b15" };

export default function Sidebar({ role, name, children }) {
  const pathname = usePathname();

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
            const LinkIcon = l.icon;
            return (
              <Link key={l.href} href={l.href}
                className={`dash-nav-link ${active ? "dash-nav-link--active" : ""}`}
                style={active ? { background: bg, color, borderColor: color } : {}}>
                <LinkIcon className="dash-nav-icon" size={16} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="dash-sidebar-footer">
          <button onClick={logout} className="dash-logout-btn">
            <LogoutIcon size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <span className="dash-breadcrumb">
              {links.find((l) => l.href === pathname)?.label ?? name ?? "Dashboard"}
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
