import { NextRequest, NextResponse } from "next/server";
import { fetchServerApi } from "@/app/lib/server-api";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const cookie = req.headers.get("cookie") || "";

  let res: Response;
  try {
    res = await fetchServerApi("/payments/ozow/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Payment service unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const responseBody = await res.arrayBuffer();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
