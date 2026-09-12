import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Camera, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { CameraCapture } from "./CameraCapture";

export function DropZone({ onFile, disabled = false }) {
  const { t } = useTranslation();
  const [cameraOpen, setCameraOpen] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    disabled,
    onDrop: (files) => {
      if (files?.[0]) onFile(files[0]);
    },
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex h-full min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border-strong hover:border-primary/50 hover:bg-white/[0.02]",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-lg shadow-primary/30">
          <UploadCloud className="h-6 w-6 text-white" strokeWidth={2.2} />
        </div>

        <h3 className="mb-1 text-base font-semibold text-text-primary">
          {isDragActive ? t("scan.dropActive") : t("scan.dropTitle")}
        </h3>
        <p className="mb-6 text-xs text-text-muted">{t("scan.dropSubtitle")}</p>

        <div className="flex items-center gap-2 text-[10px] text-text-muted">
          <span className="rounded-full border border-border px-2 py-0.5">PNG</span>
          <span className="rounded-full border border-border px-2 py-0.5">JPG</span>
          <span className="rounded-full border border-border px-2 py-0.5">JPEG</span>
          <span className="text-text-muted/50">·</span>
          <span>{t("scan.maxSize")}</span>
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{t("scan.fromFile")}</span>
          </div>
          <span className="text-text-muted/50">·</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCameraOpen(true);
            }}
            className="flex items-center gap-1.5 rounded transition-colors hover:text-primary"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>{t("camera.useCamera")}</span>
          </button>
        </div>
      </div>

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onFile}
      />
    </>
  );
}