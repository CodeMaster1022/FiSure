import { ApiError, handleMock } from "@/lib/mock/store";

export { ApiError };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return (await handleMock(path, init)) as T;
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
