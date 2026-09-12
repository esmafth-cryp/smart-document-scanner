const API_BASE = "";

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

  const res = await fetch(`${API_BASE}/api/scans?${params.toString()}`);
  if (!res.ok) throw new Error("Erreur de chargement des scans");
  return res.json();
}

export async function fetchScanDetail(scanId) {
  const res = await fetch(`${API_BASE}/api/scans/${scanId}`);
  if (!res.ok) throw new Error("Erreur de chargement du détail");
  return res.json();
}