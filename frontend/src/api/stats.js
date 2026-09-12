export async function fetchOverview() {
  const res = await fetch("/api/stats/overview");
  if (!res.ok) throw new Error("Erreur chargement overview");
  return res.json();
}

export async function fetchTimeline(days = 30) {
  const res = await fetch(`/api/stats/timeline?days=${days}`);
  if (!res.ok) throw new Error("Erreur chargement timeline");
  return res.json();
}

export async function fetchDocumentTypes() {
  const res = await fetch("/api/stats/document-types");
  if (!res.ok) throw new Error("Erreur chargement types");
  return res.json();
}