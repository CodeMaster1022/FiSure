"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  disclosureAccepted: boolean;
  invitedAt: string | null;
  createdAt: string;
};

const ROLE_DEFAULT: Record<string, string> = {
  OWNER: "OWNER",
  CARRIER: "CARRIER",
  CORPORATE: "FUNDER",
  INDIVIDUAL: "FUNDER",
  OTHER: "FUNDER",
};

export default function AdminWaitlist() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [inviteUrls, setInviteUrls] = useState<Record<string, string>>({});

  function load() {
    api<{ waitlist: Row[] }>("/waitlist")
      .then((data) => setRows(data.waitlist))
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(event: FormEvent<HTMLFormElement>, row: Row) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const organizationName = String(form.get("organizationName") ?? "").trim();
    try {
      const data = await api<{ inviteUrl: string }>(`/waitlist/${row.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          role: form.get("role"),
          ...(organizationName ? { organizationName } : {}),
        }),
      });
      setInviteUrls((prev) => ({ ...prev, [row.id]: data.inviteUrl }));
      setOpenId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve this request");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Admin"
        title="Waitlist"
        body="Approving a request creates a real account and a one-time invite link — copy it and send it to the person yourself (no email delivery is wired up yet)."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      <div className="overflow-x-auto border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-[11px] uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Requested as</th>
              <th className="px-4 py-3">Disclosure</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-line align-top">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.role}</td>
                <td className="px-4 py-3">{row.disclosureAccepted ? "yes" : "no"}</td>
                <td className="px-4 py-3">
                  {row.invitedAt ? (
                    <span className="text-muted">Invited</span>
                  ) : openId === row.id ? (
                    <form onSubmit={(e) => approve(e, row)} className="grid gap-2 text-xs">
                      <Field label="Role">
                        <select
                          name="role"
                          className={inputClass()}
                          defaultValue={ROLE_DEFAULT[row.role] ?? "FUNDER"}
                        >
                          <option value="OWNER">Owner</option>
                          <option value="FUNDER">Funder</option>
                          <option value="CARRIER">Carrier</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </Field>
                      <Field label="New organization (optional)" hint="Corporate CSR only">
                        <input name="organizationName" className={inputClass()} />
                      </Field>
                      <div className="flex gap-2">
                        <Button type="submit">Approve</Button>
                        <Button type="button" variant="ghost" onClick={() => setOpenId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button type="button" variant="ghost" onClick={() => setOpenId(row.id)}>
                      Approve
                    </Button>
                  )}
                  {inviteUrls[row.id] ? (
                    <div className="mt-2 flex max-w-sm items-center gap-2">
                      <input
                        readOnly
                        value={inviteUrls[row.id]}
                        className={inputClass("text-xs")}
                        onFocus={(e) => e.currentTarget.select()}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(inviteUrls[row.id])}
                      >
                        Copy
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
