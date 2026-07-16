const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("sms_token") : null;
}

export function getRole() {
  return typeof window !== "undefined" ? localStorage.getItem("sms_role") : null;
}

export function logout() {
  localStorage.removeItem("sms_token");
  localStorage.removeItem("sms_role");
  window.location.href = "/login";
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    logout();
    return null;
  }
  return res;
}
