import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, RefreshCw, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";

export function CameraCapture({ open, onClose, onCapture }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!open) return;
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function startCamera() {
    setStarting(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      toast.error(t("camera.accessDenied"));
      onClose();
    } finally {
      setStarting(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);
    stopCamera();
  }

  function retake() {
    setCapturedImage(null);
    startCamera();
  }

  function confirm() {
    if (!capturedImage) return;
    // Convertir dataURL en File
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `camera_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        stopCamera();
        setCapturedImage(null);
        onClose();
      });
  }

  function handleClose() {
    stopCamera();
    setCapturedImage(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  {t("camera.title")}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video / Preview */}
            <div className="relative bg-black">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Capture"
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="max-h-[60vh] w-full object-contain"
                />
              )}
              {starting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-xs text-white">{t("camera.starting")}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 border-t border-border bg-surface/50 px-5 py-4">
              {capturedImage ? (
                <>
                  <Button variant="ghost" onClick={retake}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("camera.retake")}
                  </Button>
                  <Button onClick={confirm}>
                    <Check className="h-3.5 w-3.5" />
                    {t("camera.use")}
                  </Button>
                </>
              ) : (
                <Button onClick={capture} disabled={starting}>
                  <Camera className="h-3.5 w-3.5" />
                  {t("camera.capture")}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}