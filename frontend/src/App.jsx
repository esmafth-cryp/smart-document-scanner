import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image.");
      return;
    }

    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setFileName(file.name);
    setSelectedImage(previewUrl);
    setResult(null);
    setError("");
  }

  async function analyzeDocument() {
    if (!selectedFile) {
      setError("Veuillez d'abord sélectionner une image.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch(
        "/api/scan",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.details
          ? `${data.error} Détail : ${data.details}`
          : data.error ||
            "Une erreur est survenue pendant l'analyse.";

        throw new Error(errorMessage);
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de contacter le serveur Flask."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function exportToJson() {
    if (!result) {
      setError("Aucun résultat à exporter.");
      return;
    }

    try {
      const exportData = {
        filename: result.filename || fileName || "document",
        saved_filename: result.saved_filename || "",
        document: result.document || {},
        text: result.text || "",
        lines: result.lines || [],
      };

      const jsonContent = JSON.stringify(exportData, null, 2);

      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8",
      });

      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");

      const originalName =
        result.filename || fileName || "document";

      const cleanName = originalName.replace(/\.[^/.]+$/, "");

      downloadLink.href = downloadUrl;
      downloadLink.download = `${cleanName}_analyse.json`;
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();

      window.setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      }, 200);

      setError("");
    } catch (exportError) {
      console.error("Erreur pendant l'export JSON :", exportError);
      setError("L'export du fichier JSON a échoué.");
    }
  }

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const documentData = result?.document || {};

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">S</div>

          <div>
            <h1>Smart Document Scanner</h1>
            <p>Analyse intelligente de documents</p>
          </div>
        </div>

        <div className="steps">
          <span className="step active">Importer</span>
          <span className="step">Analyser</span>
          <span className="step">Valider</span>

          <button
            type="button"
            className="step"
            disabled={!result}
            onClick={exportToJson}
          >
            Exporter
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="left-panel">
          <h2>Documents</h2>

          <label className="upload-button">
            Importer une image

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
            />
          </label>

          <div className="document-list">
            {selectedImage ? (
              <div className="document-card active-document">
                <img
                  src={selectedImage}
                  alt="Miniature du document"
                />

                <div>
                  <strong>Document 1</strong>
                  <span title={fileName}>{fileName}</span>
                </div>
              </div>
            ) : (
              <p className="empty-text">
                Aucun document importé.
              </p>
            )}
          </div>
        </aside>

        <section className="preview-panel">
          <div className="preview-header">
            <div>
              <h2>Aperçu du document</h2>

              <p>
                {selectedImage
                  ? "Le document est prêt à être analysé."
                  : "Importez une image pour commencer l’analyse."}
              </p>
            </div>

            <span className="status-badge">
              {isLoading
                ? "Analyse en cours"
                : result
                  ? "Analyse terminée"
                  : selectedImage
                    ? "Prêt"
                    : "En attente"}
            </span>
          </div>

          <div className="preview-area">
            {selectedImage ? (
              <div className="document-preview">
                <img
                  src={selectedImage}
                  alt="Document importé"
                />

                <div className="detection-label">
                  Document sélectionné
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="placeholder-icon">+</div>

                <h3>Aucun document sélectionné</h3>

                <p>
                  Utilisez le bouton d’importation situé dans le
                  panneau de gauche.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="right-panel">
          <div className="panel-title">
            <div>
              <h2>Informations extraites</h2>
              <p>
                Les résultats de l’analyse apparaîtront ici.
              </p>
            </div>
          </div>

          <div className="field-group">
            <label>Type de document</label>

            <input
              value={
                documentData.document_type ||
                "Non détecté"
              }
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Nom du fichier</label>

            <input
              value={result?.filename || fileName || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Nom de la stagiaire</label>

            <input
              value={documentData.student_name || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Date du document</label>

            <input
              value={documentData.document_date || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Référence</label>

            <input
              value={documentData.reference || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Type de stage</label>

            <input
              value={documentData.internship_type || ""}
              placeholder="Non détecté"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Date de début</label>

            <input
              value={documentData.start_date || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Durée</label>

            <input
              value={documentData.duration || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Service / Division</label>

            <input
              value={documentData.department || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Entreprise</label>

            <input
              value={documentData.company || ""}
              placeholder="En attente d’analyse"
              readOnly
            />
          </div>

          <div className="field-group">
            <label>Texte détecté</label>

            <textarea
              value={result?.text || ""}
              placeholder="Le texte extrait sera affiché ici."
              readOnly
            />
          </div>

          <button
            type="button"
            className="analyze-button"
            disabled={!selectedFile || isLoading}
            onClick={analyzeDocument}
          >
            {isLoading
              ? "Analyse en cours..."
              : "Analyser le document"}
          </button>

          {error && (
            <div className="message error-message">
              <strong>Erreur</strong>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="message success-message">
              <strong>Analyse réussie</strong>
              <p>Fichier reçu : {result.filename}</p>
              <p>{result.message}</p>
            </div>
          )}

          <button
            type="button"
            className="secondary-button"
            disabled={!result}
            onClick={exportToJson}
          >
            Exporter en JSON
          </button>
        </aside>
      </main>
    </div>
  );
}

export default App;