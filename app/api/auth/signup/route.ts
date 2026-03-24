import { NextRequest, NextResponse } from "next/server";
import { fetchServerApi } from "@/app/lib/server-api";

export async function POST(req: NextRequest) {
  const body = await req.text();

  let res: Response;
  try {
    res = await fetchServerApi("/v1/merchants/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Signup service unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const responseBody = await res.text();
  const out = new NextResponse(responseBody, { status: res.status });
  out.headers.set("Content-Type", res.headers.get("Content-Type") || "application/json");
  return out;
}
