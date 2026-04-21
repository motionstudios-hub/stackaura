import { NextResponse } from "next/server";
import { buildServerApiUrl } from "@/app/lib/server-api";

export async function GET() {
  let res: Response;
  try {
    res = await fetch(buildServerApiUrl("/shopify/health"), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the Stackaura backend." },
      { status: 503 }
    );
  }

  const text = await res.text();
  const out = new NextResponse(text, { status: res.status });
  out.headers.set("content-type", res.headers.get("content-type") ?? "application/json");
  return out;
}
