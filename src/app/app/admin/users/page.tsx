"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Button, ConfirmDialog, Pagination, inputClass } from "@/components/ui/forms";
import { useSessionUser } from "@/components/app/SessionProvider";
import type { Role } from "@/lib/types";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  kycStatus: string;
  carrierId: string | null;
  disabledAt: string | null;
  createdAt: string;
};

export default function AdminUsers() {
  const { user: me } = useSessionUser();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, Role>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ row: UserRow; kind: "deactivate" | "remove" } | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  function load() {
    api<{ users: UserRow[]; total: number }>(`/users?page=${page}&pageSize=${pageSize}`)
      .then((data) => {
        setRows(data.users);
        setTotal(data.total);
        setRoleDrafts(Object.fromEntries(data.users.map((u) => [u.id, u.role])));
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  async function saveRole(id: string) {
    setError(null);
    setPendingId(id);
    try {
      await api(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: roleDrafts[id] }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    } finally {
      setPendingId(null);
    }
  }

  async function applyToggleDisabled(row: UserRow) {
    setError(null);
    setPendingId(row.id);
    try {
      await api(`/users/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ disabledAt: !row.disabledAt }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setPendingId(null);
    }
  }

  async function applyRemove(row: UserRow) {
    setError(null);
    setPendingId(row.id);
    try {
      await api(`/users/${row.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove this user");
    } finally {
      setPendingId(null);
    }
  }

  function requestToggleDisabled(row: UserRow) {
    setOpenMenuId(null);
    if (row.disabledAt) {
      applyToggleDisabled(row);
    } else {
      setConfirmAction({ row, kind: "deactivate" });
    }
  }

  function requestRemove(row: UserRow) {
    setOpenMenuId(null);
    setConfirmAction({ row, kind: "remove" });
  }

  const dialog =
    confirmAction?.kind === "deactivate"
      ? {
          title: "Deactivate account",
          message: `Are you sure you want to deactivate ${confirmAction.row.email}? They will be signed out immediately and won't be able to sign back in until you reactivate their account.`,
          confirmLabel: "Deactivate",
          onConfirm: () => {
            setConfirmAction(null);
            applyToggleDisabled(confirmAction.row);
          },
        }
      : confirmAction?.kind === "remove"
        ? {
            title: "Remove account",
            message: `Are you sure you want to permanently remove ${confirmAction.row.email}'s account? This action cannot be undone.`,
            confirmLabel: "Remove",
            onConfirm: () => {
              setConfirmAction(null);
              applyRemove(confirmAction.row);
            },
          }
        : null;

  return (
    <div>
      <PageTitle
        kicker="Admin"
        title="Users"
        body="Change a user's role, deactivate, or remove an account. Deactivating signs them out immediately and blocks future logins."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      <div className="overflow-x-auto border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-[11px] uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">KYC</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelf = row.id === me?.id;
              return (
                <tr key={row.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">{row.name ?? "—"}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={roleDrafts[row.id] ?? row.role}
                        disabled={isSelf}
                        onChange={(e) =>
                          setRoleDrafts((prev) => ({ ...prev, [row.id]: e.target.value as Role }))
                        }
                        className={inputClass("text-xs")}
                      >
                        <option value="OWNER">Owner</option>
                        <option value="FUNDER">Funder</option>
                        <option value="CARRIER">Carrier</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      {!isSelf && roleDrafts[row.id] !== row.role ? (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={pendingId === row.id}
                          onClick={() => saveRole(row.id)}
                        >
                          Save
                        </Button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.kycStatus}</td>
                  <td className="px-4 py-3">
                    <span className={row.disabledAt ? "text-sand" : "text-muted"}>
                      {row.disabledAt ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {isSelf ? null : (
                      <div className="relative">
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={pendingId === row.id}
                          onClick={() => setOpenMenuId((prev) => (prev === row.id ? null : row.id))}
                          onBlur={() => setTimeout(() => setOpenMenuId(null), 150)}
                        >
                          Actions ▾
                        </Button>
                        {openMenuId === row.id ? (
                          <ul className="absolute right-0 z-10 mt-1 w-40 border border-line bg-background shadow-lg">
                            <li>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => requestToggleDisabled(row)}
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-surface"
                              >
                                {row.disabledAt ? "Reactivate" : "Deactivate"}
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => requestRemove(row)}
                                className="block w-full px-3 py-2 text-left text-sm text-sand hover:bg-surface"
                              >
                                Remove
                              </button>
                            </li>
                          </ul>
                        ) : null}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
      />
      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.title ?? ""}
        message={dialog?.message ?? ""}
        confirmLabel={dialog?.confirmLabel}
        onConfirm={dialog?.onConfirm ?? (() => {})}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
