import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:3001";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  await fetch(`${API_BASE}/v1/auth/logout`, {
    method: "POST",
    headers: {
      Cookie: cookie,
    },
  });

  const out = NextResponse.json({ ok: true });

  // Clear browser cookie
  out.cookies.set("stackaura_session", "", {
    path: "/",
    expires: new Date(0),
  });

  return out;
}
