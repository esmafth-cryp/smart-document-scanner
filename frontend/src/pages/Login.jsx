import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, FileScan } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AmbientBackground } from "../components/neon/AmbientBackground";
import { MarsaLogo } from "../components/brand/MarsaLogo";

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Connecté");
      } else {
        if (!fullName.trim()) {
          toast.error("Nom complet requis");
          return;
        }
        await signUp({ email, password, full_name: fullName, role: "agent" });
        toast.success("Compte créé");
      }
    } catch (err) {
      toast.error(err.message || "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AmbientBackground />
      <div className="relative z-10 flex h-screen w-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo Marsa Maroc stylisé */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <MarsaLogo size="lg" />
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface/50 px-3 py-1.5">
              <FileScan className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-text-primary">
                Smart Document Scanner
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm">
            {/* Tabs */}
            <div className="mb-5 flex rounded-lg border border-border bg-surface-2/40 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-md py-2 text-xs font-medium transition-all ${
                  mode === "login"
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded-md py-2 text-xs font-medium transition-all ${
                  mode === "register"
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Inscription
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Nom complet
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prénom Nom"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@marsamaroc.ma"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                isLoading={loading}
              >
                {!loading && <ArrowRight className="h-4 w-4" />}
                {mode === "login" ? "Se connecter" : "Créer un compte"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-[11px] text-text-muted">
            © 2026 Smart Document Scanner — Marsa Maroc
          </p>
        </motion.div>
      </div>
    </>
  );
}