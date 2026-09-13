function getToken() {
  return localStorage.getItem("sds_access_token");
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchOverview() {
  const res = await fetch("/api/stats/overview", {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement overview");
  return res.json();
}

export async function fetchTimeline(days = 30) {
  const res = await fetch(`/api/stats/timeline?days=${days}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement timeline");
  return res.json();
}

export async function fetchDocumentTypes() {
  const res = await fetch("/api/stats/document-types", {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement types");
  return res.json();
}