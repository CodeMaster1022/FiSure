"use client";

import { useEffect, useState } from "react";
import { api, API_URL } from "@/lib/api";
import { PageTitle } from "@/components/app/ui";

type Document = {
  id: string;
  kind: string;
  filename: string;
  createdAt: string;
};

const KIND_LABEL: Record<string, string> = {
  DEED: "Deed",
  MORTGAGE: "Mortgage",
  CONDITION_REPORT: "Condition report",
  FILE_PACK: "Carrier submission pack",
  QUOTE: "Quote",
  POLICY: "Policy document",
  REMITTANCE: "Remittance instruction",
  PAYOUT_INSTRUCTION: "Payout instruction",
  TAX_DOCUMENT: "Tax record",
  OTHER: "Other",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ documents: Document[] }>("/documents/mine")
      .then((data) => setDocuments(data.documents))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <PageTitle
        kicker="Records"
        title="Your documents"
        body="Submission packs, policies, payout instructions, and tax records tied to your properties or contributions."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      <div className="grid gap-px bg-line">
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={`${API_URL}/documents/${doc.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-wrap items-center justify-between gap-4 bg-background px-5 py-4 hover:bg-surface"
          >
            <div>
              <p className="font-serif text-lg">{doc.filename}</p>
              <p className="mt-1 text-sm text-muted">
                {KIND_LABEL[doc.kind] ?? doc.kind} · {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="text-sm text-muted underline">Download</span>
          </a>
        ))}
        {documents.length === 0 ? (
          <p className="bg-background px-5 py-8 text-sm text-muted">No documents yet.</p>
        ) : null}
      </div>
    </div>
  );
}
