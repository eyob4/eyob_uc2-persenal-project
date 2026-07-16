"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function RoleFallback() {
  const { role } = useParams();
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card text-center space-y-4 max-w-sm w-full">
        <p style={{ color: "var(--text)" }} className="font-semibold">Unknown role: {role}</p>
        <Link href="/login" className="btn-primary px-6 py-2 inline-flex">Back to Login</Link>
      </div>
    </div>
  );
}
