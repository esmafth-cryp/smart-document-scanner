import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, FileScan } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AmbientBackground } from "../components/neon/AmbientBackground";
import { MarsaLogo } from "../components/brand/MarsaLogo";
import { LanguageSwitcher } from "../components/layout/LanguageSwitcher";

export function Login() {
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();
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
        toast.success(t("auth.welcome"));
      } else {
        if (!fullName.trim()) {
          toast.error(t("auth.nameRequired"));
          return;
        }
        await signUp({ email, password, full_name: fullName, role: "agent" });
        toast.success(t("auth.accountCreated"));
      }
    } catch (err) {
      toast.error(err.message || t("auth.authError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AmbientBackground />

      {/* Language switcher en haut à droite */}
      <div className="absolute right-6 top-6 z-20">
        <LanguageSwitcher />
      </div>

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
                {t("auth.login")}
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
                {t("auth.register")}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    {t("auth.fullName")}
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("auth.namePlaceholder")}
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.emailPlaceholder")}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.passwordPlaceholder")}
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
                {mode === "login" ? t("auth.signIn") : t("auth.signUp")}
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