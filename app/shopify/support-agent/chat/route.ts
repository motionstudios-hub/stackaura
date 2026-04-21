import { NextRequest, NextResponse } from "next/server";
import { buildServerApiUrl } from "@/app/lib/server-api";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function passthroughJson(response: Response) {
  const text = await response.text();
  const out = new NextResponse(text, { status: response.status });
  out.headers.set("content-type", response.headers.get("content-type") ?? "application/json");
  return withCors(out);
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();

  let response: Response;
  try {
    response = await fetch(buildServerApiUrl("/shopify/support-agent/chat"), {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: bodyText,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return withCors(
      NextResponse.json(
        { message: "Unable to reach the Stackaura backend." },
        { status: 503 },
      ),
    );
  }

  return passthroughJson(response);
}
