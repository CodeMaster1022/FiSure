"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homeForRole } from "@/lib/api";
import { useSessionUser } from "@/components/app/SessionProvider";

export default function AppHome() {
  const { user } = useSessionUser();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace(homeForRole(user.role));
  }, [user, router]);
  return <p className="text-sm text-muted">Opening your workspace…</p>;
}
