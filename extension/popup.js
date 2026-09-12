const API_URL = "https://esmafth-sds.duckdns.org/api/scan";

document.getElementById("capture").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  const resultEl = document.getElementById("result");
  const btn = document.getElementById("capture");

  statusEl.textContent = "Capture en cours...";
  statusEl.className = "";
  resultEl.textContent = "";
  btn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });

    statusEl.textContent = "Envoi au serveur...";

    const blob = await (await fetch(dataUrl)).blob();
    const formData = new FormData();
    formData.append("image", blob, "capture.png");

    const res = await fetch(API_URL, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Erreur serveur");
    }

    statusEl.textContent = "Analyse réussie ✓";
    statusEl.className = "success";
    resultEl.textContent = JSON.stringify(data.document || data, null, 2);
  } catch (err) {
    statusEl.textContent = `Erreur : ${err.message}`;
    statusEl.className = "error";
  } finally {
    btn.disabled = false;
  }
});