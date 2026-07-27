"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import MessagesPanel from "@/components/shared/MessagesPanel";

export default function TeacherMessagesPage() {
  const [recipients, setRecipients] = useState([]);
  const [userId, setUserId]         = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/api/students"), apiFetch("/api/auth/me")]).then(async ([sRes, meRes]) => {
      const sJson  = await sRes?.json();
      const meJson = await meRes?.json();
      if (meRes?.ok) setUserId(meJson.data.id);
      if (sRes?.ok) {
        const parents = sJson.data
          .filter((s) => s.parentId?.userId)
          .map((s) => ({
            id: s.parentId.userId._id,
            name: s.parentId.userId.name,
            sub: `Parent of ${s.userId?.name || "student"}`,
          }));
        const unique = Array.from(new Map(parents.map((p) => [p.id, p])).values());
        setRecipients(unique);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
  }

  return <MessagesPanel recipients={recipients} currentUserId={userId} />;
}
