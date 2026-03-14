import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.CHECKOUT_API_URL ?? "http://127.0.0.1:3001";
const API_KEY = process.env.DASHBOARD_API_KEY ?? "";

type Ctx = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

async function getPath(ctx: Ctx) {
  const params = await Promise.resolve(ctx.params);
  return (params?.path ?? []).join("/");
}

function forwardHeaders(req: NextRequest) {
  const h = new Headers();
  h.set("accept", "application/json");

  const ct = req.headers.get("content-type");
  if (ct) h.set("content-type", ct);

  if (API_KEY) h.set("authorization", `Bearer ${API_KEY}`);
  return h;
}

async function proxy(req: NextRequest, ctx: Ctx, method: string) {
  const path = await getPath(ctx);
  const url = new URL(req.url);
  const target = `${API_BASE}/${path}${url.search}`;

  const res = await fetch(target, {
    method,
    headers: forwardHeaders(req),
    body: method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer(),
  });

  const body = await res.arrayBuffer();
  const outHeaders = new Headers();
  outHeaders.set("content-type", res.headers.get("content-type") ?? "application/json");

  return new NextResponse(body, { status: res.status, headers: outHeaders });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx, "GET");
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx, "POST");
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx, "PATCH");
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx, "PUT");
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, ctx, "DELETE");
}