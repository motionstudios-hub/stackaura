import { NextRequest, NextResponse } from "next/server";
import { buildServerApiUrl } from "@/app/lib/server-api";

function forwardHeaders(req: NextRequest) {
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  for (const name of [
    "x-shopify-hmac-sha256",
    "x-shopify-topic",
    "x-shopify-shop-domain",
    "x-shopify-api-version",
    "x-shopify-webhook-id",
    "x-shopify-triggered-at",
  ]) {
    const value = req.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.arrayBuffer();

  let res: Response;
  try {
    res = await fetch(buildServerApiUrl("/shopify/webhooks"), {
      method: "POST",
      headers: forwardHeaders(req),
      body: rawBody,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the Stackaura backend." },
      { status: 503 }
    );
  }

  const body = await res.arrayBuffer();
  const out = new NextResponse(body, { status: res.status });
  out.headers.set("content-type", res.headers.get("content-type") ?? "application/json");
  return out;
}
