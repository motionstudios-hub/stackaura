import { NextRequest, NextResponse } from "next/server";
import { buildServerApiUrl } from "@/app/lib/server-api";

function readAuthHeader(req: NextRequest) {
  return req.headers.get("authorization") ?? req.headers.get("Authorization");
}

export async function POST(req: NextRequest) {
  const authorization = readAuthHeader(req);
  if (!authorization) {
    return NextResponse.json(
      { message: "Missing Shopify session token." },
      { status: 401 }
    );
  }

  let res: Response;
  try {
    res = await fetch(buildServerApiUrl("/shopify/register-webhooks"), {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization,
      },
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
