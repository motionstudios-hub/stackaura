import { NextRequest, NextResponse } from "next/server";
import { fetchServerApi } from "@/app/lib/server-api";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  let res: Response;
  try {
    res = await fetchServerApi("/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Authentication service unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const text = await res.text();

  const out = new NextResponse(text, { status: res.status });
  out.headers.set("Content-Type", res.headers.get("Content-Type") || "application/json");

  // ✅ Forward Set-Cookie from Nest -> Browser
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) out.headers.set("set-cookie", setCookie);

  return out;
}
