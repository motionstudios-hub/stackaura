import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { fetchServerApi, isBackendUnavailableError } from "./server-api";

export type AuthMeResponse = {
  user: { id: string; email: string };
  memberships: Array<{
    id: string;
    role: string;
    merchant: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
      planCode?: string;
      plan?: {
        code: string;
        source?: string;
        feeSource?: string;
        manualGatewaySelection: boolean;
        autoRouting: boolean;
        fallback: boolean;
      };
    };
  }>;
};

export const getServerMe = cache(async (): Promise<AuthMeResponse | null> => {
  const cookieHeader = (await cookies()).toString();
  let res: Response;
  try {
    res = await fetchServerApi("/v1/auth/me", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch (error) {
    if (isBackendUnavailableError(error)) {
      throw new Error("auth service unavailable");
    }
    throw error;
  }

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
