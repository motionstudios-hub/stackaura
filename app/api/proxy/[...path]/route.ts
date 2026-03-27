import { NextRequest, NextResponse } from "next/server";
import { buildServerApiUrl } from "@/app/lib/server-api";

const ALLOWED_PROXY_ROUTES = [
  { method: "GET", pattern: /^v1\/merchants\/[^/]+\/api-keys$/ },
  { method: "POST", pattern: /^v1\/merchants\/[^/]+\/api-keys$/ },
  { method: "POST", pattern: /^v1\/merchants\/[^/]+\/api-keys\/[^/]+\/revoke$/ },
  { method: "GET", pattern: /^v1\/merchants\/[^/]+\/gateways\/(?:ozow|yoco|paystack)$/ },
  { method: "POST", pattern: /^v1\/merchants\/[^/]+\/gateways\/(?:ozow|yoco|paystack)$/ },
  { method: "POST", pattern: /^v1\/merchants\/[^/]+\/gateways\/paystack\/test-connection$/ },
  { method: "GET", pattern: /^v1\/support\/conversations$/ },
  { method: "GET", pattern: /^v1\/support\/conversations\/[^/]+$/ },
  { method: "POST", pattern: /^v1\/support\/chat$/ },
  { method: "POST", pattern: /^v1\/support\/conversations\/[^/]+\/escalate$/ },
] as const;

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function getPath(ctx: RouteContext) {
  const params = await ctx.params;
  return (params?.path ?? []).join("/");
}

function forwardHeaders(req: NextRequest) {
  const h = new Headers();
  h.set("accept", "application/json");

  const ct = req.headers.get("content-type");
  if (ct) h.set("content-type", ct);

  const cookie = req.headers.get("cookie");
  if (cookie) h.set("cookie", cookie);
  return h;
}

function normalizeProxyPath(path: string) {
  return path.replace(/^\/+|\/+$/g, "");
}

function isAllowedProxyRoute(method: string, path: string) {
  return ALLOWED_PROXY_ROUTES.some(
    (route) => route.method === method && route.pattern.test(path)
  );
}

async function proxy(req: NextRequest, ctx: RouteContext, method: string) {
  const path = normalizeProxyPath(await getPath(ctx));
  if (!isAllowedProxyRoute(method, path)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const target = `${buildServerApiUrl(path)}${url.search}`;
  let res: Response;
  try {
    res = await fetch(target, {
      method,
      headers: forwardHeaders(req),
      body: method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer(),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return NextResponse.json(
      { message: "Service unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const body = await res.arrayBuffer();
  const outHeaders = new Headers();
  outHeaders.set("content-type", res.headers.get("content-type") ?? "application/json");

  return new NextResponse(body, { status: res.status, headers: outHeaders });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx, "GET");
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx, "POST");
}
