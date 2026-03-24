import { NextRequest, NextResponse } from "next/server";
import { fetchServerApi } from "@/app/lib/server-api";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";

  let res: Response;
  try {
    res = await fetchServerApi("/v1/auth/me", {
      method: "GET",
      headers: { Cookie: cookie },
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
  return out;
}
