import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { Settings } from "./pages/Settings";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ScanDetailModal } from "./components/history/ScanDetailModal";
import { ChatWidget } from "./components/chat/ChatWidget";

export default function App() {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState("scan");
  const [searchedScan, setSearchedScan] = useState(null);

  // === State partagé du scan (persiste entre les navigations) ===
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSeeAll(query) {
    if (query) sessionStorage.setItem("sds_search", query);
    setActive("history");
  }

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error(t("scan.wrongFormat"));
        return;
      }
      if (selectedImage) URL.revokeObjectURL(selectedImage);
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setSelectedImage(url);
      setResult(null);
      toast.success(t("scan.documentLoaded"));
    },
    [selectedImage, t]
  );

  async function analyzeDocument() {
    if (!selectedFile) {
      toast.error(t("scan.selectFirst"));
      return;
    }
    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("common.error"));
      setResult(data);
      toast.success(t("scan.analysisSuccess"));
    } catch (err) {
      toast.error(err.message || t("scan.serverError"));
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
    toast.success(t("detail.exported", { format: "JSON" }));
  }

  function reset() {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedFile(null);
    setSelectedImage(null);
    setResult(null);
  }

  const previewStatus = isLoading
    ? "processing"
    : result
      ? "done"
      : selectedImage
        ? "ready"
        : "idle";
  const currentStep = isLoading ? 1 : result ? 4 : 0;

  return (
    <ProtectedRoute>
      {active === "dashboard" && (
        <>
          <AmbientBackground />
          <div className="relative z-10 h-full">
            <AppLayout
              active={active}
              onNavigate={setActive}
              title={t("dashboard.title")}
              subtitle={t("dashboard.subtitle")}
              onSelectScan={setSearchedScan}
              onSeeAll={handleSeeAll}
            >
              <Dashboard onNavigate={setActive} />
            </AppLayout>
          </div>
        </>
      )}

      {active === "admin" && (
        <>
          <AmbientBackground />
          <div className="relative z-10 h-full">
            <AppLayout
              active={active}
              onNavigate={setActive}
              title={t("admin.title")}
              subtitle={t("admin.subtitle")}
              onSelectScan={setSearchedScan}
              onSeeAll={handleSeeAll}
            >
              <Admin />
            </AppLayout>
          </div>
        </>
      )}

      {active === "settings" && (
        <>
          <AmbientBackground />
          <div className="relative z-10 h-full">
            <AppLayout
              active={active}
              onNavigate={setActive}
              title={t("settings.title")}
              subtitle={t("settings.subtitle")}
              onSelectScan={setSearchedScan}
              onSeeAll={handleSeeAll}
            >
              <Settings />
            </AppLayout>
          </div>
        </>
      )}

      {active === "history" && (
        <>
          <AmbientBackground />
          <div className="relative z-10 h-full">
            <AppLayout
              active={active}
              onNavigate={setActive}
              title={t("history.title")}
              subtitle={t("history.subtitle")}
              onSelectScan={setSearchedScan}
              onSeeAll={handleSeeAll}
            >
              <History />
            </AppLayout>
          </div>
        </>
      )}

      {active !== "dashboard" &&
        active !== "history" &&
        active !== "admin" &&
        active !== "settings" && (
          <>
            <AmbientBackground />
            <div className="relative z-10">
              <AppLayout
                active={active}
                onNavigate={setActive}
                title={t("scan.title")}
                subtitle={t("scan.subtitle")}
                onSelectScan={setSearchedScan}
                onSeeAll={handleSeeAll}
              >
                <div className="flex h-full">
                  <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
                    <Card>
                      <CardContent className="flex items-center justify-between py-4">
                        <WorkflowStepper
                          currentStep={currentStep}
                          status={isLoading ? "processing" : result ? "done" : "idle"}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={reset}
                            disabled={!selectedFile}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            {t("common.reset")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={analyzeDocument}
                            disabled={!selectedFile}
                            isLoading={isLoading}
                          >
                            {isLoading ? t("scan.analyzing") : t("scan.analyze")}
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

                  <aside className="w-[400px] shrink-0 overflow-y-auto border-l border-border bg-surface/20 p-6">
                    <div className="mb-4">
                      <h2 className="text-sm font-semibold text-text-primary">
                        {t("scan.extractedInfo")}
                      </h2>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {result ? t("scan.analysisDone") : t("scan.waitingAnalysis")}
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
                          {t("scan.exportJson")}
                        </Button>
                      </motion.div>
                    )}
                  </aside>
                </div>
              </AppLayout>
            </div>
          </>
        )}

      {searchedScan && (
        <ScanDetailModal
          scan={searchedScan}
          onClose={() => setSearchedScan(null)}
        />
      )}

      <ChatWidget key={i18n.language} />
    </ProtectedRoute>
  );
}