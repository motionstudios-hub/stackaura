import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:3001";

export type AuthMeResponse = {
  user: { id: string; email: string };
  memberships: Array<{
    id: string;
    role: string;
    merchant: { id: string; name: string; email: string; isActive: boolean };
  }>;
};

export const getServerMe = cache(async (): Promise<AuthMeResponse | null> => {
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(`${API_BASE}/v1/auth/me`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`auth/me failed: ${res.status}`);

  return res.json();
});

export async function getServerMeSafe() {
  try {
    return await getServerMe();
  } catch {
    return null;
  }
}
