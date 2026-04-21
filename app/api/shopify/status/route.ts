import { NextRequest, NextResponse } from "next/server";
import { buildServerApiUrl } from "@/app/lib/server-api";

function readAuthHeader(req: NextRequest) {
  return req.headers.get("authorization") ?? req.headers.get("Authorization");
}

function looksLikeHtmlDocument(value: string) {
  return /^\s*<!doctype html/i.test(value) || /^\s*<html/i.test(value);
}

async function passthroughJson(response: Response) {
  const text = await response.text();
  if (looksLikeHtmlDocument(text)) {
    return NextResponse.json(
      { message: "Shopify status returned HTML instead of JSON." },
      { status: 502 },
    );
  }

  const out = new NextResponse(text, { status: response.status });
  out.headers.set("content-type", response.headers.get("content-type") ?? "application/json");
  return out;
}

export async function GET(req: NextRequest) {
  const authorization = readAuthHeader(req);
  if (!authorization) {
    return NextResponse.json(
      { message: "Missing Shopify session token." },
      { status: 401 }
    );
  }

  const headers = new Headers({
    accept: "application/json",
    authorization,
  });

  let shopResponse: Response;
  try {
    shopResponse = await fetch(buildServerApiUrl("/shopify/shop"), {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the Stackaura backend." },
      { status: 503 }
    );
  }

  if (!shopResponse.ok) {
    return passthroughJson(shopResponse);
  }

  const shop = (await shopResponse.json()) as Record<string, unknown>;
  return NextResponse.json(shop);
}
