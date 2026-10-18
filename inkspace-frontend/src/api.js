// Django backend ka address. Server kahin aur chalao toh sirf yahan badlo.
const BASE = "http://127.0.0.1:8000/api";

export function isLoggedIn() {
  return Boolean(localStorage.getItem("access"));
}

// Har request yahin se jati hai. Token automatically header mein lag jata hai.
export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("access");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));

  // Token expire ho gaya ya galat hai: logout karke login page par bhejo.
  if (res.status === 401 && auth) {
    localStorage.clear();
    window.location.href = "/login";
  }
  if (!res.ok) throw data;
  return data;
}

export async function login(username, password) {
  const data = await api("/auth/login/", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("username", username);
}

export function logout() {
  localStorage.clear();
}

// DRF ke errors ko padhne layak text mein badalta hai.
export function errorText(err) {
  if (err instanceof Error) {
    return "Can't reach the server. Check that the Django server is running.";
  }
  if (err && err.detail) return err.detail;
  const parts = Object.entries(err || {}).map(
    ([field, msg]) => `${field}: ${[].concat(msg).join(" ")}`
  );
  return parts.join(" | ") || "Something went wrong. Try again.";
}
