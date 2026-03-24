import { NextRequest, NextResponse } from "next/server";
import { fetchServerApi } from "@/app/lib/server-api";
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "stackaura_session";

function parseBooleanEnv(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return null;
}

function resolveSessionCookieSameSite() {
  const normalized = process.env.SESSION_COOKIE_SAME_SITE?.trim().toLowerCase();
  if (normalized === "strict" || normalized === "none") {
    return normalized;
  }

  return "lax";
}

function resolveSessionCookieSecure(sameSite: "lax" | "strict" | "none") {
  if (sameSite === "none") {
    return true;
  }

  const explicit = parseBooleanEnv(process.env.SESSION_COOKIE_SECURE);
  if (explicit !== null) {
    return explicit;
  }

  return process.env.NODE_ENV === "production";
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  try {
    await fetchServerApi("/v1/auth/logout", {
      method: "POST",
      headers: {
        Cookie: cookie,
      },
    });
  } catch {
    // Always clear the browser cookie locally even if the backend is unavailable.
  }

  const out = NextResponse.json({ ok: true });
  const sameSite = resolveSessionCookieSameSite();
  const secure = resolveSessionCookieSecure(sameSite);
  const domain = process.env.SESSION_COOKIE_DOMAIN?.trim() || undefined;

  // Clear browser cookie
  out.cookies.set(SESSION_COOKIE_NAME, "", {
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    sameSite,
    secure,
    ...(domain ? { domain } : {}),
  });

  return out;
}
