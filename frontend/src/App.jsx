import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Download, RefreshCw } from "lucide-react";

import { AppLayout } from "./components/layout/AppLayout";
import { AmbientBackground } from "./components/neon/AmbientBackground";
import { ProcessingOverlay } from "./components/neon/ProcessingOverlay";
import { DropZone } from "./components/scan/DropZone";
import { DocumentPreview } from "./components/scan/DocumentPreview";
import { WorkflowStepper } from "./components/scan/WorkflowStepper";
import { ExtractedFields } from "./components/scan/ExtractedFields";
import { JsonViewer } from "./components/scan/JsonViewer";
import { Card, CardContent } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { History } from "./pages/History";

export default function App() {
  const [active, setActive] = useState("scan");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Format non supporté. Utilisez PNG ou JPG.");
        return;
      }
      if (selectedImage) URL.revokeObjectURL(selectedImage);
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setSelectedImage(url);
      setResult(null);
      toast.success("Document chargé");
    },
    [selectedImage]
  );

  async function analyzeDocument() {
    if (!selectedFile) {
      toast.error("Veuillez d'abord sélectionner un document.");
      return;
    }
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur pendant l'analyse.");
      setResult(data);
      toast.success("Analyse terminée avec succès");
    } catch (err) {
      toast.error(err.message || "Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  }

  function exportToJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(result.filename || "document").replace(/\.[^.]+$/, "")}_analyse.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier JSON téléchargé");
  }

  function reset() {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedFile(null);
    setSelectedImage(null);
    setResult(null);
  }

  const previewStatus = isLoading ? "processing" : result ? "done" : selectedImage ? "ready" : "idle";
  const currentStep = isLoading ? 1 : result ? 4 : 0;

  // Page Historique
  if (active === "history") {
    return (
      <>
        <AmbientBackground />
        <div className="relative z-10 h-full">
          <AppLayout
            active={active}
            onNavigate={setActive}
            title="Historique"
            subtitle="Consultez tous les documents scannés"
          >
            <History />
          </AppLayout>
        </div>
      </>
    );
  }

  // Page Scan (par défaut)
  return (
    <>
      <AmbientBackground />
      <div className="relative z-10">
        <AppLayout
          active={active}
          onNavigate={setActive}
          title="Scanner un document"
          subtitle="Importez, analysez, validez et exportez vos documents"
        >
          <div className="flex h-full">
            {/* Zone centrale */}
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
              <Card>
                <CardContent className="flex items-center justify-between py-4">
                  <WorkflowStepper
                    currentStep={currentStep}
                    status={isLoading ? "processing" : result ? "done" : "idle"}
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={reset} disabled={!selectedFile}>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Réinitialiser
                    </Button>
                    <Button
                      size="sm"
                      onClick={analyzeDocument}
                      disabled={!selectedFile}
                      isLoading={isLoading}
                    >
                      {isLoading ? "Analyse..." : "Analyser"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1 overflow-hidden">
                <CardContent className="h-full p-0">
                  {selectedImage ? (
                    <DocumentPreview
                      image={selectedImage}
                      status={previewStatus}
                      onZoom={() => window.open(selectedImage, "_blank")}
                    >
                      <ProcessingOverlay isRunning={isLoading} isDone={!!result} />
                    </DocumentPreview>
                  ) : (
                    <div className="h-full p-6">
                      <DropZone onFile={handleFile} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Panneau droit */}
            <aside className="w-[400px] shrink-0 overflow-y-auto border-l border-border bg-surface/20 p-6">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-text-primary">Informations extraites</h2>
                <p className="mt-0.5 text-xs text-text-muted">
                  {result ? "Analyse terminée" : "En attente d'analyse"}
                </p>
              </div>

              <ExtractedFields data={result?.document || {}} loading={isLoading} />

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5"
                >
                  <JsonViewer data={result} />
                  <Button className="mt-4 w-full" onClick={exportToJson}>
                    <Download className="h-4 w-4" />
                    Exporter en JSON
                  </Button>
                </motion.div>
              )}
            </aside>
          </div>
        </AppLayout>
      </div>
    </>
  );
}