import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "../ui/Button";

export function JsonViewer({ data, title = "Réponse JSON brute" }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const json = JSON.stringify(data, null, 2);

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-surface/50">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-cyan" />
          <span className="text-xs font-medium text-text-primary">{title}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
      <pre className="max-h-64 overflow-auto p-4 text-[11px] leading-relaxed font-mono text-text-secondary">
        {json}
      </pre>
    </div>
  );
}