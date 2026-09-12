"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  disclosureAccepted: boolean;
  createdAt: string;
};

export default function AdminWaitlist() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    api<{ waitlist: Row[] }>("/waitlist").then((data) => setRows(data.waitlist));
  }, []);

  return (
    <div>
      <PageTitle kicker="Admin" title="Waitlist" />
      <div className="overflow-x-auto border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-[11px] uppercase tracking-[0.16em] text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Disclosure</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.role}</td>
                <td className="px-4 py-3">{row.disclosureAccepted ? "yes" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
