const BASE = process.env.NEXT_PUBLIC_API_URL || "/backend";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  if (!isForm && init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Request failed");
  }
  return data;
}

export function homeForRole(role: string) {
  switch (role) {
    case "OWNER":
      return "/app/owner";
    case "FUNDER":
      return "/app/funder";
    case "CARRIER":
      return "/app/carrier";
    case "ADMIN":
      return "/app/admin";
    default:
      return "/app";
  }
}
