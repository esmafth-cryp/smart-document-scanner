import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { adminCreateUser } from "../../api/auth";

export function UserFormModal({ open, onClose, onCreated }) {
  const { t } = useTranslation();
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
      toast.error(t("admin.requiredFields"));
      return;
    }
    setLoading(true);
    try {
      await adminCreateUser(form);
      toast.success(t("admin.userCreated"));
      onCreated?.();
      setForm({ full_name: "", email: "", password: "", role: "agent", department: "" });
      onClose();
    } catch (err) {
      toast.error(err.message || t("admin.createError"));
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
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  {t("admin.newUser")}
                </h2>
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
                  {t("admin.name")}
                </label>
                <Input
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder={t("admin.namePlaceholder")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {t("admin.email")}
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("admin.emailPlaceholder")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {t("admin.password")}
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder={t("admin.passwordPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    {t("admin.role")}
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-surface-2/50 px-3 text-sm text-text-primary focus:border-primary/50 focus:outline-none"
                  >
                    <option value="admin">{t("roles.admin")}</option>
                    <option value="agent">{t("roles.agent")}</option>
                    <option value="viewer">{t("roles.viewer")}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-text-muted">
                    {t("admin.department")}
                  </label>
                  <Input
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                    placeholder={t("admin.departmentPlaceholder")}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" isLoading={loading}>
                  {!loading && <UserPlus className="h-3.5 w-3.5" />}
                  {t("common.create")}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}