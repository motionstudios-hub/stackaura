import { NextRequest, NextResponse } from "next/server";
import { buildServerApiUrl } from "@/app/lib/server-api";

function readAuthHeader(req: NextRequest) {
  return req.headers.get("authorization") ?? req.headers.get("Authorization");
}

async function passthroughJson(response: Response) {
  const text = await response.text();
  const out = new NextResponse(text, { status: response.status });
  out.headers.set(
    "content-type",
    response.headers.get("content-type") ?? "application/json",
  );
  return out;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const authorization = readAuthHeader(req);
  if (!authorization) {
    return NextResponse.json(
      { message: "Missing Shopify session token." },
      { status: 401 },
    );
  }

  const { sessionId } = await context.params;
  if (!sessionId?.trim()) {
    return NextResponse.json(
      { message: "Session ID is required." },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(
      buildServerApiUrl(
        `/v1/shopify/support-agent/conversations/${encodeURIComponent(sessionId)}`,
      ),
      {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the Stackaura backend." },
      { status: 503 },
    );
  }

  return passthroughJson(response);
}
