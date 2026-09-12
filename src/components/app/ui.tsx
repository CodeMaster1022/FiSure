import { STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("border border-line px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted")}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PageTitle({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.22em] text-sand">{kicker}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{title}</h1>
      {body ? <p className="mt-3 text-sm leading-6 text-muted">{body}</p> : null}
    </div>
  );
}
