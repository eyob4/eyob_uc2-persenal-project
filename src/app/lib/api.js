const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
    return null;
  }
  return res;
}

export async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}
