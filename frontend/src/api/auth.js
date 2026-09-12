const TOKEN_KEY = "sds_access_token";
const REFRESH_KEY = "sds_refresh_token";
const USER_KEY = "sds_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession({ access_token, refresh_token, user }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Erreur d'authentification");
  }
  return data;
}

export async function login(email, password) {
  const data = await authFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setSession(data);
  return data.user;
}

export async function register(payload) {
  const data = await authFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setSession(data);
  return data.user;
}

export async function fetchMe() {
  return authFetch("/api/auth/me");
}

export async function fetchUsers() {
  const data = await authFetch("/api/admin/users");
  return data.users;
}

export function logout() {
  clearSession();
}
async function adminFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Erreur");
  }
  return data;
}

export async function adminCreateUser(payload) {
  return adminFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateUser(userId, payload) {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteUser(userId) {
  return adminFetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}
export async function changePassword(oldPassword, newPassword) {
  return adminFetch("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}
export async function fetchNotifications() {
  return adminFetch("/api/notifications");
}