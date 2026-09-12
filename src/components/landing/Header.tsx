"use client";

import { useState } from "react";
import { Container } from "@/components/landing/primitives";
import { cn } from "@/lib/cn";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#markets", label: "Markets" },
  { href: "#proceeds", label: "If a trigger hits" },
  { href: "#access", label: "Request access" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center border border-sand/40 text-[11px] font-medium tracking-widest text-sand">
            F
          </span>
          <span className="text-sm font-medium tracking-[0.18em] uppercase">
            FiSure
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="/login"
          className="hidden border border-line px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-foreground md:inline-flex"
        >
          Sign in
        </a>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center border border-line text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className={cn(
              "absolute block h-px w-4 bg-foreground transition-transform",
              open ? "rotate-45" : "-translate-y-[4px]",
            )}
          />
          <span
            className={cn(
              "absolute block h-px w-4 bg-foreground transition-transform",
              open ? "-rotate-45" : "translate-y-[4px]",
            )}
          />
        </button>
      </Container>

      {open ? (
        <div className="border-t border-line bg-background md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="py-2 text-sm text-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href="/login" className="py-2 text-sm text-foreground" onClick={() => setOpen(false)}>
              Sign in
            </a>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
