import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1120px] px-6", className)}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.22em] text-sand",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{kicker}</Eyebrow>
      <h2 className="mt-4 font-serif text-4xl leading-[1.15] tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-5 max-w-xl text-base leading-7 text-muted">{body}</p>
      ) : null}
    </div>
  );
}
