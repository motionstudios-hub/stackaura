import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:3001";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${API_BASE}/v1/auth/me`, {
    method: "GET",
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  const text = await res.text();
  const out = new NextResponse(text, { status: res.status });
  out.headers.set("Content-Type", res.headers.get("Content-Type") || "application/json");
  return out;
}