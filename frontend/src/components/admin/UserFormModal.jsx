import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { adminCreateUser } from "../../api/auth";

export function UserFormModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "agent",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      toast.error("Nom, email et mot de passe sont requis");
      return;
    }
    setLoading(true);
    try {
      await adminCreateUser(form);
      toast.success("Utilisateur créé");
      onCreated?.();
      setForm({ full_name: "", email: "", password: "", role: "agent", department: "" });
      onClose();
    } catch (err) {
      toast.error(err.message || "Erreur de création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-[#0d1224] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-text-primary">Nouvel utilisateur</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Nom complet
                </label>
                <Input
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="Prénom Nom"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="email@marsamaroc.ma"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Mot de passe
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Rôle
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-surface-2/50 px-3 text-sm text-text-primary focus:border-primary/50 focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    Département
                  </label>
                  <Input
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                    placeholder="DSI"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  Annuler
                </Button>
                <Button type="submit" isLoading={loading}>
                  {!loading && <UserPlus className="h-3.5 w-3.5" />}
                  Créer
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}