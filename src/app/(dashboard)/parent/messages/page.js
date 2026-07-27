"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import MessagesPanel from "@/components/shared/MessagesPanel";

export default function ParentMessagesPage() {
  const [recipients, setRecipients] = useState([]);
  const [userId, setUserId]         = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/api/teachers"), apiFetch("/api/auth/me")]).then(async ([tRes, meRes]) => {
      const tJson  = await tRes?.json();
      const meJson = await meRes?.json();
      if (meRes?.ok) setUserId(meJson.data.id);
      if (tRes?.ok) {
        setRecipients(
          tJson.data
            .filter((t) => t.userId)
            .map((t) => ({ id: t.userId._id, name: t.userId.name, sub: "Teacher" }))
        );
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}><span className="spinner" /> Loading…</div>;
  }

  return <MessagesPanel recipients={recipients} currentUserId={userId} />;
}
