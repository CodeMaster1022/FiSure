"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";
import { Button, Field, Pagination, inputClass } from "@/components/ui/forms";

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
  const [sentMessages, setSentMessages] = useState<
    Record<string, { text: string; ok: boolean; inviteUrl?: string }>
  >({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  function load() {
    api<{ waitlist: Row[]; total: number }>(`/waitlist?page=${page}&pageSize=${pageSize}`)
      .then((data) => {
        setRows(data.waitlist);
        setTotal(data.total);
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

  async function approve(event: FormEvent<HTMLFormElement>, row: Row) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const organizationName = String(form.get("organizationName") ?? "").trim();
    try {
      const data = await api<{ emailSent: boolean; inviteUrl: string }>(`/waitlist/${row.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          role: form.get("role"),
          ...(organizationName ? { organizationName } : {}),
        }),
      });
      setSentMessages((prev) => ({
        ...prev,
        [row.id]: data.emailSent
          ? { text: `Invite emailed to ${row.email}.`, ok: true }
          : {
              text: `Account approved, but the invite email to ${row.email} failed to send — copy the link below and send it yourself.`,
              ok: false,
              inviteUrl: data.inviteUrl,
            },
      }));
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
        body="Approving a request creates a real account and emails a one-time invite link to the applicant automatically."
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
                  {sentMessages[row.id] ? (
                    <div className="mt-2">
                      <p className={`text-xs ${sentMessages[row.id].ok ? "text-teal" : "text-sand"}`}>
                        {sentMessages[row.id].text}
                      </p>
                      {sentMessages[row.id].inviteUrl ? (
                        <div className="mt-2 flex max-w-sm items-center gap-2">
                          <input
                            readOnly
                            value={sentMessages[row.id].inviteUrl}
                            className={inputClass("text-xs")}
                            onFocus={(e) => e.currentTarget.select()}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigator.clipboard.writeText(sentMessages[row.id].inviteUrl!)}
                          >
                            Copy
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
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
    </div>
  );
}
