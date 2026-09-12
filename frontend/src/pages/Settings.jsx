import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Info,
  Save,
  CheckCircle2,
  Cpu,
  Database,
  Code2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { changePassword } from "../api/auth";

export function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [pwd, setPwd] = useState({ old: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  async function submitPassword(e) {
    e.preventDefault();
    if (!pwd.old || !pwd.new || !pwd.confirm) {
      toast.error("Tous les champs sont requis");
      return;
    }
    if (pwd.new !== pwd.confirm) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (pwd.new.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await changePassword(pwd.old, pwd.new);
      toast.success("Mot de passe modifié avec succès");
      setPwd({ old: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle>Profil</CardTitle>
                <CardDescription>Vos informations personnelles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">
                  {user?.full_name}
                </p>
                <p className="text-xs text-text-muted">{user?.email}</p>
                <Badge variant="primary" className="mt-1.5 capitalize">
                  {user?.role}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Nom complet
                </label>
                <Input value={user?.full_name || ""} readOnly />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Email
                </label>
                <Input value={user?.email || ""} readOnly />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Rôle
                </label>
                <Input value={user?.role || ""} readOnly className="capitalize" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Département
                </label>
                <Input value={user?.department || "—"} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                <Lock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Modifier votre mot de passe</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Mot de passe actuel
                </label>
                <Input
                  type="password"
                  value={pwd.old}
                  onChange={(e) => setPwd({ ...pwd, old: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Nouveau mot de passe
                  </label>
                  <Input
                    type="password"
                    value={pwd.new}
                    onChange={(e) => setPwd({ ...pwd, new: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Confirmation
                  </label>
                  <Input
                    type="password"
                    value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button type="submit" isLoading={loading}>
                {!loading && <Save className="h-3.5 w-3.5" />}
                Mettre à jour
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10">
                <Bell className="h-4 w-4 text-cyan" />
              </div>
              <div>
                <CardTitle>Préférences</CardTitle>
                <CardDescription>Personnalisez votre expérience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 p-3">
              <div>
                <p className="text-sm text-text-primary">Notifications</p>
                <p className="text-[11px] text-text-muted">
                  Recevoir une alerte à chaque scan terminé
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifEnabled(!notifEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  notifEnabled ? "bg-primary" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                    notifEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 p-3">
              <div>
                <p className="text-sm text-text-primary">Thème</p>
                <p className="text-[11px] text-text-muted">
                  Apparence de l'interface
                </p>
              </div>
              <div className="flex rounded-lg border border-border bg-surface-2/40 p-1">
                {["dark", "light"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                      theme === t
                        ? "bg-primary/20 text-primary"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {t === "dark" ? "Sombre" : "Clair"}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2">
                <Info className="h-4 w-4 text-text-secondary" />
              </div>
              <div>
                <CardTitle>À propos</CardTitle>
                <CardDescription>Informations système</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-surface/40 p-3">
                <Cpu className="mb-2 h-4 w-4 text-primary" />
                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                  Frontend
                </p>
                <p className="text-xs text-text-primary">React 19 + Vite</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/40 p-3">
                <Code2 className="mb-2 h-4 w-4 text-violet-400" />
                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                  Backend
                </p>
                <p className="text-xs text-text-primary">Flask + SQLAlchemy</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/40 p-3">
                <Database className="mb-2 h-4 w-4 text-cyan" />
                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                  Base de données
                </p>
                <p className="text-xs text-text-primary">PostgreSQL 15</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface/40 p-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-text-primary">
                  Smart Document Scanner
                </p>
                <p className="text-[10px] text-text-muted">
                  Version 1.0.0 — Marsa Maroc © 2026
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}