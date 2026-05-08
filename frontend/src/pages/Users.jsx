import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Search, AlertTriangle, Users as UsersIcon, Trash2, Power } from "lucide-react";

import PageHeader from "../components/layout/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Button from "../components/ui/Button.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { RolePill } from "../components/ui/StatusBadge.jsx";

import { usersApi } from "../api/users.api.js";
import { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtRelative } from "../utils/format.js";

export default function UsersPage() {
  const { user: me, hasRole } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["users", { role }],
    queryFn: () => usersApi.list({ role: role || undefined }),
  });

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const roleMut = useMutation({
    mutationFn: ({ id, role }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const activeMut = useMutation({
    mutationFn: ({ id, isActive }) => usersApi.setActive(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(vars.isActive ? "User activated" : "User deactivated");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const isAdmin = hasRole("admin");

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage roles and access for everyone in your workspace."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by name or email…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "", label: "All roles" },
            { value: "admin", label: "Admins" },
            { value: "manager", label: "Managers" },
            { value: "member", label: "Members" },
          ]}
        />
      </div>

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load team"
          description="Please try again."
          action={<Button variant="secondary" onClick={() => refetch()}>Retry</Button>}
        />
      ) : isLoading ? (
        <Card className="p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No matching users"
          description="Try adjusting your filters."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Role</th>
                  <th className="px-5 py-3 hidden md:table-cell">Status</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Joined</th>
                  {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const isMe = u._id === me._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.avatarUrl} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              {u.name}
                              {isMe && (
                                <span className="ml-1.5 text-[10px] uppercase tracking-wide font-bold text-brand-600">
                                  you
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        {isAdmin && !isMe ? (
                          <Select
                            className="h-8 w-32 text-xs"
                            value={u.role}
                            onChange={(e) =>
                              roleMut.mutate({ id: u._id, role: e.target.value })
                            }
                            options={[
                              { value: "admin", label: "Admin" },
                              { value: "manager", label: "Manager" },
                              { value: "member", label: "Member" },
                            ]}
                          />
                        ) : (
                          <RolePill role={u.role} />
                        )}
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            u.isActive ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell text-xs text-slate-500">
                        {fmtRelative(u.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {!isMe && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  leftIcon={<Power className="h-3.5 w-3.5" />}
                                  onClick={() =>
                                    activeMut.mutate({ id: u._id, isActive: !u.isActive })
                                  }
                                >
                                  {u.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-rose-600 hover:bg-rose-50"
                                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                                  onClick={() => {
                                    if (window.confirm(`Delete ${u.name}?`)) {
                                      deleteMut.mutate(u._id);
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
