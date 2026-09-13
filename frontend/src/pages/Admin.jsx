import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  UserPlus,
  Users,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { UserFormModal } from "../components/admin/UserFormModal";
import { fetchUsers, adminUpdateUser, adminDeleteUser } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

export function Admin() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    fetchUsers()
      .then((list) => setUsers(list || []))
      .catch(() => toast.error(t("admin.loadError")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  async function toggleActive(u) {
    try {
      await adminUpdateUser(u.id, { is_active: !u.is_active });
      toast.success(t("admin.statusUpdated"));
      load();
    } catch (err) {
      toast.error(err.message || t("common.error"));
    }
  }

  async function changeRole(u, role) {
    try {
      await adminUpdateUser(u.id, { role });
      toast.success(t("admin.roleUpdated"));
      load();
    } catch (err) {
      toast.error(err.message || t("common.error"));
    }
  }

  async function remove(u) {
    if (!confirm(t("admin.confirmDelete", { name: u.full_name }))) return;
    try {
      await adminDeleteUser(u.id);
      toast.success(t("admin.userDeleted"));
      load();
    } catch (err) {
      toast.error(err.message || t("common.error"));
    }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(s) ||
      u.full_name?.toLowerCase().includes(s) ||
      u.department?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>{t("admin.userManagement")}</CardTitle>
              <CardDescription>
                {users.length}{" "}
                {users.length === 1 ? t("admin.user") : t("admin.users")}{" "}
                {t("admin.registered")}
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="self-start md:self-auto">
            <UserPlus className="h-3.5 w-3.5" />
            {t("admin.newUser")}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchPlaceholder")}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-xs text-text-muted">
              {t("common.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Users className="h-10 w-10 text-text-muted opacity-40" />
              <p className="text-sm text-text-secondary">{t("admin.noUsers")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-surface/40">
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      {t("admin.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      {t("admin.email")}
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      {t("admin.department")}
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      {t("admin.role")}
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      {t("admin.status")}
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      {t("admin.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 text-xs font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{u.full_name}</span>
                          {u.id === me?.id && (
                            <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] text-primary">
                              {t("admin.you")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {u.department || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value)}
                          disabled={u.id === me?.id}
                          className="rounded border border-border bg-surface-2/50 px-2 py-1 text-xs text-text-primary disabled:opacity-50"
                        >
                          <option value="admin">{t("roles.admin")}</option>
                          <option value="agent">{t("roles.agent")}</option>
                          <option value="viewer">{t("roles.viewer")}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.is_active ? "success" : "danger"}>
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> {t("admin.active")}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> {t("admin.inactive")}
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => toggleActive(u)}
                            disabled={u.id === me?.id}
                            title={u.is_active ? t("admin.inactive") : t("admin.active")}
                            className="rounded p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary disabled:opacity-30"
                          >
                            {u.is_active ? (
                              <XCircle className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => remove(u)}
                            disabled={u.id === me?.id}
                            title={t("common.delete")}
                            className="rounded p-1.5 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={load}
      />
    </div>
  );
}