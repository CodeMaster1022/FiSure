import { cn } from "@/lib/cn";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      {label}
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function inputClass(extra?: string) {
  return cn(
    "border border-line bg-background px-3 py-2.5 text-foreground outline-none focus:border-sand",
    extra,
  );
}

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      {...props}
      className={cn(
        "border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        variant === "primary"
          ? "border-sand bg-sand text-background hover:bg-foreground"
          : "border-line text-foreground hover:border-foreground",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="border border-line bg-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-sand">{title}</p>
      <div className="mt-3 text-sm leading-6 text-muted">{children}</div>
    </aside>
  );
}
