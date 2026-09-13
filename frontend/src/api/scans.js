const API_BASE = "";

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

export async function fetchScans({
  page = 1,
  perPage = 20,
  status = "",
  documentType = "",
  search = "",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("per_page", perPage);
  if (status) params.set("status", status);
  if (documentType) params.set("document_type", documentType);
  if (search) params.set("search", search);

  const res = await fetch(`${API_BASE}/api/scans?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur de chargement des scans");
  return res.json();
}

export async function fetchScanDetail(scanId) {
  const res = await fetch(`${API_BASE}/api/scans/${scanId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur de chargement du détail");
  return res.json();
}

export async function validateScan(scanId, corrections) {
  const res = await fetch(`${API_BASE}/api/scans/${scanId}/validate`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ corrections }),
  });
  if (!res.ok) throw new Error("Erreur lors de la validation");
  return res.json();
}

export function getExportUrl(scanId, format) {
  return `${API_BASE}/api/scans/${scanId}/export?format=${format}`;
}

export async function deleteScan(scanId) {
  const res = await fetch(`${API_BASE}/api/scans/${scanId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Erreur lors de la suppression");
  }
  return data;
}